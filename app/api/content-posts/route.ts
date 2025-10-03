
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const dynamic = 'force-dynamic';

/** Utility: JSON response */
function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

/** Utility: Attachment type checks */
const norm = (t?: string) => (t || '').toLowerCase();
const isVideo = (t: string) => norm(t).startsWith('video/');
const isGif = (t: string) => {
  const v = norm(t);
  return v === 'image/gif' || v === 'gif' || v.endsWith('/gif');
};
const isImage = (t: string) => norm(t).startsWith('image/') && !isGif(t);

/** Utility: Select valid attachments */
function sanitizeAttachments(
  existing: Array<{ url: string; type: string; key?: string }>,
  fileMetas: Array<{ type: string; index: number }>
) {
  // GIF: take first across existing then files
  const gifExisting = existing.find((a) => isGif(a.type));
  if (gifExisting) return { useExisting: [gifExisting], useFiles: [] };
  const gifFileIdx = fileMetas.findIndex((f) => isGif(f.type));
  if (gifFileIdx !== -1) return { useExisting: [], useFiles: [gifFileIdx] };

  // Video: take first across existing then files
  const vidExisting = existing.find((a) => isVideo(a.type));
  if (vidExisting) return { useExisting: [vidExisting], useFiles: [] };
  const vidFileIdx = fileMetas.findIndex((f) => isVideo(f.type));
  if (vidFileIdx !== -1) return { useExisting: [], useFiles: [vidFileIdx] };

  // Images: take first 4 across existing then files
  const imgExisting = existing.filter((a) => isImage(a.type));
  const slots = Math.max(0, 4 - imgExisting.length);
  const imgFileIdxs = fileMetas
    .map((f, i) => ({ i, f }))
    .filter(({ f }) => isImage(f.type))
    .slice(0, slots)
    .map(({ i }) => i);

  return { useExisting: imgExisting.slice(0, 4), useFiles: imgFileIdxs };
}

/** Utility: Create content_post */
async function createPost(appUserId: string, params: {
  content: string;
  platform?: string;
  status?: string;
  scheduled_at?: string;
  attachments?: any[];
  communityUrl?: string | null;
}) {
  const { content, platform = 'twitter', status = 'draft', scheduled_at, attachments = [], communityUrl } = params;

  if (!content.trim()) throw new Error('Content is required');

  return prisma.contentPost.create({
    data: {
      userId: appUserId,
      content: content.trim(),
      platform,
      status: scheduled_at ? 'scheduled' : status,
      scheduledAt: scheduled_at ? new Date(scheduled_at) : null,
      metadata: {
        attachments,
        community_url: communityUrl || null,
      },
    },
  });
}

/** GET: list posts */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const url = new URL(req.url);
    const status = url.searchParams.get('status') ?? undefined;

    const posts = await prisma.contentPost.findMany({
      where: { userId: appUserId, ...(status && { status }) },
      orderBy: [{ scheduledAt: { sort: 'asc', nulls: 'last' } }],
    });

    return json({ data: posts });
  } catch (err) {
    console.error('Error listing content_posts:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST: create post (multipart or JSON) */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: 'User not found' }, { status: 404 });

    const contentType = req.headers.get('content-type') || '';

    // Handle multipart (attachments upload)
    if (contentType.includes('multipart/form-data')) {
      const form = await (req as any).formData();

      const content = (form.get('content') as string) || '';
      const platform = (form.get('platform') as string) || 'twitter';
      const scheduled_at = (form.get('scheduled_at') as string) || '';
      const status = (form.get('status') as string) || 'draft';
      const communityUrl = (form.get('communityUrl') as string) || null;

      if (!content.trim()) return json({ error: 'Content is required' }, { status: 400 });

      // Accept pre-existing attachments (e.g., GIF URLs) alongside new files
      const attachmentsRaw = (form.get('attachments') as string) || '[]';
      let existing: Array<{ url: string; type: string; key?: string }> = [];
      try { existing = JSON.parse(attachmentsRaw); } catch {}

      const files = form.getAll('files').filter((f: unknown) => f instanceof File) as File[];
      const fileMetas = files.map((f, idx) => ({ type: f.type || '', index: idx }));

      const pick = sanitizeAttachments(existing, fileMetas);

      let uploaded: Array<{ url: string; type: string; key: string }> = [];
      if (pick.useFiles.length) {
        const REGION = process.env.NEXT_AWS_REGION || process.env.NEXT_AWS_DEFAULT_REGION;
        const BUCKET = process.env.NEXT_AWS_S3_BUCKET;
        if (!REGION || !BUCKET) return json({ error: 'S3 not configured' }, { status: 500 });

        const s3 = new S3Client({ region: REGION });

        uploaded = await Promise.all(
          pick.useFiles.map(async (idx) => {
            const file = files[idx];
            const buffer = Buffer.from(await file.arrayBuffer());
            const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name || 'file'}`;
            await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: file.type }));
            return { url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`, type: file.type || '', key };
          })
        );
      }

      const result = await createPost(appUserId, {
        content,
        platform,
        scheduled_at,
        status,
        attachments: [...pick.useExisting, ...uploaded],
        communityUrl,
      });

      return json({ data: result }, { status: 201 });
    }

    // Handle JSON
    const body = await req.json();
    const { content, platform, scheduled_at, status, attachments = [], communityUrl } = body;

    // Validate attachments
    const vids = attachments.filter((a: any) => isVideo(a?.type)).length;
    const gifs = attachments.filter((a: any) => isGif(a?.type)).length;
    const imgs = attachments.filter((a: any) => isImage(a?.type)).length;

    if ((vids + gifs > 1) || (vids + gifs === 1 && imgs > 0) || (vids + gifs === 0 && !(imgs >= 1 && imgs <= 4))) {
      return json({ error: 'Invalid attachments' }, { status: 400 });
    }

    const result = await createPost(appUserId, { content, platform, scheduled_at, status, attachments, communityUrl });
    return json({ data: result }, { status: 201 });
  } catch (err) {
    console.error('Error creating content_post:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}