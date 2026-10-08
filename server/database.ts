import { createClient } from '@libsql/client/http';
import type { Client, InStatement } from '@libsql/client';
import type { AuthUser } from './auth';
import { getQuizForAttempt, gradeLessonQuiz, type QuizAttempt } from '../src/data/lessonQuizzes';

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
    `CREATE TABLE IF NOT EXISTS sg_quiz_attempts (
      firebase_uid TEXT NOT NULL REFERENCES sg_users(firebase_uid),
      attempt_id TEXT NOT NULL, lesson_id TEXT NOT NULL, quiz_version INTEGER NOT NULL,
      answers_json TEXT NOT NULL, score INTEGER NOT NULL, correct_count INTEGER NOT NULL,
      total INTEGER NOT NULL, passed INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      PRIMARY KEY (firebase_uid, attempt_id)
    )`,
    `CREATE INDEX IF NOT EXISTS sg_quiz_attempts_by_lesson ON sg_quiz_attempts(firebase_uid, lesson_id)`,
    `INSERT INTO sg_schema_migrations(version) VALUES (2) ON CONFLICT DO NOTHING`,
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
    async recordQuiz(user: AuthUser, attempt: QuizAttempt) {
      const quiz = getQuizForAttempt(attempt)!;
      const grade = gradeLessonQuiz(quiz, attempt.answers);
      const answers = JSON.stringify(quiz.questions.map(question => attempt.answers[question.id]));
      const results = await client.batch([profile(user), {
        sql: `INSERT INTO sg_quiz_attempts(firebase_uid, attempt_id, lesson_id, quiz_version, answers_json, score, correct_count, total, passed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        args: [user.id, attempt.attemptId, attempt.lessonId, attempt.version, answers, grade.score, grade.correctCount, grade.total, grade.passed ? 1 : 0],
      }, {
        sql: `INSERT INTO sg_lesson_progress(firebase_uid, lesson_id)
          SELECT firebase_uid, lesson_id FROM sg_quiz_attempts
          WHERE firebase_uid=? AND attempt_id=? AND lesson_id=? AND quiz_version=? AND answers_json=? AND passed=1
          ON CONFLICT DO NOTHING`,
        args: [user.id, attempt.attemptId, attempt.lessonId, attempt.version, answers],
      }, {
        sql: 'SELECT lesson_id, quiz_version, answers_json FROM sg_quiz_attempts WHERE firebase_uid=? AND attempt_id=?',
        args: [user.id, attempt.attemptId],
      }, select(user.id)], 'write');
      const saved = results[3].rows[0];
      const conflict = saved.lesson_id !== attempt.lessonId || Number(saved.quiz_version) !== attempt.version || saved.answers_json !== answers;
      return { conflict, grade, completedLessonIds: results[4].rows.map(row => String(row.lesson_id)) };
    },
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
