-- Add item_id column to analytics_snapshots
ALTER TABLE "analytics_snapshots" ADD COLUMN "item_id" UUID;

-- Add foreign key constraint for item_id
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "content_post_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old unique constraint
ALTER TABLE "analytics_snapshots" DROP CONSTRAINT "analytics_snapshots_post_id_snapshot_date_key";

-- Add new unique constraint that includes item_id
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_post_id_item_id_snapshot_date_key" UNIQUE ("post_id", "item_id", "snapshot_date");
