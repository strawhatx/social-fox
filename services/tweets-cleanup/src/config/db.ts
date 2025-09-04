import { Pool } from 'pg';

function isPlaceholder(value: string | undefined): boolean {
  return !!value && /\$\{[^}]+\}/.test(value);
}

function resolveDatabaseUrl(): string {
  const neonUrlRaw = process.env.NEON_DATABASE_URL;
  const dbUrlRaw = process.env.DATABASE_URL;

  const neonUrl = !isPlaceholder(neonUrlRaw) ? neonUrlRaw : undefined;
  const dbUrl = !isPlaceholder(dbUrlRaw) ? dbUrlRaw : undefined;

  const chosen = neonUrl || dbUrl || '';
  if (!chosen) throw new Error('Missing NEON_DATABASE_URL (or DATABASE_URL) for tweets-cleanup');
  const parsed = new URL(chosen);
  if (!/^postgres(ql)?:$/.test(parsed.protocol)) {
    throw new Error(`Invalid DB protocol: ${parsed.protocol}`);
  }
  return chosen;
}

export function getDb(): Pool {
  const connectionString = resolveDatabaseUrl();
  return new Pool({ connectionString, max: 1 });
}


