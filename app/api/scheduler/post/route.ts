import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';
import { getUserTwitterBearerToken, postTweetToTwitter, uploadMediaToTwitter, extractCommunityIdFromUrl } from '@/lib/twitter';
import { getFeatureQuotaStatus, incrementFeatureQuota } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

// AWS API Key authentication
async function authenticateAWS(request: Request) {
  const apiKey = request.headers.get('scheduler-secret');
  const expectedKey = process.env.SCHEDULER_SECRET;
  
  if (!expectedKey) {
    throw new Error('SCHEDULER_SECRET not configured');
  }
  
  if (!apiKey || apiKey !== expectedKey) {
    return false;
  }
  
  return true;
}

export async function POST(request: Request) {
  try {
    // Authenticate AWS call
    const isAuthenticated = await authenticateAWS(request);
    if (!isAuthenticated) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, clerkUserId } = body;
    
    if (!clerkUserId) {
      return NextResponse.json({ ok: false, error: 'clerk_user_id_required' }, { status: 400 });
    }
    
    if (!postId) {
      return NextResponse.json({ ok: false, error: 'post_id_required' }, { status: 400 });
    }

    const appUserId = await resolveUserUuid(clerkUserId);
    if (!appUserId) {
      return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    }

    // Find the content post
    const contentPost = await prisma.contentPost.findFirst({
      where: { 
        id: postId, 
        userId: appUserId,
        status: { in: ['scheduled', 'processing'] }
      }
    });

    if (!contentPost) {
      return NextResponse.json({ 
        ok: false, 
        error: 'post_not_found_or_not_scheduled' 
      }, { status: 404 });
    }

    // Check subscription-based quota before posting
    const quotaStatus = await getFeatureQuotaStatus(clerkUserId, 'scheduledPosts');
    if (!quotaStatus || !quotaStatus.allowed) {
      return NextResponse.json({ 
        ok: false, 
        error: 'quota_exhausted',
        quota: quotaStatus
      }, { status: 402 });
    }

    // Get Twitter bearer token for the user
    const twitterToken = await getUserTwitterBearerToken(clerkUserId);
    if (!twitterToken) {
      return NextResponse.json({ 
        ok: false, 
        error: 'twitter_not_connected',
        message: 'User has not connected their Twitter account'
      }, { status: 400 });
    }

    // Extract metadata
    const metadata = contentPost.metadata as any;
    const images = metadata?.images || [];
    const communityUrl = metadata?.community_url;

    // Extract community ID from URL if provided
    let communityId: string | null = null;
    if (communityUrl) {
      communityId = extractCommunityIdFromUrl(communityUrl);
    }

    // Upload images to Twitter if provided
    let mediaIds: string[] = [];
    if (images && images.length > 0) {
      for (const imageUrl of images) {
        const uploadResult = await uploadMediaToTwitter(imageUrl, twitterToken);
        if (uploadResult.success && uploadResult.mediaId) {
          mediaIds.push(uploadResult.mediaId);
        } else {
          console.warn('Failed to upload image:', uploadResult.error);
        }
      }
    }

    // Post to Twitter with media and community
    const twitterResult = await postTweetToTwitter(
      contentPost.content.trim(), 
      twitterToken, 
      mediaIds.length > 0 ? mediaIds : undefined,
      communityId || undefined
    );
    
    if (!twitterResult.success) {
      // Update status to failed
      await prisma.contentPost.update({
        where: { id: postId },
        data: { 
          status: 'failed',
          metadata: {
            ...metadata,
            error: twitterResult.error || 'Failed to post to Twitter',
            failed_at: new Date().toISOString()
          }
        }
      });

      return NextResponse.json({ 
        ok: false, 
        error: 'twitter_post_failed',
        message: twitterResult.error || 'Failed to post to Twitter'
      }, { status: 500 });
    }

    // Increment quota usage only after successful Twitter post
    const quotaIncremented = await incrementFeatureQuota(clerkUserId, 'scheduledPosts');
    if (!quotaIncremented) {
      return NextResponse.json({ 
        ok: false, 
        error: 'quota_exhausted',
        quota: quotaStatus
      }, { status: 402 });
    }

    // Update the content post with posted status and Twitter metadata
    const updatedPost = await prisma.contentPost.update({
      where: { id: postId },
      data: {
        status: 'posted',
        postedAt: new Date(),
        metadata: {
          ...metadata,
          twitter_tweet_id: twitterResult.tweetId,
          media_ids: mediaIds,
          community_id: communityId,
          community_url: communityUrl,
          posted_at: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      data: updatedPost,
      quota: quotaStatus,
      twitterTweetId: twitterResult.tweetId
    }, { status: 200 });

  } catch (error) {
    console.error('Error posting content post to Twitter:', error);
    return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 });
  }
}