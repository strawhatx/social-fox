-- Create user_credits table to track credit balances
CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 10,
  additional_credits INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (true);

-- Create credit_transactions table to track credit usage and purchases
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for purchase, negative for usage
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'subscription')),
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for credit_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.credit_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert transactions" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to initialize user credits when they sign up
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 10, 'bonus', 'Welcome bonus - 10 free credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize credits on user signup
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_credits();

-- Create function to update user credits balance
CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits for usage (negative amounts)
  IF p_amount < 0 AND (current_credits + p_amount) < 0 THEN
    RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Update credits balance
  UPDATE public.user_credits 
  SET credits = credits + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description,
    stripe_session_id
  ) VALUES (
    p_user_id, 
    p_amount, 
    p_transaction_type, 
    p_description,
    p_stripe_session_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;