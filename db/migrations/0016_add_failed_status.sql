-- Add 'failed' status to content_posts table
ALTER TABLE public.content_posts 
DROP CONSTRAINT IF EXISTS content_posts_status_check;

ALTER TABLE public.content_posts 
ADD CONSTRAINT content_posts_status_check 
CHECK (status IN ('draft','scheduled','posted','archived','failed'));

-- Add index for failed posts
CREATE INDEX IF NOT EXISTS idx_content_posts_user_failed
  ON public.content_posts(user_id, status) 
  WHERE status = 'failed';
