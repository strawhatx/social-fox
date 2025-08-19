import { supabase } from "@/integrations/supabase/client";

const SUPABASE_API = "https://nmdmgdbbiivqazqjejdc.supabase.co/functions/v1/";

//Edge function to fetch with auth
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const response = await fetch(`${SUPABASE_API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return result;
};

//Edge function to fetch with auth
export const fetchWithNoAuth = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${SUPABASE_API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return result;
};