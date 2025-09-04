
import { ScheduledHandler } from 'aws-lambda';
import { getPendingJob, updateJobStatus, completeJob, failJob, JobRow } from './services/jobs';
import { getCacheForUser, upsertProfileCache, updatePostsCache } from './services/cache';
import { getUserTwitterFromClerk } from './config/clerk';
import { fetchTwitterProfileByHandle, fetchTwitterPostsByUserId } from './services/twitter';


/**
 * Main handler function for processing metadata sync jobs
 * This function is triggered by AWS EventBridge on a schedule
 * 
 * The process flow:
 * 1. Check for pending metadata sync jobs
 * 2. Update job status to "processing" (with optimistic locking)
 * 3. Retrieve connection configuration
 * 4. Process data sources (databases)
 * 5. Process tables and fields for each source
 * 6. Update job status to "completed"
 * 7. Handle errors with rollback if needed
 */
export const processJobs: ScheduledHandler = async () => {
  // Track job and connection IDs for error handling and rollback
  let currentJobId: string | undefined;

  try {
    // Check if there are any pending metadata sync jobs in the queue
    const job = await getPendingJob();

    if (!job) {
      console.log("No pending jobs found");
      return;
    }

    currentJobId = job.id;

    // Use optimistic locking to ensure only one Lambda processes this job
    // If another Lambda already picked up the job, this will return false
    const updated = await updateJobStatus(currentJobId, "processing", "pending");
    if (!updated) {
      console.log("Job was picked up by another Lambda");
      return;
    }

    // Determine action(s) strictly from the job
    const cache = await getCacheForUser(job.user_id);
    const actions: Array<'profile' | 'posts'> = job.action ? [job.action] : ['profile', 'posts'];

    // Resolve Twitter auth from Clerk or fallback
    const { handle: clerkHandle, bearer } = await getUserTwitterFromClerk(job.user_id);
    if (!bearer) throw new Error('Missing Twitter bearer token');

    let effectiveHandle = clerkHandle || cache?.handle || null;
    let twitterUserId = cache?.twitter_user_id || null;

    // Fetch profile if needed (or if we need user id)
    if (actions.includes('profile') || !twitterUserId || !effectiveHandle) {
      if (!effectiveHandle) throw new Error('Missing twitter handle');
      const profilePayload = await fetchTwitterProfileByHandle(effectiveHandle, bearer);
      await upsertProfileCache(job.user_id, profilePayload);
      twitterUserId = profilePayload?.data?.id || twitterUserId;
    }

    // Fetch posts if requested and we have a user id
    if (actions.includes('posts') && twitterUserId) {
      const postsPayload = await fetchTwitterPostsByUserId(twitterUserId, bearer);
      await updatePostsCache(job.user_id, postsPayload);
    }

    await completeJob(currentJobId);

    console.log(`Successfully processed job: ${currentJobId}`);

  } 
  catch (error) {
    console.error('Error:', error);
    if (currentJobId) {
      await failJob(currentJobId, (error as Error)?.message || String(error));
    }
  }
}; 
