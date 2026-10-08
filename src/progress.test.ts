// @vitest-environment node
import express from 'express';
import request from 'supertest';
import { createClient, type Client } from '@libsql/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { createAuth } from '../server/auth';
import { createProgressStore, databaseFromEnv, migrateDatabase } from '../server/database';
import { createProgressRouter } from '../server/progress';
import { getLessonQuiz } from './data/lessonQuizzes';
import { quizAttempt, variantQuizAttempt } from './test/quizFixtures';

const origin = 'http://localhost:3000';
const clients: Client[] = [];
afterEach(() => clients.splice(0).forEach(client => client.close()));
async function setup() {
  const client = createClient({ url: 'file::memory:' });
  clients.push(client);
  await migrateDatabase(client);
  const store = createProgressStore(client);
  const verify = vi.fn(async (uid: string) => ({ uid, email: `${uid}@example.com`, name: uid,
    sub: uid, aud: 'demo', iss: 'https://securetoken.google.com/demo',
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
    email_verified: true, auth_time: Math.floor(Date.now() / 1000), firebase: { sign_in_provider: 'google.com', identities: {} },
  } as DecodedIdToken));
  const auth = createAuth({ firebase: { apiKey: 'test', authDomain: 'demo.firebaseapp.com', projectId: 'demo', appId: 'test' },
    secret: 'test-session-secret-that-is-at-least-32-characters', origin, production: false }, verify);
  const app = express();
  app.use(express.json(), auth.attachUser);
  app.use('/api/auth', auth.router);
  app.use('/api/progress', createProgressRouter(store, origin));
  const login = async (uid: string) => {
    const result = await request(app).post('/api/auth/firebase').set('Origin', origin).send({ idToken: uid }).expect(200);
    return (result.headers['set-cookie'] as unknown as string[]).map(value => value.split(';')[0]);
  };
  return { app, client, store, login };
}

describe('Turso lesson progress', () => {
  it('requires credentials and rejects placeholders and insecure URLs', () => {
    expect(databaseFromEnv({})).toBeNull();
    expect(databaseFromEnv({ TURSO_DATABASE_URL: 'libsql://your-database-url', TURSO_AUTH_TOKEN: 'your-database-token' })).toBeNull();
    expect(databaseFromEnv({ TURSO_DATABASE_URL: 'http://example.com', TURSO_AUTH_TOKEN: 'test' })).toBeNull();
  });
  it('requires a verified session, not a caller-provided UID', async () => {
    const { app } = await setup();
    await request(app).get('/api/progress').set('X-Progress-User', 'alice').expect(401);
    await request(app).post('/api/progress/lessons').set('X-Progress-User', 'alice').set('Origin', origin).send({ lessonIds: ['lesson-1'] }).expect(401);
  });
  it('isolates accounts and rejects identity spoofing and CSRF', async () => {
    const { app, login } = await setup();
    const alice = await login('alice');
    const bob = await login('bob');
    const saved = await request(app).post('/api/progress/lessons').set('Cookie', alice).set('Origin', origin).set('X-Progress-User', 'alice').send({ lessonIds: ['lesson-1'] }).expect(200);
    expect(saved.body).toEqual({ userId: 'alice', completedLessonIds: ['lesson-1'] });
    const read = await request(app).get('/api/progress').set('Cookie', bob).set('X-Progress-User', 'bob').expect(200);
    expect(read.body.completedLessonIds).toEqual([]);
    expect(read.headers['cache-control']).toBe('no-store');
    await request(app).get('/api/progress').set('Cookie', bob).set('X-Progress-User', 'alice').expect(409);
    await request(app).post('/api/progress/lessons').set('Cookie', bob).set('Origin', origin).set('X-Progress-User', 'alice').send({ lessonIds: ['lesson-2'] }).expect(409);
    await request(app).post('/api/progress/lessons').set('Cookie', alice).set('Origin', 'https://attacker.example').set('X-Progress-User', 'alice').send({ lessonIds: ['lesson-2'] }).expect(403);
    await request(app).post('/api/progress/lessons').set('Cookie', alice).set('Origin', origin).set('X-Progress-User', 'alice').send({ lessonIds: ['lesson-2'], userId: 'bob' }).expect(400);
  });
  it.each([[], ['lesson-0'], ['lesson-1001'], ['lesson-01'], [1], ['lesson-1; DROP TABLE sg_users'], Array(1001).fill('lesson-1')])('rejects invalid lesson batches %#', async lessonIds => {
    const { app, login } = await setup();
    await request(app).post('/api/progress/lessons').set('Cookie', await login('alice')).set('Origin', origin).set('X-Progress-User', 'alice').send({ lessonIds }).expect(400);
  });
  it('keeps concurrent and duplicate saves without losing existing lessons', async () => {
    const { store, client } = await setup();
    const user = { id: 'alice', name: 'Alice', email: 'alice@example.com' };
    await Promise.all(Array.from({ length: 12 }, (_, index) => store.complete(user, [`lesson-${index + 1}`, 'lesson-1'])));
    expect(await store.load(user)).toHaveLength(12);
    const first = await client.execute("SELECT completed_at FROM sg_lesson_progress WHERE firebase_uid='alice' AND lesson_id='lesson-1'");
    await store.complete(user, ['lesson-1']);
    await migrateDatabase(client);
    const second = await client.execute("SELECT completed_at FROM sg_lesson_progress WHERE firebase_uid='alice' AND lesson_id='lesson-1'");
    expect(second.rows).toEqual(first.rows);
    expect(await store.load(user)).toHaveLength(12);
    const rows = await client.execute('SELECT * FROM sg_users');
    expect(rows.rows).toHaveLength(1);
    expect(rows.rows[0].firebase_uid).toBe('alice');
  });
  it('returns safe errors during outages and no partial batch writes', async () => {
    const { app, login, client, store } = await setup();
    await client.execute(`CREATE TRIGGER test_failure BEFORE INSERT ON sg_lesson_progress WHEN NEW.lesson_id='lesson-2' BEGIN SELECT RAISE(ABORT, 'test'); END`);
    const cookie = await login('alice');
    const response = await request(app).post('/api/progress/lessons').set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send({ lessonIds: ['lesson-1', 'lesson-2'] }).expect(503);
    expect(response.body.error).not.toContain('SQL');
    expect(await store.load({ id: 'alice', name: 'Alice', email: 'alice@example.com' })).toEqual([]);
    client.close();
    await request(app).get('/api/progress').set('Cookie', cookie).set('X-Progress-User', 'alice').expect(503);
  });
  it('regrades a passing lesson quiz and completes that lesson atomically', async () => {
    const { app, login, client } = await setup();
    const cookie = await login('alice');
    const attempt = variantQuizAttempt('lesson-7', 'quiz-pass-attempt-0001');
    const response = await request(app).post('/api/progress/quiz-attempts')
      .set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send(attempt).expect(200);
    expect(response.body.grade).toMatchObject({ score: 100, correctCount: 5, total: 5, passed: true });
    expect(response.body.completedLessonIds).toContain('lesson-7');
    const attempts = await client.execute("SELECT attempt_id, passed FROM sg_quiz_attempts WHERE firebase_uid='alice'");
    expect(attempts.rows).toEqual([{ attempt_id: 'quiz-pass-attempt-0001', passed: 1 }]);
    const progress = await client.execute("SELECT lesson_id FROM sg_lesson_progress WHERE firebase_uid='alice'");
    expect(progress.rows).toEqual([{ lesson_id: 'lesson-7' }]);
  });
  it('stores a failed attempt but does not complete the lesson', async () => {
    const { app, login, client } = await setup();
    const cookie = await login('alice');
    const attempt = quizAttempt('lesson-8', 'quiz-fail-attempt-0001');
    const quiz = getLessonQuiz('lesson-8')!;
    attempt.answers[quiz.questions[0].id] = (quiz.questions[0].correctIndex! + 1) % quiz.questions[0].options!.length;
    attempt.answers[quiz.questions[1].id] = (quiz.questions[1].correctIndex! + 1) % quiz.questions[1].options!.length;
    const response = await request(app).post('/api/progress/quiz-attempts')
      .set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send(attempt).expect(200);
    expect(response.body.grade).toMatchObject({ score: 60, correctCount: 3, total: 5, passed: false });
    const rows = await client.execute("SELECT passed FROM sg_quiz_attempts WHERE firebase_uid='alice' AND lesson_id='lesson-8'");
    expect(rows.rows).toEqual([{ passed: 0 }]);
    expect(response.body.completedLessonIds).not.toContain('lesson-8');
  });
  it('rejects malformed or replayed attempt IDs without changing another lesson', async () => {
    const { app, login, client } = await setup();
    const cookie = await login('alice');
    const attempt = quizAttempt('lesson-9', 'quiz-replay-attempt-0001');
    await request(app).post('/api/progress/quiz-attempts').set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send({ ...attempt, score: 100 }).expect(400);
    await request(app).post('/api/progress/quiz-attempts').set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send(attempt).expect(200);
    const replay = { ...attempt, answers: { ...attempt.answers, [`lesson-9-q1`]: (getLessonQuiz('lesson-9')!.questions[0].correctIndex! + 1) % getLessonQuiz('lesson-9')!.questions[0].options!.length } };
    await request(app).post('/api/progress/quiz-attempts').set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send(replay).expect(409);
    const rows = await client.execute("SELECT attempt_id, lesson_id FROM sg_quiz_attempts WHERE firebase_uid='alice'");
    expect(rows.rows).toEqual([{ attempt_id: 'quiz-replay-attempt-0001', lesson_id: 'lesson-9' }]);
  });
  it('rolls back quiz and completion together when the completion write fails', async () => {
    const { app, login, client } = await setup();
    await client.execute(`CREATE TRIGGER quiz_failure BEFORE INSERT ON sg_lesson_progress WHEN NEW.lesson_id='lesson-11' BEGIN SELECT RAISE(ABORT, 'test'); END`);
    const cookie = await login('alice');
    await request(app).post('/api/progress/quiz-attempts').set('Cookie', cookie).set('Origin', origin).set('X-Progress-User', 'alice').send(quizAttempt('lesson-11', 'quiz-rollback-attempt-0001')).expect(503);
    const rows = await client.execute("SELECT attempt_id FROM sg_quiz_attempts WHERE firebase_uid='alice'");
    expect(rows.rows).toEqual([]);
  });
});
