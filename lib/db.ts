import { neon, neonConfig } from '@neondatabase/serverless';

// Cache connections across hot reloads in dev and across invocations in edge/serverless
neonConfig.fetchConnectionCache = true;

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing NEON_DATABASE_URL (or DATABASE_URL) environment variable');
}

export const sql = neon(databaseUrl);


