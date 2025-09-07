import { getDb } from '../config/db';

export type JobRow = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  action?: 'profile' | 'posts' | 'tweets' | null;
};

export async function getPendingJob(): Promise<JobRow | null> {
  const db = getDb();
  const res = await db.query<JobRow>(
    `SELECT id, user_id, status, created_at, action
     FROM public.app_jobs
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT 1`
  );
  await db.end();
  return res.rows[0] || null;
}

export async function updateJobStatus(jobId: string, nextStatus: string, expectedCurrent: string): Promise<boolean> {
  const db = getDb();
  const res = await db.query(
    `UPDATE public.app_jobs
     SET status = $1, updated_at = NOW(), started_at = CASE WHEN $1 = 'processing' THEN NOW() ELSE started_at END
     WHERE id = $2 AND status = $3`,
    [nextStatus, jobId, expectedCurrent]
  );
  await db.end();
  return (res.rowCount ?? 0) > 0;
}

export async function completeJob(jobId: string): Promise<void> {
  const db = getDb();
  await db.query(
    `UPDATE public.app_jobs
     SET status = 'completed', updated_at = NOW()
     WHERE id = $1`,
    [jobId]
  );
  await db.end();
}

export async function failJob(jobId: string, errorMessage: string): Promise<void> {
  const db = getDb();
  await db.query(
    `UPDATE public.app_jobs
     SET status = 'error', error = $2, updated_at = NOW()
     WHERE id = $1`,
    [jobId, errorMessage?.slice(0, 1000) || 'Unknown error']
  );
  await db.end();
}


