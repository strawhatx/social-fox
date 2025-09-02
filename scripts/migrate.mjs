import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

const root = process.cwd();
const envLocalPath = path.join(root, '.env.local');
const envPath = path.join(root, '.env');
if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing NEON_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

const sql = neon(databaseUrl);
const migrationsDir = path.join(process.cwd(), 'db', 'migrations');

async function ensureMigrationsTable() {
  await sql`create table if not exists public._migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`;
}

async function appliedMigrations() {
  const rows = await sql`select name from public._migrations order by applied_at asc`;
  return new Set(rows.map(r => r.name));
}

async function applyMigration(name, sqlText) {
  console.log(`Applying migration: ${name}`);
  try {
    await sql`begin`;
    await sql.unsafe(sqlText);
    await sql`insert into public._migrations (name) values (${name})`;
    await sql`commit`;
  } catch (err) {
    await sql`rollback`;
    console.error(`Failed migration ${name}:`, err);
    process.exit(1);
  }
}

async function main() {
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found, nothing to do.');
    return;
  }

  await ensureMigrationsTable();
  const done = await appliedMigrations();

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (done.has(file)) continue;
    const full = path.join(migrationsDir, file);
    const sqlText = fs.readFileSync(full, 'utf8');
    await applyMigration(file, sqlText);
  }

  console.log('Migrations complete.');
}

main();
