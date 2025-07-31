import { supabase } from "@/integrations/supabase/client";

//Edge function to fetch with auth
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_API}${endpoint}`, {
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

// Simple cache using localStorage for OAuth state
export const getFromCache = (key: string) => {
  try {
    const item = localStorage.getItem(`oauth_cache_${key}`);
    if (!item) return null;
    
    const parsed = JSON.parse(item);
    if (parsed.expires && Date.now() > parsed.expires) {
      localStorage.removeItem(`oauth_cache_${key}`);
      return null;
    }
    
    return parsed.value;
  } catch {
    return null;
  }
};

export const setCache = (key: string, value: any, expiresInMinutes = 60) => {
  const expires = Date.now() + expiresInMinutes * 60 * 1000;
  localStorage.setItem(`oauth_cache_${key}`, JSON.stringify({ value, expires }));
};