// @vitest-environment node
import express from 'express';
import request from 'supertest';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { describe, expect, it, vi } from 'vitest';
import { createAuth } from '../server/auth.ts';
import { EncryptJWT } from 'jose';
import { createHash } from 'node:crypto';

const options = { firebase: { apiKey: 'public-test-key', authDomain: 'demo.firebaseapp.com', projectId: 'demo', appId: 'demo-app' },
  secret: 'test-only-session-secret-with-at-least-32-characters', origin: 'http://127.0.0.1:3000', production: false };
function identity(overrides = {}): DecodedIdToken {
  return { uid: 'firebase-user-123', sub: 'firebase-user-123', email: 'learner@example.com', email_verified: true,
    name: 'Learner', aud: 'demo', iss: 'https://securetoken.google.com/demo',
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600,
    auth_time: Math.floor(Date.now() / 1000), firebase: { identities: {}, sign_in_provider: 'google.com' }, ...overrides };
}
function setup(overrides = {}) {
  const verify = vi.fn<(token: string) => Promise<DecodedIdToken>>().mockResolvedValue(identity());
  const auth = createAuth({ ...options, ...overrides }, verify);
  const app = express();
  app.use(express.json(), auth.attachUser);
  app.use('/api/auth', auth.router);
  return { app, verify };
}
function cookies(response: request.Response) {
  return (response.headers['set-cookie'] as unknown as string[]).map(value => value.split(';')[0]);
}

describe('Firebase Google authentication', () => {
  it('leaves guest learning available with missing Firebase settings', async () => {
    const { app } = setup({ firebase: { ...options.firebase, apiKey: '' } });
    expect((await request(app).get('/api/auth/session')).body).toEqual({ configured: false, user: null, firebase: null });
    await request(app).post('/api/auth/firebase').expect(503);
  });
  it('publishes only the public Firebase configuration', async () => {
    const { app } = setup();
    const response = await request(app).get('/api/auth/session').expect(200);
    expect(response.body).toEqual({ configured: true, user: null, firebase: options.firebase });
    expect(JSON.stringify(response.body)).not.toContain(options.secret);
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it('requires HTTPS in production and a strong session secret', async () => {
    for (const overrides of [{ production: true }, { secret: 'short' }]) {
      expect((await request(setup(overrides).app).get('/api/auth/session')).body.configured).toBe(false);
    }
  });
  it('rejects cross-origin and missing-origin login before verifying tokens', async () => {
    const { app, verify } = setup();
    await request(app).post('/api/auth/firebase').send({ idToken: 'test' }).expect(403);
    await request(app).post('/api/auth/firebase').set('Origin', 'https://attacker.example').send({ idToken: 'test' }).expect(403);
    expect(verify).not.toHaveBeenCalled();
  });
  it('rejects missing tokens and failed Firebase verification', async () => {
    const { app, verify } = setup();
    await request(app).post('/api/auth/firebase').set('Origin', options.origin).send({ uid: 'forged' }).expect(400);
    expect(verify).not.toHaveBeenCalled();
    verify.mockRejectedValueOnce(new Error('invalid signature, audience or expiry'));
    const response = await request(app).post('/api/auth/firebase').set('Origin', options.origin).send({ idToken: 'forged' }).expect(401);
    expect(response.headers['set-cookie']).toBeUndefined();
  });
  it.each([
    { email_verified: false }, { auth_time: 1 },
    { firebase: { identities: {}, sign_in_provider: 'password' } },
  ])('requires a recent verified Google login: %j', async overrides => {
    const { app, verify } = setup();
    verify.mockResolvedValue(identity(overrides));
    await request(app).post('/api/auth/firebase').set('Origin', options.origin).send({ idToken: 'test' }).expect(401);
  });
  it('creates a session from verified identity, rejects tampering, and clears it at logout', async () => {
    const { app, verify } = setup();
    const response = await request(app).post('/api/auth/firebase').set('Origin', options.origin)
      .send({ idToken: 'firebase-token', uid: 'forged', email: 'forged@example.com' }).expect(200);
    expect(verify).toHaveBeenCalledWith('firebase-token');
    expect(response.body.user).toEqual({ id: 'firebase-user-123', name: 'Learner', email: 'learner@example.com' });
    const sessionCookie = cookies(response)[0];
    expect(String(response.headers['set-cookie'])).toContain('HttpOnly');
    expect(String(response.headers['set-cookie'])).toContain('SameSite=Lax');
    expect((await request(app).get('/api/auth/session').set('Cookie', sessionCookie)).body.user).toEqual(response.body.user);
    expect((await request(app).get('/api/auth/session').set('Cookie', sessionCookie + 'bad')).body.user).toBeNull();
    await request(app).post('/api/auth/logout').set('Cookie', sessionCookie).set('Origin', 'https://attacker.example').expect(403);
    const logout = await request(app).post('/api/auth/logout').set('Cookie', sessionCookie).set('Origin', options.origin).expect(200);
    expect(cookies(logout)).toContain('sg_session=');
  });
  it('uses secure host-only cookies in production', async () => {
    const { app } = setup({ production: true, origin: 'https://school.example' });
    const response = await request(app).post('/api/auth/firebase').set('Origin', 'https://school.example').send({ idToken: 'test' }).expect(200);
    expect(cookies(response)[0]).toMatch(/^__Host-sg_session=/);
    expect(String(response.headers['set-cookie'])).toContain('Secure');
  });
  it('rejects expired sessions and sessions from the previous OAuth flow', async () => {
    const { app } = setup();
    for (const [audience, expiration] of [['firebase-session:demo', 1], ['session', 9999999999]] as const) {
      const token = await new EncryptJWT({ sub: '123', name: 'Learner', email: 'learner@example.com' })
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' }).setIssuer('singlish-guru')
        .setAudience(audience).setExpirationTime(expiration).encrypt(createHash('sha256').update(options.secret).digest());
      expect((await request(app).get('/api/auth/session').set('Cookie', `sg_session=${token}`)).body.user).toBeNull();
    }
  });
  it('redirects old login links back to the new Firebase sign-in UI', async () => {
    await request(setup().app).get('/api/auth/google').expect(302).expect('Location', '/?auth_error=firebase');
  });
});
