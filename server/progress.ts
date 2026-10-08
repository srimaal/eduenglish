import { Router } from 'express';
import type { AuthUser } from './auth';
import type { ProgressStore } from './database';
import { isLessonId } from '../src/types/lessonProgress';
import { validQuizAttempt } from '../src/data/lessonQuizzes';

export function createProgressRouter(store: ProgressStore | null, origin: string) {
  const router = Router();
  const requests = new Map<string, { count: number; until: number }>();
  router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const user: AuthUser | undefined = res.locals.user;
    if (!user) { res.status(401).json({ error: 'Sign in to sync lesson progress.' }); return; }
    // This header is a mismatch guard, NOT authentication. Ownership always comes from the session.
    if (req.get('X-Progress-User') !== user.id) {
      res.status(409).json({ error: 'Your account changed in another tab. Refresh before syncing.' }); return;
    }
    if (req.method !== 'GET' && req.get('Origin') !== origin) {
      res.status(403).json({ error: 'Save progress from the application.' }); return;
    }
    if (!store) { res.status(503).json({ error: 'Cloud progress is not configured yet.' }); return; }
    const now = Date.now();
    for (const [uid, record] of requests) if (record.until <= now) requests.delete(uid);
    const record = requests.get(user.id) || { count: 0, until: now + 60_000 };
    requests.set(user.id, record);
    if (++record.count > 120) {
      res.setHeader('Retry-After', Math.ceil((record.until - now) / 1000));
      res.status(429).json({ error: 'Please wait a moment before syncing again.' }); return;
    }
    next();
  });
  router.get('/', async (_req, res) => {
    try {
      const user: AuthUser = res.locals.user;
      res.json({ userId: user.id, completedLessonIds: await store!.load(user) });
    } catch {
      res.status(503).json({ error: 'Cloud progress is unavailable. Your local copy is kept; please retry.' });
    }
  });
  router.post('/quiz-attempts', async (req, res) => {
    if (!validQuizAttempt(req.body)) { res.status(400).json({ error: 'Submit a complete, valid attempt for the current lesson quiz version.' }); return; }
    try {
      const user: AuthUser = res.locals.user;
      const result = await store!.recordQuiz(user, req.body);
      if (result.conflict) { res.status(409).json({ error: 'This attempt ID was already used for different answers.' }); return; }
      res.json({ userId: user.id, attemptId: req.body.attemptId, grade: result.grade, completedLessonIds: result.completedLessonIds });
    } catch { res.status(503).json({ error: 'Quiz saving is unavailable. Keep the pending result on this device and retry.' }); }
  });
  router.post('/lessons', async (req, res) => {
    const ids: unknown = req.body?.lessonIds;
    if (!req.body || Object.keys(req.body).some(key => key !== 'lessonIds') || !Array.isArray(ids) || !ids.length || ids.length > 1000 || !ids.every(isLessonId)) {
      res.status(400).json({ error: 'Provide between 1 and 1,000 valid lesson IDs only.' }); return;
    }
    try {
      const user: AuthUser = res.locals.user;
      res.json({ userId: user.id, completedLessonIds: await store!.complete(user, [...new Set(ids)]) });
    } catch {
      res.status(503).json({ error: 'Cloud save failed. Your local copy is kept; please retry.' });
    }
  });
  return router;
}
