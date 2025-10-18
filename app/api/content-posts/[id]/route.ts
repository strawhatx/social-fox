
export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db/prisma";
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

//
// --- GET
//
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) return json({ error: "User not found" }, { status: 404 });

    const row = await prisma.contentPost.findFirst({ where: { id: params.id, userId: appUserId } });
    if (!row) return json({ error: "Not found" }, { status: 404 });

    return json({ data: row });
  } catch (error) {
    console.error("Error fetching content_post:", error);
    return json({ error: "Internal server error" }, { status: 500 });
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
    const { scheduled_at, items } = await req.json();

    const current = await prisma.contentPost.findFirst({ where: { id, userId: appUserId } });
    if (!current) return json({ error: "Post not found" }, { status: 404 });

    // Update scheduled time if provided
    if (scheduled_at) {
      await prisma.contentPost.update({ 
        where: { id, userId: appUserId }, 
        data: { scheduledAt: new Date(scheduled_at) } 
      });
    }

    // Replace items if provided
    if (items) {
      // Load existing items and collect existing keys
      const existingItems: Array<{ id: string; metadata: unknown }> = 
      await (prisma as any).contentPostItem.findMany({ where: { postId: id } });
      const existingKeys = new Set<string>();
      for (const it of existingItems) {
        try {
          const md = (it.metadata as any) || {};
          const atts = Array.isArray(md.attachments) ? md.attachments : [];
          for (const a of atts) if (a?.key) existingKeys.add(a.key);
        } catch {}
      }

      const incomingKeys = new Set<string>();
      for (const it of items) {
        for (const a of (it.attachments || [])) if (a?.key) incomingKeys.add(a.key);
      }

      const keysToDelete = Array.from(existingKeys).filter((k) => !incomingKeys.has(k));
      if (keysToDelete.length) {
        const REGION = process.env.NEXT_AWS_REGION || process.env.NEXT_AWS_DEFAULT_REGION;
        const BUCKET = process.env.NEXT_AWS_S3_BUCKET;
        if (REGION && BUCKET) {
          const s3 = new S3Client({ region: REGION });
          await Promise.all(keysToDelete.map((key) => s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))));
        }
      }

      // Replace items transactionally
      await prisma.$transaction(async (tx) => {
        await (tx as any).contentPostItem.deleteMany({ where: { postId: id } });
        let parentId: string | null = null;
        for (const it of items) {
          const created: any = await (tx as any).contentPostItem.create({
            data: {
              postId: id,
              parentId: parentId,
              content: (it.content || '').trim(),
              media: [],
              metadata: { attachments: (it.attachments || []).map((a: any) => ({ url: a.url, type: a.type, key: a.key })) },
            },
          });
          parentId = created.id;
        }
      });
    }

    const updated = await prisma.contentPost.findFirst({ where: { id, userId: appUserId } });
    return json({ data: updated });
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
