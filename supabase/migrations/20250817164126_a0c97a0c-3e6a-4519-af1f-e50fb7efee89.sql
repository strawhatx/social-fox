-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.credit_transactions (user_id, amount, transaction_type, description)
  VALUES (NEW.id, 10, 'bonus', 'Welcome bonus - 10 free credits');
  
  RETURN NEW;
END;
$$;

-- Fix function search path for update_user_credits
CREATE OR REPLACE FUNCTION public.update_user_additional_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits for usage (negative amounts)
  IF p_amount < 0 THEN RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Update credits balance
  UPDATE public.user_credits 
  SET additional_credits = p_amount,
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
$$;

CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.user_credits 
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits for usage (negative amounts)
  IF p_amount < 0 THEN RETURN FALSE; -- Insufficient credits
  END IF;
  
  -- Update credits balance
  UPDATE public.user_credits 
  SET credits = p_amount,
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
$$;