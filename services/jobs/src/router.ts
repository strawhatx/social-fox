import { ScheduledHandler } from 'aws-lambda';
import { completeJob, failJob, getPendingJob, updateJobStatus } from './_utils/jobs';
import { runTweetsSyncTask } from './tweets-sync';
import { runAccountSyncTask } from './twitter-account-sync';

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

    switch (job.action) {
        case 'profile':
        case 'posts':
          await runAccountSyncTask(job);
          break;
        case 'tweets':
          await runTweetsSyncTask(job);
          break;
        default:
          throw new Error(`Unknown action: ${job.action}`);
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
