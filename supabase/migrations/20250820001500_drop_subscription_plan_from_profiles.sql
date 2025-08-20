-- Drop legacy subscription_plan column now that subscription_price_id is the source of truth
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS subscription_plan;


