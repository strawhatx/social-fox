export interface Analytics {
    stats: {
      totalPosts: number;
      totalImpressions: number;
      engagementRate: number;
      totalFollowers: number;
      totalLikes: number;
      totalRetweets: number;
      totalComments: number;
      totalBookmarks: number;
    };
    engagementData: Array<{
      date: string;
      likes: number;
      retweets: number;
      comments: number;
      bookmarks: number;
      views: number;
      impressions: number;
    }>;
    topPosts: Array<{
      id: string;
      content: string;
      date: string;
      likes: number;
      retweets: number;
      comments: number;
      bookmarks: number;
      views: number;
      engagement: number;
    }>;
    twitterAccount: {
      followersCount: number;
      followingCount: number;
      tweetCount: number;
      lastSyncedAt: string | null;
    } | null;
  }