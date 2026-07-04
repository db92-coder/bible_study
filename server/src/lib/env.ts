/**
 * Read an env var, tolerating values pasted with surrounding quotes
 * (e.g. copied verbatim from a .env file into a hosting dashboard —
 * dotenv strips quotes, dashboards store them literally).
 */
export function envVar(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const cleaned = raw.trim().replace(/^["']+|["']+$/g, '');
  return cleaned || undefined;
}
