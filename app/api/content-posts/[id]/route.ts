
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { resolveUserUuid } from "@/lib/db";

//
// --- Utils
//
function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const s3 = REGION && BUCKET ? new S3Client({ region: REGION }) : null;

const norm = (t?: string) => (t || '').toLowerCase();
const isVideo = (t: string) => norm(t).startsWith('video/');
const isGif = (t: string) => {
  const v = norm(t);
  return v === 'image/gif' || v === 'gif' || v.endsWith('/gif');
};
const isImage = (t: string) => norm(t).startsWith('image/') && !isGif(t);

function validateAttachments(list: Array<{ type: string }>): boolean {
  // Allow text-only updates with no attachments
  if (!list || list.length === 0) return true;

  const vids = list.filter((a) => isVideo(a.type)).length;
  const gifs = list.filter((a) => isGif(a.type)).length;
  const imgs = list.filter((a) => isImage(a.type)).length;

  if (vids + gifs > 1) return false;
  if (vids + gifs === 1) return imgs === 0;
  return imgs >= 0 && imgs <= 4;
}

function sanitizeAttachments(
  desired: Array<{ url: string; type: string; key?: string }>,
  fileMetas: Array<{ type: string; index: number }>
) {
  // GIF: take first across desired then files; discard rest
  const gifDesired = desired.find((a) => isGif(a.type));
  if (gifDesired) return { useExisting: [gifDesired], useFiles: [] };
  const gifFileIdx = fileMetas.findIndex((f) => isGif(f.type));
  if (gifFileIdx !== -1) return { useExisting: [], useFiles: [gifFileIdx] };

  // Video: take first across desired then files
  const vidDesired = desired.find((a) => isVideo(a.type));
  if (vidDesired) return { useExisting: [vidDesired], useFiles: [] };
  const vidFileIdx = fileMetas.findIndex((f) => isVideo(f.type));
  if (vidFileIdx !== -1) return { useExisting: [], useFiles: [vidFileIdx] };

  // Images: take first 4 across desired then files
  const imgDesired = desired.filter((a) => isImage(a.type));
  const slots = Math.max(0, 4 - imgDesired.length);
  const imgFileIdxs = fileMetas
    .map((f, i) => ({ i, f }))
    .filter(({ f }) => isImage(f.type))
    .slice(0, slots)
    .map(({ i }) => i);

  return { useExisting: imgDesired.slice(0, 4), useFiles: imgFileIdxs };
}

async function uploadToS3(file: File) {
  if (!s3 || !REGION || !BUCKET) throw new Error("S3 not configured");

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name || "file"}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type
    })
  );

  return {
    url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
    type: file.type || "",
    key,
  };
}

async function deleteFromS3(key: string) {
  if (s3 && BUCKET) {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  }
}

//
// --- PATCH
//
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: "User not found" }, { status: 404 });

    const id = params.id;
    const contentType = req.headers.get("content-type") || "";

    //
    // Multipart form: includes attachments
    //
    if (contentType.includes("multipart/form-data")) {
      const form = await (req as any).formData();

      const content = form.get("content") as string | null;
      const platform = form.get("platform") as string | null;
      const status = form.get("status") as string | null;
      const scheduled_at = form.get("scheduled_at") as string | null;
      const communityUrl = form.get("communityUrl") as string | null;

      let desired: Array<{ url: string; type: string; key?: string }> = [];
      try {
        desired = JSON.parse((form.get("attachments") as string) || "[]");
      } catch {}

      const current = await prisma.contentPost.findFirst({ where: { id, userId: appUserId } });
      if (!current) return json({ error: "Post not found" }, { status: 404 });

      const currentAttachments: Array<{ url: string; type: string; key?: string }> =
        (current.metadata as any)?.attachments || [];

      const files = form.getAll("files").filter((f: unknown) => f instanceof File) as File[];
      const fileMetas = files.map((f, idx) => ({ type: f.type || "", index: idx }));

      const pick = sanitizeAttachments(desired, fileMetas);

      // Build final: keep everything the user asked for (desired) and add newly uploaded files
      const desiredSelected = [...pick.useExisting];
      const uploaded = await Promise.all(pick.useFiles.map((idx) => uploadToS3(files[idx])));
      const finalAttachments = [...desiredSelected, ...uploaded];

      // Remove anything that was previously saved but not in the new final list
      const toRemove = currentAttachments.filter(
        (c) => !finalAttachments.some((n) => (n.key && c.key && n.key === c.key) || n.url === c.url)
      );
      await Promise.all(toRemove.map((r) => r.key && deleteFromS3(r.key)));
      if (!validateAttachments(finalAttachments)) {
        return json({ error: "Invalid attachments" }, { status: 400 });
      }

      // Update record
      const updateData: Record<string, any> = {
        metadata: { ...(current.metadata as any), attachments: finalAttachments },
      };
      if (content !== null) updateData.content = content.trim();
      if (platform !== null) updateData.platform = platform;
      if (status !== null) updateData.status = scheduled_at ? "scheduled" : status;
      if (scheduled_at !== null) updateData.scheduledAt = scheduled_at ? new Date(scheduled_at) : null;
      if (communityUrl !== null) updateData.metadata.community_url = communityUrl;

      await prisma.contentPost.updateMany({ where: { id, userId: appUserId }, data: updateData });
      const row = await prisma.contentPost.findFirst({ where: { id, userId: appUserId } });

      return json({ data: row });
    }

    //
    // JSON body: simple updates
    //
    const body = await req.json();
    if (Object.keys(body).length === 0) return json({ error: "No updates provided" }, { status: 400 });

    const allowedFields = ["content", "platform", "status", "scheduledAt", "postedAt", "engagement", "metadata"];
    const updateData: Record<string, any> = {};
    for (const key of Object.keys(body)) if (allowedFields.includes(key)) updateData[key] = body[key];

    if (Object.keys(updateData).length === 0) return json({ error: "No valid updates provided" }, { status: 400 });

    await prisma.contentPost.updateMany({ where: { id, userId: appUserId }, data: updateData });
    const row = await prisma.contentPost.findFirst({ where: { id, userId: appUserId } });

    return json({ data: row });
  } catch (error) {
    console.error("Error updating content_post:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

//
// --- DELETE
//
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: "User not found" }, { status: 404 });

    await prisma.contentPost.deleteMany({ where: { id: params.id, userId: appUserId } });
    return json({ success: true });
  } catch (error) {
    console.error("Error deleting content_post:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
