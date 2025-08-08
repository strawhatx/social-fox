// utils/vault.ts
// Access Supabase Vault secrets in Edge Functions (secrets are exposed as env vars)

export function getVaultSecret(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required vault secret: ${name}`);
  }
  return value;
}

export function getMasterKey(): string {
  return getVaultSecret('MASTER_KEY');
} 