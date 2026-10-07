// @vitest-environment node
import express from 'express';
import request from 'supertest';
import { createClient, type Client } from '@libsql/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { createAuth } from '../server/auth';
import { createProgressStore, databaseFromEnv, migrateDatabase } from '../server/database';
import { createProgressRouter } from '../server/progress';

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
});
