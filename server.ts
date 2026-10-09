import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createAuth } from './server/auth';
import { databaseFromEnv, createCurriculumStore, createProgressStore } from './server/database';
import { createProgressRouter } from './server/progress';

// Local secrets live in .env.local. Hosting-panel variables remain authoritative
// because dotenv does not overwrite variables already present in process.env.
dotenv.config({ path: ['.env.local', '.env'], quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isDev = process.env.NODE_ENV !== 'production';
const AI_MODEL = process.env.GEMINI_MODEL?.trim() || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || '';
const APP_ORIGIN = (process.env.AUTH_ORIGIN || process.env.GOOGLE_AUTH_ORIGIN || process.env.APP_URL || '').trim().replace(/\/$/, '');
const hasGeminiApiKey =
  GEMINI_API_KEY.length >= 20 &&
  !/(replace|placeholder|your[-_ ]|my_gemini)/i.test(GEMINI_API_KEY);
const hasGeminiConfiguration = hasGeminiApiKey && AI_MODEL.length > 0;
const configuredTimeout = Number(process.env.AI_TIMEOUT_MS);
const AI_TIMEOUT_MS = Number.isFinite(configuredTimeout)
  ? Math.min(120_000, Math.max(10_000, configuredTimeout))
  : 60_000;
const API_WINDOW_MS = 15 * 60 * 1000;
const API_REQUEST_LIMIT = 30;
const auth = createAuth({
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY?.trim() || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim() || '',
    projectId: process.env.FIREBASE_PROJECT_ID?.trim() || '',
    appId: process.env.FIREBASE_APP_ID?.trim() || '',
  },
  secret: process.env.AUTH_SESSION_SECRET?.trim() || '',
  origin: APP_ORIGIN,
  production: !isDev,
});

type AiFeature = 'chat' | 'pronunciation' | 'quiz';
const DAILY_QUOTAS: Record<AiFeature, number> = {
  chat: Number(process.env.AI_DAILY_CHAT_LIMIT) || 5,
  pronunciation: Number(process.env.AI_DAILY_PRONUNCIATION_LIMIT) || 10,
  quiz: Number(process.env.AI_DAILY_QUIZ_LIMIT) || 2,
};

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

app.use((_req, res, next) => {
  const frameAncestors = process.env.ALLOWED_FRAME_ANCESTORS?.trim() || "'self'";
  res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors};`);
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!isDev && APP_ORIGIN.startsWith('https:')) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (frameAncestors === "'self'") res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
  next();
});

type RateLimitRecord = { count: number; resetsAt: number };
const apiRequests = new Map<string, RateLimitRecord>();
type DailyUsage = Record<AiFeature, number> & { date: string };
const dailyUsage = new Map<string, DailyUsage>();
const aiMetrics = {
  accepted: { chat: 0, pronunciation: 0, quiz: 0 },
  succeeded: { chat: 0, pronunciation: 0, quiz: 0 },
  failed: { chat: 0, pronunciation: 0, quiz: 0 },
  quotaRejected: { chat: 0, pronunciation: 0, quiz: 0 },
};

function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = apiRequests.get(key);

  if (!current || current.resetsAt <= now) {
    apiRequests.set(key, { count: 1, resetsAt: now + API_WINDOW_MS });
    return next();
  }
  if (current.count >= API_REQUEST_LIMIT) {
    res.setHeader('Retry-After', Math.ceil((current.resetsAt - now) / 1000));
    return res.status(429).json({ error: 'Too many AI requests. Please try again later.' });
  }
  current.count += 1;
  next();
}

function getIdentityKey(req: Request, res: Response): string {
  if (res.locals.user) return `firebase:${res.locals.user.id}`;
  const anonymousId = req.get('X-Anonymous-Id')?.trim() || '';
  const isValidId = /^[a-zA-Z0-9-]{16,80}$/.test(anonymousId);
  const network = req.ip || req.socket.remoteAddress || 'unknown';
  // A verified Google account subject can replace this anonymous identity later.
  return isValidId ? `anonymous:${anonymousId}:${network}` : `network:${network}`;
}

function consumeDailyQuota(req: Request, res: Response, feature: AiFeature): boolean {
  const identity = getIdentityKey(req, res);
  const today = new Date().toISOString().slice(0, 10);
  let usage = dailyUsage.get(identity);
  if (!usage || usage.date !== today) {
    usage = { date: today, chat: 0, pronunciation: 0, quiz: 0 };
    dailyUsage.set(identity, usage);
  }

  const limit = DAILY_QUOTAS[feature];
  const resetAt = new Date(`${today}T00:00:00.000Z`).getTime() + 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, limit - usage[feature]);
  res.setHeader('X-AI-Quota-Limit', limit);
  res.setHeader('X-AI-Quota-Remaining', Math.max(0, remaining - 1));
  res.setHeader('X-AI-Quota-Reset', new Date(resetAt).toISOString());

  if (remaining <= 0) {
    aiMetrics.quotaRejected[feature] += 1;
    res.setHeader('X-AI-Quota-Remaining', 0);
    res.status(429).json({
      error: 'Daily AI allowance reached. Please try again tomorrow.',
      code: 'DAILY_AI_QUOTA_REACHED',
      feature,
      resetAt: new Date(resetAt).toISOString(),
    });
    return false;
  }

  usage[feature] += 1;
  aiMetrics.accepted[feature] += 1;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of apiRequests) {
    if (record.resetsAt <= now) apiRequests.delete(key);
  }
  const today = new Date().toISOString().slice(0, 10);
  for (const [key, usage] of dailyUsage) {
    if (usage.date !== today) dailyUsage.delete(key);
  }
}, API_WINDOW_MS).unref();

setInterval(() => {
  if (!isDev) console.log(JSON.stringify({ event: 'ai_usage_summary', ...aiMetrics }));
}, 60 * 60 * 1000).unref();

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.locals.requestId = randomUUID();
  res.setHeader('X-Request-Id', res.locals.requestId);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: hasGeminiConfiguration,
    authConfigured: auth.configured,
    databaseConfigured: Boolean(database),
    environment: isDev ? 'development' : 'production',
  });
});

app.use('/api', auth.attachUser);
const database = databaseFromEnv();
const curriculumStore = database ? createCurriculumStore(database) : null;
app.use('/api/progress', createProgressRouter(database ? createProgressStore(database) : null,
  APP_ORIGIN));
app.get('/api/curriculum', async (_req, res) => {
  if (!curriculumStore) return res.status(503).json({ error: 'The lesson database is not configured.' });
  const version = process.env.CURRICULUM_VERSION?.trim() || 'a1-b1-2026-10-01';
  try {
    const snapshot = await curriculumStore.load(version);
    if (!snapshot) return res.status(503).json({ error: 'The published lesson set is not available yet.' });
    return res.json(snapshot);
  } catch (error) {
    logApiError('/api/curriculum', res, error);
    return res.status(503).json({ error: 'The lesson database is temporarily unavailable.' });
  }
});
// Progress has its own per-account limit, independent of the small AI allowance.
app.use('/api', apiRateLimit);
app.use('/api/auth', auth.router);

const ai = hasGeminiConfiguration
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'singlish-guru/1.0' } },
    })
  : null;

const TEACHER_SYSTEM_INSTRUCTION = `You are "Teacher Daisy" (ඩේසි ගුරුතුමිය), a warm, kind, and encouraging English teacher who teaches spoken English from Sinhala.
Always communicate in a bilingual, friendly Sri Lankan teacher tone, using authentic Sinhala with clear English. Explain Sinhala Subject-Object-Verb versus English Subject-Verb-Object patterns, point out common Sri Lankan English traps warmly, and provide Sinhala phonetic spelling where helpful. Keep responses practical, concise, safe, and encouraging.`;

function requireAi(res: Response): GoogleGenAI | null {
  if (!ai) {
    res.status(503).json({ error: 'AI service is not configured.' });
    return null;
  }
  return ai;
}

function hasAiConsentHeader(req: Request, res: Response): boolean {
  if (req.get('X-Privacy-Consent') === 'ai-v1') return true;
  res.status(451).json({
    error: 'AI processing consent is required.',
    code: 'CONSENT_REQUIRED',
  });
  return false;
}

function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  return cleaned && cleaned.length <= maxLength ? cleaned : null;
}

async function withTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timed out')), AI_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function logApiError(route: string, res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${res.locals.requestId}] ${route}: ${message}`);
}

type GeneratedQuestion = {
  id: string;
  sinhalaPrompt: string;
  targetEnglish: string;
  singlishPronunciation: string;
  options: string[];
  correctOptionIndex: number;
  explanationSinhala: string;
};

function isGeneratedQuestion(value: unknown): value is GeneratedQuestion {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<GeneratedQuestion>;
  const bounded = (text: unknown, max: number) =>
    typeof text === 'string' && text.trim().length > 0 && text.length <= max;
  return (
    bounded(item.id, 60) &&
    bounded(item.sinhalaPrompt, 500) &&
    bounded(item.targetEnglish, 300) &&
    bounded(item.singlishPronunciation, 300) &&
    Array.isArray(item.options) &&
    item.options.length === 4 &&
    item.options.every((option) => bounded(option, 200)) &&
    Number.isInteger(item.correctOptionIndex) &&
    Number(item.correctOptionIndex) >= 0 &&
    Number(item.correctOptionIndex) <= 3 &&
    bounded(item.explanationSinhala, 800)
  );
}

app.post('/api/chat-with-sir', async (req: Request, res: Response) => {
  if (!hasAiConsentHeader(req, res)) return;
  const client = requireAi(res);
  if (!client) return;

  const message = cleanString(req.body?.message, 1_000);
  if (!message) {
    return res.status(400).json({ error: 'Message must be between 1 and 1,000 characters.' });
  }
  if (!consumeDailyQuota(req, res, 'chat')) return;

  const rawHistory = Array.isArray(req.body?.chatHistory) ? req.body.chatHistory.slice(-6) : [];
  const conversationContext = rawHistory
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;
      const entry = item as { sender?: unknown; text?: unknown };
      const text = cleanString(entry.text, 1_000);
      if (!text) return null;
      return `${entry.sender === 'user' ? 'Student' : 'Teacher Daisy'}: ${text}`;
    })
    .filter(Boolean)
    .join('\n');

  const prompt = `Previous conversation:\n${conversationContext}\n\nStudent message:\n"${message}"\n\nRespond as Teacher Daisy. Explain clearly using Sinhala script, English examples, and Sinhala phonetic pronunciation where helpful. Keep it welcoming and under 200 words.`;

  try {
    const response = await withTimeout(client.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION, temperature: 0.7 },
    }));
    aiMetrics.succeeded.chat += 1;
    return res.json({ reply: response.text || 'හොඳ ප්‍රශ්නයක් පැටියෝ! නැවත අහන්න.' });
  } catch (error) {
    aiMetrics.failed.chat += 1;
    logApiError('/api/chat-with-sir', res, error);
    return res.status(502).json({ error: 'Teacher Daisy is temporarily unavailable.' });
  }
});

app.post('/api/pronunciation-coach', async (req: Request, res: Response) => {
  if (!hasAiConsentHeader(req, res)) return;
  const client = requireAi(res);
  if (!client) return;

  const targetPhrase = cleanString(req.body?.targetPhrase, 300);
  const spokenTranscript = cleanString(req.body?.spokenTranscript, 300);
  if (!targetPhrase || !spokenTranscript) {
    return res.status(400).json({ error: 'Both phrases must be between 1 and 300 characters.' });
  }
  if (!consumeDailyQuota(req, res, 'pronunciation')) return;

  const prompt = `The student is a native Sinhala speaker learning English pronunciation.\nTarget English sentence: "${targetPhrase}"\nSpeech-to-text transcript: "${spokenTranscript}"\n\nExplain in 2-4 encouraging Sinhala sentences which sounds may need attention. Do not claim to have analyzed audio; you only have the transcript. Include one practical tip with English examples.`;

  try {
    const response = await withTimeout(client.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION, temperature: 0.5 },
    }));
    aiMetrics.succeeded.pronunciation += 1;
    return res.json({ feedbackSinhala: response.text || 'විශිෂ්ට උත්සාහයක්! දිගටම හඬ නගා පුහුණු වන්න.' });
  } catch (error) {
    aiMetrics.failed.pronunciation += 1;
    logApiError('/api/pronunciation-coach', res, error);
    return res.status(502).json({ error: 'Pronunciation coaching is temporarily unavailable.' });
  }
});

app.post('/api/generate-lesson-questions', async (req: Request, res: Response) => {
  if (!hasAiConsentHeader(req, res)) return;
  const client = requireAi(res);
  if (!client) return;

  const topic = cleanString(req.body?.topic ?? 'Everyday Spoken English', 120);
  if (!topic) {
    return res.status(400).json({ error: 'Topic must be between 1 and 120 characters.' });
  }
  if (!consumeDailyQuota(req, res, 'quiz')) return;

  const prompt = `Generate 3 beginner spoken-English questions for a Sinhala-speaking learner about "${topic}". Return strict JSON with a questions array. Each item must contain id, sinhalaPrompt, targetEnglish, singlishPronunciation, exactly four options, correctOptionIndex from 0 to 3, and explanationSinhala.`;

  try {
    const response = await withTimeout(client.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION, responseMimeType: 'application/json' },
    }));
    const parsed = JSON.parse(response.text || '{}') as { questions?: unknown[] };
    if (
      !Array.isArray(parsed.questions) ||
      parsed.questions.length !== 3 ||
      !parsed.questions.every(isGeneratedQuestion)
    ) {
      throw new Error('AI returned an invalid question set');
    }
    aiMetrics.succeeded.quiz += 1;
    return res.json(parsed);
  } catch (error) {
    aiMetrics.failed.quiz += 1;
    logApiError('/api/generate-lesson-questions', res, error);
    return res.status(502).json({ error: 'New questions are temporarily unavailable.' });
  }
});

app.all('/api/*', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (!error) return next();
  const message = error instanceof Error ? error.message : '';
  if (message.includes('request entity too large')) {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  console.error(`[${res.locals.requestId || 'no-request-id'}] Request error: ${message || 'Unknown error'}`);
  return res.status(400).json({ error: 'Invalid request.' });
});

export async function startServer() {
  if (!isDev) {
    const missing: string[] = [];
    if (!APP_ORIGIN || !APP_ORIGIN.startsWith('https://')) missing.push('AUTH_ORIGIN (HTTPS production origin)');
    if (!auth.configured) missing.push('Firebase settings and AUTH_SESSION_SECRET');
    if (!hasGeminiApiKey) missing.push('GEMINI_API_KEY');
    if (!AI_MODEL) missing.push('GEMINI_MODEL');
    if (!database) missing.push('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
    if (missing.length) throw new Error(`Production configuration is incomplete: ${missing.join(', ')}`);
    try { await database!.execute('SELECT 1 AS startup_check'); }
    catch { throw new Error('Production database check failed. Verify Turso connectivity and credentials.'); }
  }
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath, { maxAge: '1d', etag: true }));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Singlish Guru running on port ${PORT} (${isDev ? 'development' : 'production'})`);
  });
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
const isTestRun =
  process.env.NODE_ENV === 'test' ||
  Boolean(process.env.VITEST) ||
  Boolean(process.env.VITEST_WORKER_ID) ||
  process.argv.some((argument) => argument.toLowerCase().includes('vitest'));
if (isDirectRun && !isTestRun) {
  startServer().catch((error) => {
    console.error('Failed to start Singlish Guru:', error);
    process.exit(1);
  });
}
