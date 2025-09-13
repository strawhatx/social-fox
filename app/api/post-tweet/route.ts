import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { resolveUserUuid } from '@/lib/db';
import { getUserTwitterBearerToken, postTweetToTwitter, uploadMediaToTwitter, extractCommunityIdFromUrl } from '@/lib/twitter';
import { getFeatureQuotaStatus, incrementFeatureQuota } from '@/lib/subscriptions';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const appUserId = await resolveUserUuid(userId);
    if (!appUserId) {
      return NextResponse.json({ ok: false, error: 'user_not_found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, platform = 'x', images = [], communityUrl } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ ok: false, error: 'content_required' }, { status: 400 });
    }

    // Check subscription-based quota before posting
    const quotaStatus = await getFeatureQuotaStatus(userId, 'scheduledPosts');
    if (!quotaStatus || !quotaStatus.allowed) {
      return NextResponse.json({ 
        ok: false, 
        error: 'quota_exhausted',
        quota: quotaStatus
      }, { status: 402 });
    }

    // Get Twitter bearer token for the user
    const twitterToken = await getUserTwitterBearerToken(userId);
    if (!twitterToken) {
      return NextResponse.json({ 
        ok: false, 
        error: 'twitter_not_connected',
        message: 'Please connect your Twitter account to post tweets'
      }, { status: 400 });
    }

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
      content.trim(), 
      twitterToken, 
      mediaIds.length > 0 ? mediaIds : undefined,
      communityId || undefined
    );
    
    if (!twitterResult.success) {
      return NextResponse.json({ 
        ok: false, 
        error: 'twitter_post_failed',
        message: twitterResult.error || 'Failed to post to Twitter'
      }, { status: 500 });
    }

    // Increment quota usage only after successful Twitter post
    const quotaIncremented = await incrementFeatureQuota(userId, 'scheduledPosts');
    if (!quotaIncremented) {
      return NextResponse.json({ 
        ok: false, 
        error: 'quota_exhausted',
        quota: quotaStatus
      }, { status: 402 });
    }

    // Create the post in content_posts table
    const result = await prisma.contentPost.create({
      data: {
        userId: appUserId,
        content: content.trim(),
        platform: platform,
        status: 'posted',
        postedAt: new Date(),
        metadata: {
          twitter_tweet_id: twitterResult.tweetId,
          media_ids: mediaIds,
          community_id: communityId,
          community_url: communityUrl
        }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      data: result,
      quota: quotaStatus,
      twitterTweetId: twitterResult.tweetId
    }, { status: 201 });

  } catch (error) {
    console.error('Error posting tweet:', error);
    return NextResponse.json({ ok: false, error: 'internal_server_error' }, { status: 500 });
  }
}
