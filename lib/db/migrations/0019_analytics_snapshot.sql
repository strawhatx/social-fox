CREATE TABLE "analytics_snapshots" (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    post_item_id UUID NOT NULL REFERENCES content_post_items(id) ON DELETE CASCADE,
    likes INTEGER NOT NULL DEFAULT 0,
    retweets INTEGER NOT NULL DEFAULT 0,
    replies INTEGER NOT NULL DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DOUBLE PRECISION, 
    snapshot_date DATE NOT NULL,

    CONSTRAINT analytics_snapshots_pkey PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX analytics_snapshots_post_item_id_snapshot_date_key ON analytics_snapshots(post_item_id, snapshot_date);

-- AddForeignKey
ALTER TABLE analytics_snapshots 
ADD CONSTRAINT analytics_snapshots_post_item_id_fkey FOREIGN KEY ("post_item_id") REFERENCES content_post_items("id") ON DELETE CASCADE ON UPDATE CASCADE;
