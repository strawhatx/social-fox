
import { JobRow } from '../_utils/jobs';
import { getCacheForUser, upsertProfileCache, updatePostsCache } from './services/cache';
import { getUserTwitterFromClerk } from '../_config/clerk';
import { fetchTwitterProfileByHandle, fetchTwitterPostsByUserId } from './services/twitter';

// Run the task
export const runAccountSyncTask = async (job: JobRow) => {
  try {
   // Determine action(s) strictly from the job
    const cache = await getCacheForUser(job.user_id);
    const actions: Array<'profile' | 'posts' | 'tweets'> = job.action ? [job.action] : ['profile', 'posts', 'tweets'];

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
  } 
  catch (error) {
    
  }
}; 
