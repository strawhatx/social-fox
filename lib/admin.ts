// Simple helper to determine if a Clerk user ID is an admin
// Reads from either server-only ADMIN_USER_IDS or NEXT_PUBLIC_ADMIN_USER_IDS
// Comma-separated list of Clerk user IDs

export function isAdmin(userId?: string | null): boolean {
  if (!userId) return false;
  // Server-only: do NOT read NEXT_PUBLIC_* here to avoid exposing admin list
  const raw = (process.env.ADMIN_USER_IDS || '').trim();
  if (!raw) return false;
  const ids = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return ids.includes(userId);
}


