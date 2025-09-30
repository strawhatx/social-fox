import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const PUBLIC_BASE = process.env.AWS_S3_PUBLIC_BASE_URL; // optional override

const s3 = new S3Client({ region: REGION });

export async function POST(req: NextRequest) {
  try {
    if (!REGION || !BUCKET) {
      return NextResponse.json({ error: 'S3 not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files');
    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedFiles: { url: string, type: string }[] = [];
    for (const item of files) {
      if (!(item instanceof File)) continue;
      const arrayBuffer = await item.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${item.name || 'file'}`;

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: item.type,
      }));

      const publicUrl = PUBLIC_BASE
        ? `${PUBLIC_BASE}/${key}`
        : `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

      uploadedFiles.push({ url: publicUrl, type: item.type });
    }

    return NextResponse.json({ uploadedFiles });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
}
