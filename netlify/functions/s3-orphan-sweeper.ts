import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, GetObjectTaggingCommand, PutObjectTaggingCommand, _Object } from '@aws-sdk/client-s3';
import { prisma } from '../../lib/db/prisma';

export const config = {
  schedule: '@daily',
};

type NetlifyHandler = (event: any, context: any) => Promise<{ statusCode: number; body: string }>;

const REGION = process.env.NEXT_AWS_REGION || process.env.NEXT_AWS_DEFAULT_REGION;
const BUCKET = process.env.NEXT_AWS_S3_BUCKET;
const PREFIX = process.env.NEXT_AWS_S3_UPLOAD_PREFIX || 'uploads/';
const MIN_AGE_HOURS = Number(process.env.S3_SWEEP_MIN_AGE_HOURS || 24);

function isOldEnough(obj: _Object): boolean {
  if (!obj.LastModified) return true;
  const ageMs = Date.now() - new Date(obj.LastModified).getTime();
  return ageMs > MIN_AGE_HOURS * 60 * 60 * 1000;
}

async function collectReferencedKeys(): Promise<Set<string>> {
  const referenced = new Set<string>();
  const pageSize = 500;
  let cursor: string | undefined = undefined;

  for (;;) {
    const items: Array<{ id: string; media: unknown; metadata: unknown }> = await (prisma as any).contentPostItem.findMany({
      select: { id: true, media: true, metadata: true },
      take: pageSize,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: 'asc' },
    });

    if (!items || items.length === 0) break;

    for (const it of items) {
      try {
        const media = (it.media as any) || [];
        if (Array.isArray(media)) {
          for (const m of media) {
            const key: string | undefined = m?.key;
            if (key) referenced.add(key);
          }
        }
      } catch {}

      try {
        const md = (it.metadata as any) || {};
        const attachments = Array.isArray(md?.attachments) ? md.attachments : [];
        for (const a of attachments) {
          const key: string | undefined = a?.key;
          if (key) referenced.add(key);
        }
      } catch {}
    }

    cursor = items[items.length - 1].id;
  }

  return referenced;
}

async function listAllObjects(s3: S3Client, bucket: string, prefix: string): Promise<_Object[]> {
  const all: _Object[] = [];
  let token: string | undefined = undefined;
  do {
    const resp: any = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }));
    if (resp.Contents) all.push(...resp.Contents);
    token = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (token);
  return all;
}

async function deleteInBatches(s3: S3Client, bucket: string, keys: string[]): Promise<void> {
  const chunkSize = 900; // below 1000 limit
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: chunk.map((Key) => ({ Key })) },
      })
    );
  }
}

const handler: NetlifyHandler = async () => {
  if (!REGION || !BUCKET) {
    return { statusCode: 500, body: 'S3 not configured' };
  }

  const s3 = new S3Client({ region: REGION });

  const [referencedKeys, allObjects] = await Promise.all([
    collectReferencedKeys(),
    listAllObjects(s3, BUCKET, PREFIX),
  ]);

  const candidates = allObjects.filter((o) => !!o.Key && isOldEnough(o)) as Required<Pick<_Object, 'Key'>>[];
  const toDelete: string[] = [];
  for (const o of candidates) {
    const key = o.Key!;
    if (referencedKeys.has(key)) continue;
    try {
      const tags = await s3.send(new GetObjectTaggingCommand({ Bucket: BUCKET, Key: key }));
      const map = new Map((tags.TagSet || []).map(t => [t.Key, t.Value] as [string, string]));
      const status = (map.get('status') || '').toLowerCase();
      if (status === 'final') continue;
      toDelete.push(key);
    } catch {
      toDelete.push(key);
    }
  }

  if (toDelete.length > 0) {
    await deleteInBatches(s3, BUCKET, toDelete);
  }

  return { statusCode: 200, body: JSON.stringify({ deleted: toDelete.length, scanned: allObjects.length, referenced: referencedKeys.size }) };
};

export default handler;


