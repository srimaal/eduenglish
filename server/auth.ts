import { Router, type RequestHandler, type CookieOptions } from 'express';
import { createHash } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { EncryptJWT, jwtDecrypt, type JWTPayload } from 'jose';
import type { FirebaseWebConfig } from '../src/types/auth';

export type AuthUser = { id: string; name: string; email: string };
type Options = { firebase: FirebaseWebConfig; secret: string; origin: string; production: boolean };
type VerifyToken = (token: string) => Promise<DecodedIdToken>;

function firebaseVerifier(projectId: string): VerifyToken {
  return async token => {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error('Auth emulator is not supported by this login flow');
    const name = `singlish-auth-${projectId}`;
    const app = getApps().find(app => app.name === name) || initializeApp({ projectId }, name);
    return getAuth(app).verifyIdToken(token);
  };
}

export function createAuth(options: Options, verifyToken: VerifyToken = firebaseVerifier(options.firebase.projectId)) {
  const router = Router();
  let validOrigin = false;
  try {
    const url = new URL(options.origin);
    validOrigin = url.origin === options.origin && (url.protocol === 'https:' ||
      (!options.production && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)));
  } catch { /* Missing config leaves guest learning available. */ }
  const { apiKey, authDomain, projectId, appId } = options.firebase;
  const configured = Boolean(validOrigin && apiKey && authDomain && projectId && appId && options.secret.length >= 32);
  const key = createHash('sha256').update(options.secret).digest();
  const audience = `firebase-session:${projectId}`;
  const secure = options.production || options.origin.startsWith('https:');
  const cookieName = secure ? '__Host-sg_session' : 'sg_session';
  const cookieOptions: CookieOptions = { httpOnly: true, secure, sameSite: 'lax', path: '/' };

  async function seal(payload: JWTPayload) {
    return new EncryptJWT(payload).setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setIssuer('singlish-guru').setAudience(audience).setIssuedAt().setExpirationTime('24h').encrypt(key);
  }
  const attachUser: RequestHandler = async (req, res, next) => {
    res.locals.user = null;
    const value = req.headers.cookie?.split(';').map(v => v.trim())
      .find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    if (value && configured) {
      try {
        const { payload } = await jwtDecrypt(value, key, { issuer: 'singlish-guru', audience,
          keyManagementAlgorithms: ['dir'], contentEncryptionAlgorithms: ['A256GCM'] });
        if (typeof payload.sub === 'string' && typeof payload.name === 'string' && typeof payload.email === 'string') {
          res.locals.user = { id: payload.sub, name: payload.name, email: payload.email } satisfies AuthUser;
        }
      } catch { /* Invalid/expired sessions become guests. */ }
    }
    if (res.locals.user && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('Origin') !== options.origin) {
      res.status(403).json({ error: 'Please make this request from Singlish Guru.' });
      return;
    }
    next();
  };

  router.get('/session', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ configured, user: res.locals.user ?? null,
      // Explicit allowlist: public Firebase web configuration only.
      firebase: configured ? { apiKey, authDomain, projectId, appId } : null });
  });
  router.post('/firebase', async (req, res) => {
    if (!configured) { res.status(503).json({ error: 'Firebase sign-in is not configured yet.' }); return; }
    // Protect login itself against session-swapping CSRF.
    if (req.get('Origin') !== options.origin) { res.status(403).json({ error: 'Sign in from the application.' }); return; }
    const token = req.body?.idToken;
    if (typeof token !== 'string' || !token || token.length > 16000) {
      res.status(400).json({ error: 'A Firebase ID token is required.' }); return;
    }
    try {
      const identity = await verifyToken(token);
      const now = Math.floor(Date.now() / 1000);
      if (!identity.uid || !identity.email || identity.email_verified !== true ||
        identity.firebase?.sign_in_provider !== 'google.com' ||
        !Number.isFinite(identity.auth_time) || now - identity.auth_time > 300 || identity.auth_time > now + 30) {
        throw new Error('A recent verified Google login is required');
      }
      const user: AuthUser = { id: identity.uid, email: identity.email,
        name: typeof identity.name === 'string' ? identity.name.slice(0, 150) : 'Learner' };
      res.cookie(cookieName, await seal({ sub: user.id, name: user.name, email: user.email }),
        { ...cookieOptions, maxAge: 86_400_000 });
      res.json({ user });
    } catch {
      res.status(401).json({ error: 'We could not verify your sign-in. Please sign in with Google again.' });
    }
  });
  router.post('/logout', (req, res) => {
    if (req.get('Origin') !== options.origin) { res.status(403).json({ error: 'Sign out from the application.' }); return; }
    res.clearCookie(cookieName, cookieOptions);
    res.json({ user: null });
  });
  router.get(['/google', '/google/callback'], (_req, res) => res.redirect('/?auth_error=firebase'));
  return { router, attachUser, configured };
}
