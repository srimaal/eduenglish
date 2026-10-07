// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// server/auth.ts
import { Router } from "express";
import { createHash } from "node:crypto";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { EncryptJWT, jwtDecrypt } from "jose";
function firebaseVerifier(projectId) {
  return async (token) => {
    if (process.env.FIREBASE_AUTH_EMULATOR_HOST) throw new Error("Auth emulator is not supported by this login flow");
    const name = `singlish-auth-${projectId}`;
    const app2 = getApps().find((app3) => app3.name === name) || initializeApp({ projectId }, name);
    return getAuth(app2).verifyIdToken(token);
  };
}
function createAuth(options, verifyToken = firebaseVerifier(options.firebase.projectId)) {
  const router = Router();
  let validOrigin = false;
  try {
    const url = new URL(options.origin);
    validOrigin = url.origin === options.origin && (url.protocol === "https:" || !options.production && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
  } catch {
  }
  const { apiKey, authDomain, projectId, appId } = options.firebase;
  const configured = Boolean(validOrigin && apiKey && authDomain && projectId && appId && options.secret.length >= 32);
  const key = createHash("sha256").update(options.secret).digest();
  const audience = `firebase-session:${projectId}`;
  const secure = options.production || options.origin.startsWith("https:");
  const cookieName = secure ? "__Host-sg_session" : "sg_session";
  const cookieOptions = { httpOnly: true, secure, sameSite: "lax", path: "/" };
  async function seal(payload) {
    return new EncryptJWT(payload).setProtectedHeader({ alg: "dir", enc: "A256GCM" }).setIssuer("singlish-guru").setAudience(audience).setIssuedAt().setExpirationTime("24h").encrypt(key);
  }
  const attachUser = async (req, res, next) => {
    res.locals.user = null;
    const value = req.headers.cookie?.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    if (value && configured) {
      try {
        const { payload } = await jwtDecrypt(value, key, {
          issuer: "singlish-guru",
          audience,
          keyManagementAlgorithms: ["dir"],
          contentEncryptionAlgorithms: ["A256GCM"]
        });
        if (typeof payload.sub === "string" && typeof payload.name === "string" && typeof payload.email === "string") {
          res.locals.user = { id: payload.sub, name: payload.name, email: payload.email };
        }
      } catch {
      }
    }
    if (res.locals.user && !["GET", "HEAD", "OPTIONS"].includes(req.method) && req.get("Origin") !== options.origin) {
      res.status(403).json({ error: "Please make this request from Singlish Guru." });
      return;
    }
    next();
  };
  router.get("/session", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      configured,
      user: res.locals.user ?? null,
      // Explicit allowlist: public Firebase web configuration only.
      firebase: configured ? { apiKey, authDomain, projectId, appId } : null
    });
  });
  router.post("/firebase", async (req, res) => {
    if (!configured) {
      res.status(503).json({ error: "Firebase sign-in is not configured yet." });
      return;
    }
    if (req.get("Origin") !== options.origin) {
      res.status(403).json({ error: "Sign in from the application." });
      return;
    }
    const token = req.body?.idToken;
    if (typeof token !== "string" || !token || token.length > 16e3) {
      res.status(400).json({ error: "A Firebase ID token is required." });
      return;
    }
    try {
      const identity = await verifyToken(token);
      const now = Math.floor(Date.now() / 1e3);
      if (!identity.uid || !identity.email || identity.email_verified !== true || identity.firebase?.sign_in_provider !== "google.com" || !Number.isFinite(identity.auth_time) || now - identity.auth_time > 300 || identity.auth_time > now + 30) {
        throw new Error("A recent verified Google login is required");
      }
      const user = {
        id: identity.uid,
        email: identity.email,
        name: typeof identity.name === "string" ? identity.name.slice(0, 150) : "Learner"
      };
      res.cookie(
        cookieName,
        await seal({ sub: user.id, name: user.name, email: user.email }),
        { ...cookieOptions, maxAge: 864e5 }
      );
      res.json({ user });
    } catch {
      res.status(401).json({ error: "We could not verify your sign-in. Please sign in with Google again." });
    }
  });
  router.post("/logout", (req, res) => {
    if (req.get("Origin") !== options.origin) {
      res.status(403).json({ error: "Sign out from the application." });
      return;
    }
    res.clearCookie(cookieName, cookieOptions);
    res.json({ user: null });
  });
  router.get(["/google", "/google/callback"], (_req, res) => res.redirect("/?auth_error=firebase"));
  return { router, attachUser, configured };
}

// server/database.ts
import { createClient } from "@libsql/client/http";
function databaseFromEnv(env = process.env) {
  const url = env.TURSO_DATABASE_URL?.trim();
  const authToken = env.TURSO_AUTH_TOKEN?.trim();
  if (!url || !authToken || /your-database|replace-with/i.test(url + authToken)) return null;
  try {
    const parsed = new URL(url);
    if (!["libsql:", "https:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || parsed.search) return null;
    return createClient({ url, authToken });
  } catch {
    return null;
  }
}
function createProgressStore(client) {
  const profile = (user) => ({
    sql: `INSERT INTO sg_users(firebase_uid, name, email) VALUES (?, ?, ?)
      ON CONFLICT(firebase_uid) DO UPDATE SET name=excluded.name, email=excluded.email
      WHERE sg_users.name <> excluded.name OR sg_users.email <> excluded.email`,
    args: [user.id, user.name, user.email]
  });
  const select = (uid) => ({
    sql: "SELECT lesson_id FROM sg_lesson_progress WHERE firebase_uid = ? ORDER BY lesson_id",
    args: [uid]
  });
  return {
    async load(user) {
      const results = await client.batch([profile(user), select(user.id)], "write");
      return results[1].rows.map((row) => String(row.lesson_id));
    },
    async complete(user, lessonIds) {
      const results = await client.batch([profile(user), ...lessonIds.map((lessonId) => ({
        sql: `INSERT INTO sg_lesson_progress(firebase_uid, lesson_id) VALUES (?, ?) ON CONFLICT DO NOTHING`,
        args: [user.id, lessonId]
      })), select(user.id)], "write");
      return results[results.length - 1].rows.map((row) => String(row.lesson_id));
    }
  };
}

// server/progress.ts
import { Router as Router2 } from "express";

// src/types/lessonProgress.ts
function isLessonId(value) {
  return typeof value === "string" && /^lesson-([1-9]\d{0,2}|1000)$/.test(value);
}

// server/progress.ts
function createProgressRouter(store, origin) {
  const router = Router2();
  const requests = /* @__PURE__ */ new Map();
  router.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    const user = res.locals.user;
    if (!user) {
      res.status(401).json({ error: "Sign in to sync lesson progress." });
      return;
    }
    if (req.get("X-Progress-User") !== user.id) {
      res.status(409).json({ error: "Your account changed in another tab. Refresh before syncing." });
      return;
    }
    if (req.method !== "GET" && req.get("Origin") !== origin) {
      res.status(403).json({ error: "Save progress from the application." });
      return;
    }
    if (!store) {
      res.status(503).json({ error: "Cloud progress is not configured yet." });
      return;
    }
    const now = Date.now();
    for (const [uid, record2] of requests) if (record2.until <= now) requests.delete(uid);
    const record = requests.get(user.id) || { count: 0, until: now + 6e4 };
    requests.set(user.id, record);
    if (++record.count > 120) {
      res.setHeader("Retry-After", Math.ceil((record.until - now) / 1e3));
      res.status(429).json({ error: "Please wait a moment before syncing again." });
      return;
    }
    next();
  });
  router.get("/", async (_req, res) => {
    try {
      const user = res.locals.user;
      res.json({ userId: user.id, completedLessonIds: await store.load(user) });
    } catch {
      res.status(503).json({ error: "Cloud progress is unavailable. Your local copy is kept; please retry." });
    }
  });
  router.post("/lessons", async (req, res) => {
    const ids = req.body?.lessonIds;
    if (!req.body || Object.keys(req.body).some((key) => key !== "lessonIds") || !Array.isArray(ids) || !ids.length || ids.length > 1e3 || !ids.every(isLessonId)) {
      res.status(400).json({ error: "Provide between 1 and 1,000 valid lesson IDs only." });
      return;
    }
    try {
      const user = res.locals.user;
      res.json({ userId: user.id, completedLessonIds: await store.complete(user, [...new Set(ids)]) });
    } catch {
      res.status(503).json({ error: "Cloud save failed. Your local copy is kept; please retry." });
    }
  });
  return router;
}

// server.ts
dotenv.config({ path: [".env.local", ".env"], quiet: true });
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var isDev = process.env.NODE_ENV !== "production";
var AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
var GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
var hasGeminiApiKey = GEMINI_API_KEY.length >= 20 && !/(replace|placeholder|your[-_ ]|my_gemini)/i.test(GEMINI_API_KEY);
var configuredTimeout = Number(process.env.AI_TIMEOUT_MS);
var AI_TIMEOUT_MS = Number.isFinite(configuredTimeout) ? Math.min(12e4, Math.max(1e4, configuredTimeout)) : 6e4;
var API_WINDOW_MS = 15 * 60 * 1e3;
var API_REQUEST_LIMIT = 30;
var auth = createAuth({
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY?.trim() || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim() || "",
    projectId: process.env.FIREBASE_PROJECT_ID?.trim() || "",
    appId: process.env.FIREBASE_APP_ID?.trim() || ""
  },
  secret: process.env.AUTH_SESSION_SECRET?.trim() || "",
  origin: (process.env.AUTH_ORIGIN || process.env.GOOGLE_AUTH_ORIGIN || process.env.APP_URL || "").trim().replace(/\/$/, ""),
  production: !isDev
});
var DAILY_QUOTAS = {
  chat: Number(process.env.AI_DAILY_CHAT_LIMIT) || 5,
  pronunciation: Number(process.env.AI_DAILY_PRONUNCIATION_LIMIT) || 10,
  quiz: Number(process.env.AI_DAILY_QUIZ_LIMIT) || 2
};
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use((_req, res, next) => {
  const frameAncestors = process.env.ALLOWED_FRAME_ANCESTORS?.trim() || "'self'";
  res.setHeader("Content-Security-Policy", `frame-ancestors ${frameAncestors};`);
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (frameAncestors === "'self'") res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=(self)");
  next();
});
var apiRequests = /* @__PURE__ */ new Map();
var dailyUsage = /* @__PURE__ */ new Map();
var aiMetrics = {
  accepted: { chat: 0, pronunciation: 0, quiz: 0 },
  succeeded: { chat: 0, pronunciation: 0, quiz: 0 },
  failed: { chat: 0, pronunciation: 0, quiz: 0 },
  quotaRejected: { chat: 0, pronunciation: 0, quiz: 0 }
};
function apiRateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = apiRequests.get(key);
  if (!current || current.resetsAt <= now) {
    apiRequests.set(key, { count: 1, resetsAt: now + API_WINDOW_MS });
    return next();
  }
  if (current.count >= API_REQUEST_LIMIT) {
    res.setHeader("Retry-After", Math.ceil((current.resetsAt - now) / 1e3));
    return res.status(429).json({ error: "Too many AI requests. Please try again later." });
  }
  current.count += 1;
  next();
}
function getIdentityKey(req, res) {
  if (res.locals.user) return `firebase:${res.locals.user.id}`;
  const anonymousId = req.get("X-Anonymous-Id")?.trim() || "";
  const isValidId = /^[a-zA-Z0-9-]{16,80}$/.test(anonymousId);
  const network = req.ip || req.socket.remoteAddress || "unknown";
  return isValidId ? `anonymous:${anonymousId}:${network}` : `network:${network}`;
}
function consumeDailyQuota(req, res, feature) {
  const identity = getIdentityKey(req, res);
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  let usage = dailyUsage.get(identity);
  if (!usage || usage.date !== today) {
    usage = { date: today, chat: 0, pronunciation: 0, quiz: 0 };
    dailyUsage.set(identity, usage);
  }
  const limit = DAILY_QUOTAS[feature];
  const resetAt = (/* @__PURE__ */ new Date(`${today}T00:00:00.000Z`)).getTime() + 24 * 60 * 60 * 1e3;
  const remaining = Math.max(0, limit - usage[feature]);
  res.setHeader("X-AI-Quota-Limit", limit);
  res.setHeader("X-AI-Quota-Remaining", Math.max(0, remaining - 1));
  res.setHeader("X-AI-Quota-Reset", new Date(resetAt).toISOString());
  if (remaining <= 0) {
    aiMetrics.quotaRejected[feature] += 1;
    res.setHeader("X-AI-Quota-Remaining", 0);
    res.status(429).json({
      error: "Daily AI allowance reached. Please try again tomorrow.",
      code: "DAILY_AI_QUOTA_REACHED",
      feature,
      resetAt: new Date(resetAt).toISOString()
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
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  for (const [key, usage] of dailyUsage) {
    if (usage.date !== today) dailyUsage.delete(key);
  }
}, API_WINDOW_MS).unref();
setInterval(() => {
  if (!isDev) console.log(JSON.stringify({ event: "ai_usage_summary", ...aiMetrics }));
}, 60 * 60 * 1e3).unref();
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.locals.requestId = randomUUID();
  res.setHeader("X-Request-Id", res.locals.requestId);
  next();
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured: hasGeminiApiKey,
    environment: isDev ? "development" : "production"
  });
});
app.use("/api", auth.attachUser);
var database = databaseFromEnv();
app.use("/api/progress", createProgressRouter(
  database ? createProgressStore(database) : null,
  (process.env.AUTH_ORIGIN || process.env.GOOGLE_AUTH_ORIGIN || process.env.APP_URL || "").trim().replace(/\/$/, "")
));
app.use("/api", apiRateLimit);
app.use("/api/auth", auth.router);
var ai = hasGeminiApiKey ? new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "singlish-guru/1.0" } }
}) : null;
var TEACHER_SYSTEM_INSTRUCTION = `You are "Teacher Daisy" (\u0DA9\u0DDA\u0DC3\u0DD2 \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DD2\u0DBA), a warm, kind, and encouraging English teacher who teaches spoken English from Sinhala.
Always communicate in a bilingual, friendly Sri Lankan teacher tone, using authentic Sinhala with clear English. Explain Sinhala Subject-Object-Verb versus English Subject-Verb-Object patterns, point out common Sri Lankan English traps warmly, and provide Sinhala phonetic spelling where helpful. Keep responses practical, concise, safe, and encouraging.`;
function requireAi(res) {
  if (!ai) {
    res.status(503).json({ error: "AI service is not configured." });
    return null;
  }
  return ai;
}
function hasAiConsentHeader(req, res) {
  if (req.get("X-Privacy-Consent") === "ai-v1") return true;
  res.status(451).json({
    error: "AI processing consent is required.",
    code: "CONSENT_REQUIRED"
  });
  return false;
}
function cleanString(value, maxLength) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned && cleaned.length <= maxLength ? cleaned : null;
}
async function withTimeout(operation) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("AI request timed out")), AI_TIMEOUT_MS);
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
function logApiError(route, res, error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[${res.locals.requestId}] ${route}: ${message}`);
}
function isGeneratedQuestion(value) {
  if (!value || typeof value !== "object") return false;
  const item = value;
  const bounded = (text, max) => typeof text === "string" && text.trim().length > 0 && text.length <= max;
  return bounded(item.id, 60) && bounded(item.sinhalaPrompt, 500) && bounded(item.targetEnglish, 300) && bounded(item.singlishPronunciation, 300) && Array.isArray(item.options) && item.options.length === 4 && item.options.every((option) => bounded(option, 200)) && Number.isInteger(item.correctOptionIndex) && Number(item.correctOptionIndex) >= 0 && Number(item.correctOptionIndex) <= 3 && bounded(item.explanationSinhala, 800);
}
app.post("/api/chat-with-sir", async (req, res) => {
  if (!hasAiConsentHeader(req, res)) return;
  const client = requireAi(res);
  if (!client) return;
  const message = cleanString(req.body?.message, 1e3);
  if (!message) {
    return res.status(400).json({ error: "Message must be between 1 and 1,000 characters." });
  }
  if (!consumeDailyQuota(req, res, "chat")) return;
  const rawHistory = Array.isArray(req.body?.chatHistory) ? req.body.chatHistory.slice(-6) : [];
  const conversationContext = rawHistory.map((item) => {
    if (!item || typeof item !== "object") return null;
    const entry = item;
    const text = cleanString(entry.text, 1e3);
    if (!text) return null;
    return `${entry.sender === "user" ? "Student" : "Teacher Daisy"}: ${text}`;
  }).filter(Boolean).join("\n");
  const prompt = `Previous conversation:
${conversationContext}

Student message:
"${message}"

Respond as Teacher Daisy. Explain clearly using Sinhala script, English examples, and Sinhala phonetic pronunciation where helpful. Keep it welcoming and under 200 words.`;
  try {
    const response = await withTimeout(client.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION, temperature: 0.7 }
    }));
    aiMetrics.succeeded.chat += 1;
    return res.json({ reply: response.text || "\u0DC4\u0DDC\u0DB3 \u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1\u0DBA\u0D9A\u0DCA \u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD! \u0DB1\u0DD0\u0DC0\u0DAD \u0D85\u0DC4\u0DB1\u0DCA\u0DB1." });
  } catch (error) {
    aiMetrics.failed.chat += 1;
    logApiError("/api/chat-with-sir", res, error);
    return res.status(502).json({ error: "Teacher Daisy is temporarily unavailable." });
  }
});
app.post("/api/pronunciation-coach", async (req, res) => {
  if (!hasAiConsentHeader(req, res)) return;
  const client = requireAi(res);
  if (!client) return;
  const targetPhrase = cleanString(req.body?.targetPhrase, 300);
  const spokenTranscript = cleanString(req.body?.spokenTranscript, 300);
  if (!targetPhrase || !spokenTranscript) {
    return res.status(400).json({ error: "Both phrases must be between 1 and 300 characters." });
  }
  if (!consumeDailyQuota(req, res, "pronunciation")) return;
  const prompt = `The student is a native Sinhala speaker learning English pronunciation.
Target English sentence: "${targetPhrase}"
Speech-to-text transcript: "${spokenTranscript}"

Explain in 2-4 encouraging Sinhala sentences which sounds may need attention. Do not claim to have analyzed audio; you only have the transcript. Include one practical tip with English examples.`;
  try {
    const response = await withTimeout(client.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION, temperature: 0.5 }
    }));
    aiMetrics.succeeded.pronunciation += 1;
    return res.json({ feedbackSinhala: response.text || "\u0DC0\u0DD2\u0DC1\u0DD2\u0DC2\u0DCA\u0DA7 \u0D8B\u0DAD\u0DCA\u0DC3\u0DCF\u0DC4\u0DBA\u0D9A\u0DCA! \u0DAF\u0DD2\u0D9C\u0DA7\u0DB8 \u0DC4\u0DAC \u0DB1\u0D9C\u0DCF \u0DB4\u0DD4\u0DC4\u0DD4\u0DAB\u0DD4 \u0DC0\u0DB1\u0DCA\u0DB1." });
  } catch (error) {
    aiMetrics.failed.pronunciation += 1;
    logApiError("/api/pronunciation-coach", res, error);
    return res.status(502).json({ error: "Pronunciation coaching is temporarily unavailable." });
  }
});
app.post("/api/generate-lesson-questions", async (req, res) => {
  if (!hasAiConsentHeader(req, res)) return;
  const client = requireAi(res);
  if (!client) return;
  const topic = cleanString(req.body?.topic ?? "Everyday Spoken English", 120);
  if (!topic) {
    return res.status(400).json({ error: "Topic must be between 1 and 120 characters." });
  }
  if (!consumeDailyQuota(req, res, "quiz")) return;
  const prompt = `Generate 3 beginner spoken-English questions for a Sinhala-speaking learner about "${topic}". Return strict JSON with a questions array. Each item must contain id, sinhalaPrompt, targetEnglish, singlishPronunciation, exactly four options, correctOptionIndex from 0 to 3, and explanationSinhala.`;
  try {
    const response = await withTimeout(client.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { systemInstruction: TEACHER_SYSTEM_INSTRUCTION, responseMimeType: "application/json" }
    }));
    const parsed = JSON.parse(response.text || "{}");
    if (!Array.isArray(parsed.questions) || parsed.questions.length !== 3 || !parsed.questions.every(isGeneratedQuestion)) {
      throw new Error("AI returned an invalid question set");
    }
    aiMetrics.succeeded.quiz += 1;
    return res.json(parsed);
  } catch (error) {
    aiMetrics.failed.quiz += 1;
    logApiError("/api/generate-lesson-questions", res, error);
    return res.status(502).json({ error: "New questions are temporarily unavailable." });
  }
});
app.all("/api/*", (_req, res) => res.status(404).json({ error: "API route not found." }));
app.use((error, _req, res, next) => {
  if (!error) return next();
  const message = error instanceof Error ? error.message : "";
  if (message.includes("request entity too large")) {
    return res.status(413).json({ error: "Request body is too large." });
  }
  console.error(`[${res.locals.requestId || "no-request-id"}] Request error: ${message || "Unknown error"}`);
  return res.status(400).json({ error: "Invalid request." });
});
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath, { maxAge: "1d", etag: true }));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Singlish Guru running on port ${PORT} (${isDev ? "development" : "production"})`);
  });
}
var isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
var isTestRun = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST) || Boolean(process.env.VITEST_WORKER_ID) || process.argv.some((argument) => argument.toLowerCase().includes("vitest"));
if (isDirectRun && !isTestRun) {
  startServer().catch((error) => {
    console.error("Failed to start Singlish Guru:", error);
    process.exit(1);
  });
}
export {
  app,
  startServer
};
