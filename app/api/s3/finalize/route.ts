import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { S3Client, PutObjectTaggingCommand } from "@aws-sdk/client-s3";

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

const REGION = process.env.NEXT_AWS_REGION || process.env.NEXT_AWS_DEFAULT_REGION;
const BUCKET = process.env.NEXT_AWS_S3_BUCKET;
const s3 = REGION ? new S3Client({ region: REGION }) : null;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    if (!s3 || !REGION || !BUCKET) {
      return json({ error: "S3 not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    let key: string | undefined = body?.key;
    const url: string | undefined = body?.url;
    if (!key && url) {
      try {
        const u = new URL(url);
        key = u.pathname.replace(/^\//, "");
      } catch {}
    }
    if (!key) return json({ error: "Key or URL is required" }, { status: 400 });

    await s3.send(new PutObjectTaggingCommand({
      Bucket: BUCKET,
      Key: key,
      Tagging: { TagSet: [
        { Key: 'status', Value: 'final' },
      ] },
    }));

    return json({ ok: true });
  } catch (err) {
    console.error("Error finalizing S3 object:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}


