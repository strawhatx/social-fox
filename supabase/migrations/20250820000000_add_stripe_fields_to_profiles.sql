-- Add Stripe-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON public.profiles(stripe_customer_id);

-- Add subscription tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_price_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription lookups
CREATE INDEX IF NOT EXISTS profiles_stripe_subscription_id_idx ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS profiles_subscription_price_id_idx ON public.profiles(subscription_price_id);
