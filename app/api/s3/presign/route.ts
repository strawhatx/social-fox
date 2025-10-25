import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

const REGION = process.env.MY_AWS_REGION || process.env.MY_AWS_DEFAULT_REGION;
const BUCKET = process.env.MY_AWS_S3_BUCKET;

const s3 = REGION ? new S3Client({ region: REGION }) : null;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return json({ error: "Unauthorized" }, { status: 401 });

    if (!s3 || !REGION || !BUCKET) {
      return json({ error: "S3 not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const contentType: string = body?.contentType || "application/octet-stream";
    const fileName: string = body?.fileName || "file";

    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName}`;

    const uploadedAt = Date.now().toString();
    const tagging = `status=temp&uploadedAt=${uploadedAt}`;

    const { url, fields } = await createPresignedPost(s3, {
      Bucket: BUCKET,
      Key: key,
      Conditions: [["content-length-range", 0, 50 * 1024 * 1024]], // up to 50MB
      Fields: {
        "Content-Type": contentType,
        "x-amz-tagging": tagging,
      },
      Expires: 60, // seconds
    });

    const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    return json({ url, fields, key, publicUrl, tagging });
  } catch (err) {
    console.error("Error creating presigned post:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}


