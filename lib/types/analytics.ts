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
    /** Optional: extended analytics for coaching features */
    performanceSummary?: {
      top?: {
        id: string;
        content: string;
        date: string;
        likes: number;
        retweets: number;
        replies?: number;
        impressions: number;
        engagement: number;
      } | null;
      bottom?: {
        id: string;
        content: string;
        date: string;
        likes: number;
        retweets: number;
        replies?: number;
        impressions: number;
        engagement: number;
      } | null;
    };
    breakdown?: {
      shortTweets?: { avgEngagement: number; count: number };
      threads?: { avgEngagement: number; count: number };
      gifs?: { avgEngagement: number; count: number };
      images?: { avgEngagement: number; count: number };
      comparisonText?: string;
    };
    timing?: {
      bestWindowText: string;
      topSlots: Array<{ dayOfWeek: number; hourStart: number; hourEnd: number; factor: number }>;
      heatmap?: Array<{ dayOfWeek: number; hour: number; factor: number }>;
    };
    consistency?: {
      streakDays: number;
      daysPostedThisWeek: number;
      missedDaysThisWeek: number;
      weekActivity?: Array<{ date: string; posted: boolean }>;
    };
    recommendations?: string[];
  }