import { createClient } from '@libsql/client/http';
import type { Client, InStatement } from '@libsql/client';
import type { AuthUser } from './auth';

export function databaseFromEnv(env: NodeJS.ProcessEnv = process.env): Client | null {
  const url = env.TURSO_DATABASE_URL?.trim();
  const authToken = env.TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken || /your-database|replace-with/i.test(url + authToken)) return null;
  try {
    const parsed = new URL(url);
    if (!['libsql:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || parsed.search) return null;
    return createClient({ url, authToken });
  } catch { return null; }
}

// Additive, repeatable migration; never resets existing learner records.
export async function migrateDatabase(client: Client) {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS sg_users (
      firebase_uid TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sg_lesson_progress (
      firebase_uid TEXT NOT NULL REFERENCES sg_users(firebase_uid),
      lesson_id TEXT NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (firebase_uid, lesson_id)
    )`,
    `CREATE TABLE IF NOT EXISTS sg_schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `INSERT INTO sg_schema_migrations(version) VALUES (1) ON CONFLICT DO NOTHING`,
  ], 'write');
}

export function createProgressStore(client: Client) {
  const profile = (user: AuthUser): InStatement => ({
    sql: `INSERT INTO sg_users(firebase_uid, name, email) VALUES (?, ?, ?)
      ON CONFLICT(firebase_uid) DO UPDATE SET name=excluded.name, email=excluded.email
      WHERE sg_users.name <> excluded.name OR sg_users.email <> excluded.email`,
    args: [user.id, user.name, user.email],
  });
  const select = (uid: string): InStatement => ({
    sql: 'SELECT lesson_id FROM sg_lesson_progress WHERE firebase_uid = ? ORDER BY lesson_id', args: [uid],
  });
  return {
    async load(user: AuthUser): Promise<string[]> {
      const results = await client.batch([profile(user), select(user.id)], 'write');
      return results[1].rows.map(row => String(row.lesson_id));
    },
    async complete(user: AuthUser, lessonIds: string[]): Promise<string[]> {
      // One transaction: duplicate/retried writes never erase or double-count progress.
      const results = await client.batch([profile(user), ...lessonIds.map(lessonId => ({
        sql: `INSERT INTO sg_lesson_progress(firebase_uid, lesson_id) VALUES (?, ?) ON CONFLICT DO NOTHING`,
        args: [user.id, lessonId],
      })), select(user.id)], 'write');
      return results[results.length - 1].rows.map(row => String(row.lesson_id));
    },
  };
}
export type ProgressStore = ReturnType<typeof createProgressStore>;
