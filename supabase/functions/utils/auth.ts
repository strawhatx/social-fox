export async function validateSupabaseToken(authHeader: string | null): Promise<{ id: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const jwt = authHeader.split(' ')[1];

  const response = await fetch(Deno.env.get('SUPABASE_URL') + '/auth/v1/user', {
    headers: {
      Authorization: `Bearer ${jwt}`,
      apiKey: Deno.env.get('SUPABASE_ANON_KEY')!,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid or expired JWT');
  }

  const user = await response.json();
  return user as { id: string };
}

export function validateRequestAuthorization(req: Request): boolean {
  const keys = ['EDGE_FUNCTIONS_KEY', 'SUPABASE_ANON_KEY'];

  const header = req.headers.get("Authorization");

  return keys.some(key => header && header === `Bearer ${Deno.env.get(key)}`);
}
