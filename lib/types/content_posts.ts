export type ContentPost = {
    id: string;
    userId: string;
    platform: string;
    status: 'draft' | 'scheduled' | 'posted' | 'archived';
    scheduledAt: string | null;
    postedAt: string | null;
    items: ContentPostItem[];
    createdAt: string;
    updatedAt: string;
};

export type ContentPostItem = {
    id: string;
    postId: string;
    parentId: string | null;
    content: string;
    media: any[] | null;
    metadata: any | null;
    createdAt: string;
    updatedAt: string;
};