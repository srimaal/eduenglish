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

// src/data/lessonsData.ts
var DOMAINS_DATA = [
  // 1. Everyday Greetings & Introductions (Lessons 1 - 50)
  {
    domain: "Everyday Greetings & Introductions",
    domainSinhala: "\u0D86\u0DA0\u0DCF\u0DBB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DCA \u0DC3\u0DC4 \u0DC3\u0DCA\u0DC0\u0DBA\u0D82 \u0DC4\u0DD0\u0DB3\u0DD2\u0DB1\u0DCA\u0DC0\u0DD3\u0DB8\u0DCA",
    subtopics: [
      {
        titleEn: "Morning & Daytime Greetings",
        titleSi: "\u0D8B\u0DAF\u0DD1\u0DC3\u0DB1 \u0DC3\u0DC4 \u0DAF\u0DC4\u0DC0\u0DBD\u0DCA \u0D86\u0DA0\u0DCF\u0DBB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DCA",
        ruleTitleSi: "\u0DC0\u0DDA\u0DBD\u0DCF\u0DC0 \u0D85\u0DB1\u0DD4\u0DC0 \u0D86\u0DA0\u0DCF\u0DBB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DDA \u0DBB\u0DD3\u0DAD\u0DD2\u0DBA",
        ruleExplainSi: '\u0D8B\u0DAF\u0DD1\u0DC3\u0DB1 12 \u0DAF\u0D9A\u0DCA\u0DC0\u0DCF "Good morning" \u0DAF, \u0DAF\u0DC4\u0DC0\u0DBD\u0DCA 12 \u0DC3\u0DD2\u0DA7 \u0DC3\u0DC0\u0DC3 5 \u0DAF\u0D9A\u0DCA\u0DC0\u0DCF "Good afternoon" \u0DAF \u0DBA\u0DDC\u0DAF\u0DBA\u0DD2.',
        phrases: [
          { en: "Good morning, how are you doing today?", si: "\u0DC3\u0DD4\u0DB6 \u0D8B\u0DAF\u0DD1\u0DC3\u0DB1\u0D9A\u0DCA, \u0D85\u0DAF \u0D94\u0DB6\u0DA7 \u0D9A\u0DDC\u0DC4\u0DDC\u0DB8\u0DAF?", singlish: "[\u0D9C\u0DD4\u0DA9\u0DCA \u0DB8\u0DDD\u0DB1\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA, \u0DC4\u0DC0\u0DD4 \u0D86\u0DBB\u0DCA \u0DBA\u0DD6 \u0DA9\u0DD6\u0DBA\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DA7\u0DD4\u0DA9\u0DDA?]", tip: 'Morning \u0DC4\u0DD2 "\u0DBB\u0DCA" \u0DB8\u0DD8\u0DAF\u0DD4\u0DC0 \u0D8B\u0DA0\u0DCA\u0DA0\u0DCF\u0DBB\u0DAB\u0DBA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.' },
          { en: "Good afternoon, Teacher Daisy!", si: "\u0DC3\u0DD4\u0DB6 \u0DAF\u0DC4\u0DC0\u0DBD\u0D9A\u0DCA, \u0DA9\u0DDA\u0DC3\u0DD2 \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DD2\u0DBA\u0DB1\u0DD2!", singlish: "[\u0D9C\u0DD4\u0DA9\u0DCA \u0D86\u0DC6\u0DCA\u0DA7\u0DBB\u0DCA\u0DB1\u0DD6\u0DB1\u0DCA, \u0DA7\u0DD3\u0DA0\u0DBB\u0DCA \u0DA9\u0DDA\u0DC3\u0DD2!]", tip: 'Afternoon \u0DC4\u0DD2 "noon" \u0DAF\u0DD2\u0D9C\u0DD4 \u0D9A\u0DBB \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
          { en: "I am pleased to meet you.", si: "\u0D94\u0DB6\u0DC0 \u0DC4\u0DB8\u0DD4\u0DC0\u0DD3\u0DB8 \u0DC3\u0DAD\u0DD4\u0DA7\u0D9A\u0DCA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA\u0DA9\u0DCA \u0DA7\u0DD4 \u0DB8\u0DD3\u0DA7\u0DCA \u0DBA\u0DD6]", tip: 'Pleased \u0DC4\u0DD2 "d" \u0DC1\u0DB6\u0DCA\u0DAF\u0DBA \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.' },
          { en: "Have a wonderful and blessed day.", si: "\u0DC3\u0DD4\u0DB1\u0DCA\u0DAF\u0DBB \u0D86\u0DC1\u0DD2\u0DBB\u0DCA\u0DC0\u0DCF\u0DAF\u0DB8\u0DAD\u0DCA \u0DAF\u0DC0\u0DC3\u0D9A\u0DCA \u0DC0\u0DDA\u0DC0\u0DCF.", singlish: "[\u0DC4\u0DD1\u0DC0\u0DCA \u0D85 \u0DC0\u0DB1\u0DCA\u0DA9\u0DBB\u0DCA\u0DC6\u0DD4\u0DBD\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DB6\u0DCA\u0DBD\u0DD9\u0DC3\u0DCA\u0DA9\u0DCA \u0DA9\u0DDA]", tip: "Blessed [\u0DB6\u0DCA\u0DBD\u0DD9\u0DC3\u0DCA\u0DA9\u0DCA] \u0DBD\u0DD9\u0DC3 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "See you again around five o'clock.", si: "\u0DB4\u0DC4\u0DA7 \u0DB4\u0DB8\u0DAB \u0DB1\u0DD0\u0DC0\u0DAD \u0DC4\u0DB8\u0DD4\u0DC0\u0DD9\u0DB8\u0DD4.", singlish: "[\u0DC3\u0DD3 \u0DBA\u0DD6 \u0D85\u0D9C\u0DDA\u0DB1\u0DCA \u0D85\u0DBB\u0DC0\u0DD4\u0DB1\u0DCA\u0DA9\u0DCA \u0DC6\u0DBA\u0DD2\u0DC0\u0DCA \u0D94\u0D9A\u0DCA\u0DBD\u0DDC\u0D9A\u0DCA]", tip: `O'clock \u0DC4\u0DD2 "k" \u0DB1\u0DC0\u0DAD\u0DCA\u0DC0\u0DB1\u0DCA\u0DB1.` }
        ],
        mistake: { incorrect: "Good night, how are you?", correct: "Good evening, how are you?", explanationSinhala: '"Good night" \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1\u0DDA \u0DBB\u0DCF\u0DAD\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DDA \u0DC3\u0DB8\u0DD4\u0D9C\u0DB1\u0DCA\u0DB1\u0DCF \u0DC0\u0DD2\u0DA7 \u0DB4\u0DB8\u0DAB\u0DD2. \u0DC4\u0DB8\u0DD4\u0DC0\u0DB1 \u0DC0\u0DD2\u0DA7 "Good evening" \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD, \u0DB8\u0DD4\u0DC4\u0DD4\u0DAB\u0DDA \u0DB8\u0DB3\u0DC4\u0DC3\u0D9A\u0DCA \u0DAD\u0DD2\u0DBA\u0DCF\u0D9C\u0DD9\u0DB1 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1. \u0D86\u0DA0\u0DCF\u0DBB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DD9\u0DB1\u0DCA \u0DC3\u0DD4\u0DC4\u0DAF\u0DAD\u0DCF\u0DC0 \u0D9C\u0DDC\u0DA9\u0DB1\u0DD0\u0D9C\u0DDA."
      },
      {
        titleEn: "Introducing Yourself Confidently",
        titleSi: "\u0DAD\u0DB8\u0DB1\u0DCA\u0DC0 \u0D86\u0DAD\u0DCA\u0DB8 \u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DCF\u0DC3\u0DBA\u0DD9\u0DB1\u0DCA \u0DC4\u0DB3\u0DD4\u0DB1\u0DCA\u0DC0\u0DCF \u0DAF\u0DD3\u0DB8",
        ruleTitleSi: "\u0DB1\u0DB8 \u0DC3\u0DC4 \u0D9C\u0DB8 \u0DB4\u0DD0\u0DC0\u0DC3\u0DD3\u0DB8\u0DDA \u0DBB\u0DA7\u0DCF\u0DC0 (I am from...)",
        ruleExplainSi: '"My name is..." \u0DC4\u0DDD "I am..." \u0D9A\u0DD2\u0DBA\u0DCF \u0DB1\u0DB8 \u0DB4\u0DC0\u0DC3\u0DCF, "I am from Kandy" \u0DBD\u0DD9\u0DC3 \u0DB4\u0DAF\u0DD2\u0D82\u0DA0\u0DD2 \u0DB4\u0DCA\u200D\u0DBB\u0DAF\u0DDA\u0DC1\u0DBA \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "My name is Nimal and I am from Galle.", si: "\u0DB8\u0D9C\u0DDA \u0DB1\u0DB8 \u0DB1\u0DD2\u0DB8\u0DBD\u0DCA, \u0DB8\u0DB8 \u0D9C\u0DCF\u0DBD\u0DCA\u0DBD\u0DDA \u0DC3\u0DD2\u0DA7 \u0D91\u0DB1\u0DCA\u0DB1\u0DDA.", singlish: "[\u0DB8\u0DBA\u0DD2 \u0DB1\u0DDA\u0DB8\u0DCA \u0D89\u0DC3\u0DCA \u0DB1\u0DD2\u0DB8\u0DBD\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0DC6\u0DCA\u200D\u0DBB\u0DDC\u0DB8\u0DCA \u0D9C\u0DDD\u0DBD\u0DCA]", tip: 'Name \u0DC4\u0DD2 "m" \u0D85\u0D9A\u0DD4\u0DBB \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0DAD\u0DB6\u0DB1\u0DCA\u0DB1.' },
          { en: "I am a school teacher by profession.", si: "\u0DB8\u0DB8 \u0DC0\u0DD8\u0DAD\u0DCA\u0DAD\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0DB4\u0DCF\u0DC3\u0DBD\u0DCA \u0D9C\u0DD4\u0DBB\u0DD4\u0DC0\u0DBB\u0DBA\u0DD9\u0D9A\u0DCA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0D85 \u0DC3\u0DCA\u0D9A\u0DD6\u0DBD\u0DCA \u0DA7\u0DD3\u0DA0\u0DBB\u0DCA \u0DB6\u0DBA\u0DD2 \u0DB4\u0DCA\u200D\u0DBB\u0DDC\u0DC6\u0DD9\u0DC2\u0DB1\u0DCA]", tip: "Profession [\u0DB4\u0DCA\u200D\u0DBB\u0DDC\u0DC6\u0DD9\u0DC2\u0DB1\u0DCA] \u0DBD\u0DD9\u0DC3 \u0DC1\u0DB6\u0DCA\u0DAF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1." },
          { en: "I graduated from university recently.", si: "\u0DB8\u0DB8 \u0DB8\u0DD1\u0DAD\u0D9A\u0DAF\u0DD3 \u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DC0\u0DD2\u0DAF\u0DCA\u200D\u0DBA\u0DCF\u0DBD\u0DBA\u0DD9\u0DB1\u0DCA \u0D8B\u0DB4\u0DCF\u0DB0\u0DD2\u0DBA \u0DBD\u0DD0\u0DB6\u0DD4\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D9C\u0DCA\u200D\u0DBB\u0DD0\u0DA2\u0DD4\u0DC0\u0DD9\u0DBA\u0DD2\u0DA7\u0DA9\u0DCA \u0DC6\u0DCA\u200D\u0DBB\u0DDC\u0DB8\u0DCA \u0DBA\u0DD4\u0DB1\u0DD2\u0DC0\u0DBB\u0DCA\u0DC3\u0DD2\u0DA7\u0DD2 \u0DBB\u0DD3\u0DC3\u0DB1\u0DCA\u0DA7\u0DCA\u0DBD\u0DD2]", tip: "Recently [\u0DBB\u0DD3\u0DC3\u0DB1\u0DCA\u0DA7\u0DCA\u0DBD\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "It is an honor to introduce myself to you.", si: "\u0D94\u0DB6\u0DA7 \u0DB8\u0DCF\u0DC0 \u0DC4\u0DB3\u0DD4\u0DB1\u0DCA\u0DC0\u0DCF \u0DAF\u0DD3\u0DB8\u0DA7 \u0DBD\u0DD0\u0DB6\u0DD3\u0DB8 \u0D9C\u0DDE\u0DBB\u0DC0\u0DBA\u0D9A\u0DCA.", singlish: "[\u0D89\u0DA7\u0DCA \u0D89\u0DC3\u0DCA \u0D87\u0DB1\u0DCA \u0D94\u0DB1\u0DBB\u0DCA \u0DA7\u0DD4 \u0D89\u0DB1\u0DCA\u0DA7\u0DCA\u200D\u0DBB\u0DA9\u0DD2\u0DBA\u0DD4\u0DC3\u0DCA \u0DB8\u0DBA\u0DD2\u0DC3\u0DD9\u0DBD\u0DCA\u0DC6\u0DCA \u0DA7\u0DD4 \u0DBA\u0DD6]", tip: 'Honor \u0DC4\u0DD2 "H" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA (\u0D94\u0DB1\u0DBB\u0DCA).' },
          { en: "I live with my loving family in Colombo.", si: "\u0DB8\u0DB8 \u0DB8\u0D9C\u0DDA \u0DB4\u0DC0\u0DD4\u0DBD \u0DC3\u0DB8\u0D9F \u0D9A\u0DDC\u0DC5\u0DB9 \u0DA2\u0DD3\u0DC0\u0DAD\u0DCA \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DBD\u0DD2\u0DC0\u0DCA \u0DC0\u0DD2\u0DAD\u0DCA \u0DB8\u0DBA\u0DD2 \u0DBD\u0DC0\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DC6\u0DD0\u0DB8\u0DD2\u0DBD\u0DD2 \u0D89\u0DB1\u0DCA \u0D9A\u0DBD\u0DB8\u0DCA\u0DB6\u0DDD]", tip: "Live [\u0DBD\u0DD2\u0DC0\u0DCA] \u0D9A\u0DD9\u0DA7\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "Myself Kamal.", correct: "I am Kamal. / My name is Kamal.", explanationSinhala: '\u0D9A\u0DC0\u0DAF\u0DCF\u0DC0\u0DAD\u0DCA "Myself Kamal" \u0D9A\u0DD2\u0DBA\u0DCF \u0DC4\u0DB3\u0DD4\u0DB1\u0DCA\u0DC0\u0DCF \u0DB1\u0DDC\u0DAF\u0DD9\u0DB1\u0DCA\u0DB1. "I am Kamal" \u0DBA\u0DB1\u0DD4 \u0DB1\u0DD2\u0DC0\u0DD0\u0DBB\u0DAF\u0DD2 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DBA\u0DD2.' },
        adviceSi: "\u0DC4\u0DB3\u0DD4\u0DB1\u0DCA\u0DC0\u0DCF \u0DAF\u0DD3\u0DB8\u0DDA\u0DAF\u0DD3 \u0D9A\u0DD9\u0DC5\u0DD2\u0DB1\u0DCA \u0DB6\u0DBD\u0DCF \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0DC4\u0DAC\u0DD2\u0DB1\u0DCA \u0DB1\u0DB8 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD!"
      }
    ]
  },
  // 2. Sinhala SOV to English SVO Structure (Lessons 51 - 100)
  {
    domain: "Sinhala SOV to English SVO Structure",
    domainSinhala: "\u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA \u0DBB\u0DA7\u0DCF\u0DC0\u0DDA \u0DBB\u0DB1\u0DCA \u0DBB\u0DD3\u0DAD\u0DD2\u0DBA (SVO)",
    subtopics: [
      {
        titleEn: "Moving Verbs to the Center",
        titleSi: "\u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF\u0DBA \u0DB8\u0DD0\u0DAF\u0DA7 \u0D9C\u0DD9\u0DB1 \u0D92\u0DB8",
        ruleTitleSi: "Subject + Verb + Object (S-V-O)",
        ruleExplainSi: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD\u0DD9\u0DB1\u0DCA \u0D9A\u0DBB\u0DCA\u0DB8\u0DBA \u0DB8\u0DD0\u0DAF\u0DA7 \u0D86\u0DC0\u0DAF \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF\u0DBA \u0DB8\u0DD0\u0DAF\u0DA7 \u0DB4\u0DD0\u0DB8\u0DD2\u0DAB\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA (I drink tea, not I tea drink).",
        phrases: [
          { en: "I eat hoppers and spicy lunu miris.", si: "\u0DB8\u0DB8 \u0D86\u0DB4\u0DCA\u0DB4 \u0DC3\u0DC4 \u0DBD\u0DD4\u0DAB\u0DD4 \u0DB8\u0DD2\u0DBB\u0DD2\u0DC3\u0DCA \u0D9A\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D8A\u0DA7\u0DCA \u0DC4\u0DDC\u0DB4\u0DBB\u0DCA\u0DC3\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DC3\u0DCA\u0DB4\u0DBA\u0DD2\u0DC3\u0DD2 \u0DBD\u0DD4\u0DAB\u0DD4 \u0DB8\u0DD2\u0DBB\u0DD2\u0DC3\u0DCA]", tip: "Spicy [\u0DC3\u0DCA\u0DB4\u0DBA\u0DD2\u0DC3\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "My mother prepares fresh milk rice.", si: "\u0DB8\u0D9C\u0DDA \u0DB8\u0DC0 \u0DB1\u0DD0\u0DC0\u0DD4\u0DB8\u0DCA \u0D9A\u0DD2\u0DBB\u0DD2\u0DB6\u0DAD\u0DCA \u0DB4\u0DD2\u0DC5\u0DD2\u0DBA\u0DD9\u0DC5 \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DB8\u0DBA\u0DD2 \u0DB8\u0DAF\u0DBB\u0DCA \u0DB4\u0DCA\u200D\u0DBB\u0DD2\u0DB4\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA\u0DC3\u0DCA \u0DC6\u0DCA\u200D\u0DBB\u0DD9\u0DC2\u0DCA \u0DB8\u0DD2\u0DBD\u0DCA\u0D9A\u0DCA \u0DBB\u0DBA\u0DD2\u0DC3\u0DCA]", tip: 'Prepares [\u0DB4\u0DCA\u200D\u0DBB\u0DD2\u0DB4\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA\u0DC3\u0DCA] \u0DC4\u0DD2 "s" \u0DC1\u0DB6\u0DCA\u0DAF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.' },
          { en: "The children play cricket on the ground.", si: "\u0DC5\u0DB8\u0DBA\u0DD2 \u0DB4\u0DD2\u0DA7\u0DCA\u0DA7\u0DB1\u0DD2\u0DBA\u0DDA \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0D9A\u0DA7\u0DCA \u0DC3\u0DD9\u0DBD\u0DCA\u0DBD\u0DB8\u0DCA \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DAF \u0DA0\u0DD2\u0DBD\u0DCA\u0DA9\u0DCA\u200D\u0DBB\u0DB1\u0DCA \u0DB4\u0DCA\u0DBD\u0DDA \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0D9A\u0DA7\u0DCA \u0D94\u0DB1\u0DCA \u0DAF \u0D9C\u0DCA\u200D\u0DBB\u0DC0\u0DD4\u0DB1\u0DCA\u0DA9\u0DCA]", tip: 'Ground [\u0D9C\u0DCA\u200D\u0DBB\u0DC0\u0DD4\u0DB1\u0DCA\u0DA9\u0DCA] \u0DC4\u0DD2 "d" \u0DAD\u0DB6\u0DB1\u0DCA\u0DB1.' },
          { en: "We listen to Teacher Daisy carefully.", si: "\u0D85\u0DB4\u0DD2 \u0DA9\u0DDA\u0DC3\u0DD2 \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DD2\u0DBA\u0DA7 \u0DC4\u0DDC\u0DB3\u0DD2\u0DB1\u0DCA \u0DC3\u0DC0\u0DB1\u0DCA \u0DAF\u0DD9\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC0\u0DD3 \u0DBD\u0DD2\u0DC3\u0DB1\u0DCA \u0DA7\u0DD4 \u0DA7\u0DD3\u0DA0\u0DBB\u0DCA \u0DA9\u0DDA\u0DC3\u0DD2 \u0D9A\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA\u0DC6\u0DD4\u0DBD\u0DD2]", tip: 'Listen \u0DC4\u0DD2 "t" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA (\u0DBD\u0DD2\u0DC3\u0DB1\u0DCA).' },
          { en: "He writes English essays every weekend.", si: "\u0D94\u0DC4\u0DD4 \u0DC3\u0DD1\u0DB8 \u0DC3\u0DAD\u0DD2 \u0D85\u0DB1\u0DCA\u0DAD\u0DBA\u0D9A\u0DB8 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DBB\u0DA0\u0DB1\u0DCF \u0DBD\u0DD2\u0DBA\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC4\u0DD3 \u0DBB\u0DBA\u0DD2\u0DA7\u0DCA\u0DC3\u0DCA \u0D89\u0DB1\u0DCA\u0D9C\u0DCA\u0DBD\u0DD2\u0DC2\u0DCA \u0D91\u0DC3\u0DDA\u0DC3\u0DCA \u0D91\u0DC0\u0DCA\u0DBB\u0DD2 \u0DC0\u0DD3\u0D9A\u0DCA\u0D91\u0DB1\u0DCA\u0DA9\u0DCA]", tip: 'Writes [\u0DBB\u0DBA\u0DD2\u0DA7\u0DCA\u0DC3\u0DCA] \u0DC4\u0DD2 "w" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA\u0DD2.' }
        ],
        mistake: { incorrect: "I tea drink.", correct: "I drink tea.", explanationSinhala: '\u0DC3\u0DD2\u0D82\u0DC4\u0DBD\u0DD9\u0DB1\u0DCA "\u0DB8\u0DB8 \u0DAD\u0DDA \u0DB6\u0DDC\u0DB1\u0DC0\u0DCF" \u0DC0\u0DD4\u0DC0\u0DAD\u0DCA \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0 \u0DB8\u0DD0\u0DAF\u0DA7 \u0DB4\u0DD0\u0DB8\u0DD2\u0DAB "I drink tea" \u0DC0\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA.' },
        adviceSi: "\u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0 \u0DB8\u0DD0\u0DAF\u0DA7 \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8 \u0DB1\u0DD2\u0DAD\u0DBB \u0DC3\u0DD2\u0DC4\u0DD2\u0DB4\u0DAD\u0DCA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1. \u0D91\u0DC0\u0DD2\u0DA7 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA \u0D89\u0DB6\u0DDA\u0DB8 \u0D9C\u0DBD\u0DCF \u0D91\u0DBA\u0DD2!"
      }
    ]
  },
  // 3. To Be Verbs: Am, Is, Are, Was, Were (Lessons 101 - 150)
  {
    domain: "To Be Verbs (Am, Is, Are, Was, Were)",
    domainSinhala: "To Be \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF (Am, Is, Are, Was, Were)",
    subtopics: [
      {
        titleEn: "State of Being in Present & Past",
        titleSi: "\u0DC0\u0DBB\u0DCA\u0DAD\u0DB8\u0DCF\u0DB1 \u0DC3\u0DC4 \u0D85\u0DAD\u0DD3\u0DAD \u0DB4\u0DD0\u0DC0\u0DD0\u0DAD\u0DCA\u0DB8",
        ruleTitleSi: "To Be \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD\u0DBA",
        ruleExplainSi: "I am, He/She/It is, We/You/They are \u0DC0\u0DBB\u0DCA\u0DAD\u0DB8\u0DCF\u0DB1\u0DBA\u0DA7\u0DAF, Was/Were \u0D85\u0DAD\u0DD3\u0DAD\u0DBA\u0DA7\u0DAF \u0DBA\u0DDC\u0DAF\u0DBA\u0DD2.",
        phrases: [
          { en: "I am ready to learn spoken English.", si: "\u0DB8\u0DB8 \u0D9A\u0DAE\u0DB1 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0D89\u0D9C\u0DD9\u0DB1 \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DA7 \u0DC3\u0DD6\u0DAF\u0DCF\u0DB1\u0DB8\u0DCA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0DBB\u0DD9\u0DA9\u0DD2 \u0DA7\u0DD4 \u0DBD\u0DBB\u0DCA\u0DB1\u0DCA \u0DC3\u0DCA\u0DB4\u0DDD\u0D9A\u0DB1\u0DCA \u0D89\u0DB1\u0DCA\u0D9C\u0DCA\u0DBD\u0DD2\u0DC2\u0DCA]", tip: "Ready [\u0DBB\u0DD9\u0DA9\u0DD2] \u0D9A\u0DD9\u0DA7\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "She is an intelligent and kind student.", si: "\u0D87\u0DBA \u0DB6\u0DD4\u0DAF\u0DCA\u0DB0\u0DD2\u0DB8\u0DAD\u0DCA \u0DC3\u0DC4 \u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0DC0\u0DB1\u0DCA\u0DAD \u0DC1\u0DD2\u0DC2\u0DCA\u200D\u0DBA\u0DCF\u0DC0\u0D9A\u0DD2.", singlish: "[\u0DC2\u0DD3 \u0D89\u0DC3\u0DCA \u0D87\u0DB1\u0DCA \u0D89\u0DB1\u0DCA\u0DA7\u0DD9\u0DBD\u0DD2\u0DA2\u0DB1\u0DCA\u0DA7\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0D9A\u0DBA\u0DD2\u0DB1\u0DCA\u0DA9\u0DCA \u0DC3\u0DCA\u0DA7\u0DD4\u0DA9\u0DB1\u0DCA\u0DA7\u0DCA]", tip: "Intelligent [\u0D89\u0DB1\u0DCA\u0DA7\u0DD9\u0DBD\u0DD2\u0DA2\u0DB1\u0DCA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "They are very eager to practice speaking.", si: "\u0D94\u0DC0\u0DD4\u0DB1\u0DCA \u0D9A\u0DAD\u0DCF \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7 \u0DB4\u0DD4\u0DC4\u0DD4\u0DAB\u0DD4 \u0DC0\u0DD3\u0DB8\u0DA7 \u0DB8\u0DC4\u0DAD\u0DCA \u0D8B\u0DB1\u0DB1\u0DCA\u0DAF\u0DD4\u0DC0\u0D9A\u0DCA \u0DAF\u0D9A\u0DCA\u0DC0\u0DBA\u0DD2.", singlish: "[\u0DAF\u0DDA \u0D86\u0DBB\u0DCA \u0DC0\u0DD9\u0DBB\u0DD2 \u0D8A\u0D9C\u0DBB\u0DCA \u0DA7\u0DD4 \u0DB4\u0DCA\u200D\u0DBB\u0DD0\u0D9A\u0DCA\u0DA7\u0DD2\u0DC3\u0DCA \u0DC3\u0DCA\u0DB4\u0DD3\u0D9A\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA]", tip: "Eager [\u0D8A\u0D9C\u0DBB\u0DCA] \u0DBA\u0DB1\u0DD4 \u0D8B\u0DB1\u0DB1\u0DCA\u0DAF\u0DD4\u0DC0\u0DBA\u0DD2." },
          { en: "We were present at the meeting yesterday.", si: "\u0D85\u0DB4\u0DD2 \u0D8A\u0DBA\u0DDA \u0DBB\u0DD0\u0DC3\u0DCA\u0DC0\u0DD3\u0DB8\u0DA7 \u0DC3\u0DC4\u0DB7\u0DCF\u0D9C\u0DD3 \u0DC0\u0DD3 \u0DC3\u0DD2\u0DA7\u0DD2\u0DBA\u0DD9\u0DB8\u0DD4.", singlish: "[\u0DC0\u0DD3 \u0DC0\u0DBB\u0DCA \u0DB4\u0DCA\u200D\u0DBB\u0DD9\u0DC3\u0DB1\u0DCA\u0DA7\u0DCA \u0D87\u0DA7\u0DCA \u0DAF \u0DB8\u0DD3\u0DA7\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DBA\u0DD9\u0DC3\u0DCA\u0DA7\u0DBB\u0DCA\u0DA9\u0DDA]", tip: "Present [\u0DB4\u0DCA\u200D\u0DBB\u0DD9\u0DC3\u0DB1\u0DCA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "It is a wonderful opportunity for us.", si: "\u0D91\u0DBA \u0D85\u0DB4\u0DA7 \u0DBD\u0DD0\u0DB6\u0DD4\u0DAB\u0DD4 \u0D85\u0DB4\u0DD6\u0DBB\u0DD4 \u0D85\u0DC0\u0DC3\u0DCA\u0DAE\u0DCF\u0DC0\u0D9A\u0DCA.", singlish: "[\u0D89\u0DA7\u0DCA \u0D89\u0DC3\u0DCA \u0D85 \u0DC0\u0DB1\u0DCA\u0DA9\u0DBB\u0DCA\u0DC6\u0DD4\u0DBD\u0DCA \u0D94\u0DB4\u0DA0\u0DD4\u0DB1\u0DD2\u0DA7\u0DD2 \u0DC6\u0DDD \u0D85\u0DC3\u0DCA]", tip: "Opportunity [\u0D94\u0DB4\u0DA0\u0DD4\u0DB1\u0DD2\u0DA7\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "They is ready.", correct: "They are ready.", explanationSinhala: '\u0DB6\u0DC4\u0DD4\u0DC0\u0DA0\u0DB1 (They/We) \u0DC3\u0DB3\u0DC4\u0DCF "are" \u0DBA\u0DD9\u0DAF\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA. "is" \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1\u0DDA \u0D92\u0D9A\u0DC0\u0DA0\u0DB1 \u0DC3\u0DB3\u0DC4\u0DCF \u0DB4\u0DB8\u0DAB\u0DD2.' },
        adviceSi: '\u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD, I \u0DC3\u0DB3\u0DC4\u0DCF "am" \u0DB4\u0DB8\u0DAB\u0D9A\u0DCA \u0DBA\u0DD9\u0DAF\u0DD3\u0DB8\u0DA7 \u0DB1\u0DD2\u0DAD\u0DBB \u0DC0\u0D9C\u0DB6\u0DBD\u0DCF \u0D9C\u0DB1\u0DCA\u0DB1!'
      }
    ]
  },
  // 4. Daily Habits & Present Simple (Lessons 151 - 200)
  {
    domain: "Daily Habits & Present Simple",
    domainSinhala: "\u0DAF\u0DDB\u0DB1\u0DD2\u0D9A \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0DC3\u0DC4 \u0DC3\u0DBB\u0DBD \u0DC0\u0DBB\u0DCA\u0DAD\u0DB8\u0DCF\u0DB1\u0DBA",
    subtopics: [
      {
        titleEn: "Everyday Morning & Evening Routines",
        titleSi: "\u0DAF\u0DDB\u0DB1\u0DD2\u0D9A \u0D8B\u0DAF\u0DD1\u0DC3\u0DB1 \u0DC3\u0DC4 \u0DC3\u0DC0\u0DC3 \u0DA0\u0DBB\u0DCA\u0DBA\u0DCF\u0DC0\u0DB1\u0DCA",
        ruleTitleSi: '\u0DAD\u0DD9\u0DC0\u0DB1 \u0DB4\u0DCF\u0DBB\u0DCA\u0DC1\u0DCA\u0DC0 \u0D92\u0D9A\u0DC0\u0DA0\u0DB1\u0DBA\u0DA7 "s/es" \u0D91\u0D9A\u0DAD\u0DD4 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8',
        ruleExplainSi: 'He, She, It \u0DC3\u0DB8\u0D9F \u0DC0\u0DBB\u0DCA\u0DAD\u0DB8\u0DCF\u0DB1 \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF\u0DBA\u0DA7 "s" \u0DC4\u0DDD "es" \u0D91\u0D9A\u0DCA\u0DC0\u0DDA (He wakes up early).',
        phrases: [
          { en: "I wake up at five in the morning.", si: "\u0DB8\u0DB8 \u0D8B\u0DAF\u0DD1\u0DC3\u0DB1 \u0DB4\u0DC4\u0DA7 \u0D85\u0DC0\u0DAF\u0DD2 \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC0\u0DDA\u0D9A\u0DCA \u0D85\u0DB4\u0DCA \u0D87\u0DA7\u0DCA \u0DC6\u0DBA\u0DD2\u0DC0\u0DCA \u0D89\u0DB1\u0DCA \u0DAF \u0DB8\u0DDD\u0DB1\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA]", tip: "Wake up [\u0DC0\u0DDA\u0D9A\u0DCA \u0D85\u0DB4\u0DCA] \u0D91\u0D9A\u0DA7 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "He brushes his teeth and washes his face.", si: "\u0D94\u0DC4\u0DD4 \u0DAF\u0DAD\u0DCA \u0DB8\u0DD0\u0DAF \u0DB8\u0DD4\u0DC4\u0DD4\u0DAB \u0DC3\u0DDD\u0DAF\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC4\u0DD3 \u0DB6\u0DCA\u200D\u0DBB\u0DC2\u0DC3\u0DCA \u0DC4\u0DD2\u0DC3\u0DCA \u0DA7\u0DD3\u0DAD\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DC0\u0DDC\u0DC2\u0DC3\u0DCA \u0DC4\u0DD2\u0DC3\u0DCA \u0DC6\u0DDA\u0DC3\u0DCA]", tip: "Brushes [\u0DB6\u0DCA\u200D\u0DBB\u0DC2\u0DC3\u0DCA] \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1." },
          { en: "She drinks a glass of warm water.", si: "\u0D87\u0DBA \u0D8B\u0DAB\u0DD4\u0DC3\u0DD4\u0DB8\u0DCA \u0DC0\u0DAD\u0DD4\u0DBB \u0DC0\u0DD3\u0DAF\u0DD4\u0DBB\u0DD4\u0DC0\u0D9A\u0DCA \u0DB6\u0DDC\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC2\u0DD3 \u0DA9\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0D9A\u0DCA\u0DC3\u0DCA \u0D85 \u0D9C\u0DCA\u0DBD\u0DCF\u0DC3\u0DCA \u0D94\u0DC6\u0DCA \u0DC0\u0DDD\u0DB8\u0DCA \u0DC0\u0DDD\u0DA7\u0DBB\u0DCA]", tip: "Warm [\u0DC0\u0DDD\u0DB8\u0DCA] \u0DAF\u0DD2\u0D9C\u0DD4 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1." },
          { en: "We go for a walk in the paddy field.", si: "\u0D85\u0DB4\u0DD2 \u0DC0\u0DD9\u0DBD\u0DCA\u0DBA\u0DCF\u0DBA \u0DB8\u0DD0\u0DAF\u0DD2\u0DB1\u0DCA \u0D87\u0DC0\u0DD2\u0DAF\u0DD2\u0DB1\u0DCA\u0DB1 \u0DBA\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC0\u0DD3 \u0D9C\u0DDD \u0DC6\u0DDD \u0D85 \u0DC0\u0DDD\u0D9A\u0DCA \u0D89\u0DB1\u0DCA \u0DAF \u0DB4\u0DD1\u0DA9\u0DD2 \u0DC6\u0DD3\u0DBD\u0DCA\u0DA9\u0DCA]", tip: 'Walk \u0DC4\u0DD2 "l" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA\u0DD2 (\u0DC0\u0DDD\u0D9A\u0DCA).' },
          { en: "Father reads the daily newspaper with tea.", si: "\u0DAD\u0DCF\u0DAD\u0DCA\u0DAD\u0DCF \u0DAD\u0DDA \u0DC3\u0DB8\u0D9F \u0DAF\u0DD2\u0DB1\u0DB4\u0DAD\u0DCF \u0DB4\u0DD4\u0DC0\u0DAD\u0DCA\u0DB4\u0DAD \u0D9A\u0DD2\u0DBA\u0DC0\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC6\u0DCF\u0DAF\u0DBB\u0DCA \u0DBB\u0DD3\u0DA9\u0DCA\u0DC3\u0DCA \u0DAF \u0DA9\u0DDA\u0DBD\u0DD2 \u0DB1\u0DD2\u0DC0\u0DCA\u0DC3\u0DCA\u0DB4\u0DDA\u0DB4\u0DBB\u0DCA \u0DC0\u0DD2\u0DAD\u0DCA \u0DA7\u0DD3]", tip: "Newspaper [\u0DB1\u0DD2\u0DC0\u0DCA\u0DC3\u0DCA\u0DB4\u0DDA\u0DB4\u0DBB\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "He go to school.", correct: "He goes to school.", explanationSinhala: 'He \u0DC3\u0DB8\u0D9F "go" \u0DB1\u0DDC\u0DC0 "goes" \u0DBA\u0DD9\u0DAF\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA. \u0DAD\u0DD9\u0DC0\u0DB1 \u0DB4\u0DCF\u0DBB\u0DCA\u0DC1\u0DCA\u0DC0\u0DBA\u0DA7 "es" \u0D91\u0D9A\u0DAD\u0DD4 \u0DC0\u0DDA.' },
        adviceSi: '\u0DAF\u0DD2\u0DB1\u0DB4\u0DAD\u0DCF \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0D9A\u0DD2\u0DBA\u0DB1 \u0DC0\u0DD2\u0DA7 "s" \u0DC1\u0DB6\u0DCA\u0DAF\u0DBA \u0D85\u0DB8\u0DAD\u0D9A \u0DB1\u0DDC\u0D9A\u0DBB\u0DB1\u0DCA\u0DB1!'
      }
    ]
  },
  // 5. Asking Spoken Questions (Do, Does, Wh-) (Lessons 201 - 250)
  {
    domain: "Asking Spoken Questions (Do, Does, Wh-)",
    domainSinhala: "\u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1 \u0D87\u0DC3\u0DD3\u0DB8 (Do, Does, Wh-)",
    subtopics: [
      {
        titleEn: "Forming Questions with Wh- & Auxiliary Verbs",
        titleSi: "\u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1 \u0D9C\u0DDC\u0DA9\u0DB1\u0DD0\u0D9C\u0DD3\u0DB8",
        ruleTitleSi: "Wh- \u0DC0\u0DA0\u0DB1\u0DBA + \u0D8B\u0DB4\u0D9A\u0DCF\u0DBB\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0 + \u0D9A\u0DBB\u0DCA\u0DAD\u0DD8 + \u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0",
        ruleExplainSi: '"Where do you live?", "What does he do?" \u0DBB\u0DA7\u0DCF\u0DC0 \u0D85\u0DB1\u0DD4\u0D9C\u0DB8\u0DB1\u0DBA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "What is your favorite subject in school?", si: "\u0DB4\u0DCF\u0DC3\u0DBD\u0DDA \u0D94\u0DB6\u0DDA \u0DB4\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DAD\u0DB8 \u0DC0\u0DD2\u0DC2\u0DBA \u0D9A\u0DD4\u0DB8\u0D9A\u0DCA\u0DAF?", singlish: "[\u0DC0\u0DA7\u0DCA \u0D89\u0DC3\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0DC6\u0DDA\u0DC0\u0DBB\u0DD2\u0DA7\u0DCA \u0DC3\u0DB6\u0DCA\u0DA2\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA \u0D89\u0DB1\u0DCA \u0DC3\u0DCA\u0D9A\u0DD6\u0DBD\u0DCA?]", tip: "Favorite [\u0DC6\u0DDA\u0DC0\u0DBB\u0DD2\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Where do you travel for work every day?", si: "\u0D94\u0DB6 \u0DAF\u0DD2\u0DB1\u0DB4\u0DAD\u0DCF \u0DBB\u0DD0\u0D9A\u0DD2\u0DBA\u0DCF\u0DC0\u0DA7 \u0DBA\u0DB1\u0DCA\u0DB1\u0DDA \u0D9A\u0DDC\u0DC4\u0DDA\u0DAF?", singlish: "[\u0DC0\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA \u0DA9\u0DD6 \u0DBA\u0DD6 \u0DA7\u0DCA\u200D\u0DBB\u0DD0\u0DC0\u0DBD\u0DCA \u0DC6\u0DDD \u0DC0\u0DBB\u0DCA\u0D9A\u0DCA \u0D91\u0DC0\u0DCA\u0DBB\u0DD2 \u0DA9\u0DDA?]", tip: 'Where \u0DC4\u0DD2 "Wh" [\u0DC0\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA] \u0DBD\u0DD9\u0DC3 \u0DC1\u0DB6\u0DCA\u0DAF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.' },
          { en: "Do you speak English at home?", si: "\u0D94\u0DB6 \u0DB1\u0DD2\u0DC0\u0DC3\u0DDA\u0DAF\u0DD3 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF\u0DAF?", singlish: "[\u0DA9\u0DD6 \u0DBA\u0DD6 \u0DC3\u0DCA\u0DB4\u0DD3\u0D9A\u0DCA \u0D89\u0DB1\u0DCA\u0D9C\u0DCA\u0DBD\u0DD2\u0DC2\u0DCA \u0D87\u0DA7\u0DCA \u0DC4\u0DDD\u0DB8\u0DCA?]", tip: 'Speak \u0DC4\u0DD2 "k" \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.' },
          { en: "Why are you smiling so happily?", si: "\u0D94\u0DB6 \u0D94\u0DAD\u0DBB\u0DB8\u0DCA \u0DC3\u0DAD\u0DD4\u0DA7\u0DD2\u0DB1\u0DCA \u0DC3\u0DD2\u0DB1\u0DCF\u0DC3\u0DD9\u0DB1\u0DCA\u0DB1\u0DDA \u0D87\u0DBA\u0DD2?", singlish: "[\u0DC0\u0DBA\u0DD2 \u0D86\u0DBB\u0DCA \u0DBA\u0DD6 \u0DC3\u0DCA\u0DB8\u0DBA\u0DD2\u0DBD\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DC3\u0DDD \u0DC4\u0DD0\u0DB4\u0DD2\u0DBD\u0DD2?]", tip: "Smiling [\u0DC3\u0DCA\u0DB8\u0DBA\u0DD2\u0DBD\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "When does the morning train arrive?", si: "\u0D8B\u0DAF\u0DD1\u0DC3\u0DB1 \u0DAF\u0DD4\u0DB8\u0DCA\u0DBB\u0DD2\u0DBA \u0DC5\u0D9F\u0DCF \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA \u0D9A\u0DC0\u0DAF\u0DCF\u0DAF?", singlish: "[\u0DC0\u0DD9\u0DB1\u0DCA \u0DA9\u0DC3\u0DCA \u0DAF \u0DB8\u0DDD\u0DB1\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DA7\u0DCA\u200D\u0DBB\u0DDA\u0DB1\u0DCA \u0D85\u0DBB\u0DBA\u0DD2\u0DC0\u0DCA?]", tip: 'Arrive [\u0D85\u0DBB\u0DBA\u0DD2\u0DC0\u0DCA] \u0DC4\u0DD2 "v" \u0DAD\u0DB6\u0DB1\u0DCA\u0DB1.' }
        ],
        mistake: { incorrect: "Where you going?", correct: "Where are you going?", explanationSinhala: '\u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1\u0DBA\u0D9A\u0DCA \u0D85\u0DC3\u0DB1 \u0DC0\u0DD2\u0DA7 "are" \u0D8B\u0DB4\u0D9A\u0DCF\u0DBB\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF\u0DBA \u0D85\u0DAD\u0DC4\u0DD0\u0DBB\u0DD2\u0DBA \u0DB1\u0DDC\u0DC4\u0DD0\u0D9A.' },
        adviceSi: "\u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1\u0DBA \u0D85\u0DC3\u0DB1 \u0DC0\u0DD2\u0DA7 \u0D85\u0D9C \u0DB7\u0DCF\u0D9C\u0DBA\u0DDA \u0DC4\u0DAC \u0DAD\u0DBB\u0DB8\u0D9A\u0DCA \u0D89\u0DC4\u0DC5\u0DA7 \u0D94\u0DC3\u0DC0\u0DB1\u0DCA\u0DB1 (Rising intonation)."
      }
    ]
  },
  // 6. Bus, Train & Three-Wheeler Travel (Lessons 251 - 300)
  {
    domain: "Bus, Train & Three-Wheeler Travel",
    domainSinhala: "\u0DB6\u0DC3\u0DCA, \u0D9A\u0DDD\u0DA0\u0DCA\u0DA0\u0DD2 \u0DC3\u0DC4 \u0DAD\u0DCA\u200D\u0DBB\u0DD3\u0DC0\u0DD3\u0DBD\u0DCA \u0D9C\u0DB8\u0DB1\u0DCA \u0DB6\u0DD2\u0DB8\u0DB1\u0DCA",
    subtopics: [
      {
        titleEn: "Hiring a Tuk-Tuk & Buying Bus Tickets",
        titleSi: "\u0DAD\u0DCA\u200D\u0DBB\u0DD3\u0DC0\u0DD3\u0DBD\u0DBB\u0DBA\u0D9A\u0DCA \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8 \u0DC3\u0DC4 \u0DB6\u0DC3\u0DCA \u0DA7\u0DD2\u0D9A\u0DA7\u0DCA \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8",
        ruleTitleSi: "\u0D9C\u0DB8\u0DB1\u0DCA \u0DB6\u0DD2\u0DB8\u0DB1\u0DCA \u0DC0\u0DBD\u0DAF\u0DD3 \u0D86\u0DA0\u0DCF\u0DBB\u0DC1\u0DD3\u0DBD\u0DD3 \u0DC0\u0DD2\u0DB8\u0DC3\u0DD3\u0DB8\u0DCA",
        ruleExplainSi: '"How much to...?" \u0DC4\u0DDD "Could you drop me at...?" \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "How much to Fort railway station by meter?", si: "\u0DB8\u0DD3\u0DA7\u0DBB\u0DBA\u0DA7 \u0D9A\u0DDC\u0DA7\u0DD4\u0DC0 \u0DAF\u0DD4\u0DB8\u0DCA\u0DBB\u0DD2\u0DBA \u0DC3\u0DCA\u0DAE\u0DCF\u0DB1\u0DBA\u0DA7 \u0D9A\u0DD3\u0DBA\u0DAF?", singlish: "[\u0DC4\u0DC0\u0DD4 \u0DB8\u0DA0\u0DCA \u0DA7\u0DD4 \u0DC6\u0DDD\u0DA7\u0DCA \u0DBB\u0DDA\u0DBD\u0DCA\u0DC0\u0DDA \u0DC3\u0DCA\u0DA7\u0DDA\u0DC2\u0DB1\u0DCA \u0DB6\u0DBA\u0DD2 \u0DB8\u0DD3\u0DA7\u0DBB\u0DCA?]", tip: "Railway [\u0DBB\u0DDA\u0DBD\u0DCA\u0DC0\u0DDA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Please turn on the meter, brother.", si: "\u0DB8\u0DBD\u0DCA\u0DBD\u0DD3 \u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DB8\u0DD3\u0DA7\u0DBB\u0DBA \u0DAF\u0DB8\u0DB1\u0DCA\u0DB1.", singlish: "[\u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA \u0DA7\u0DBB\u0DCA\u0DB1\u0DCA \u0D94\u0DB1\u0DCA \u0DAF \u0DB8\u0DD3\u0DA7\u0DBB\u0DCA, \u0DB6\u0DCA\u200D\u0DBB\u0DAF\u0DBB\u0DCA]", tip: "Meter [\u0DB8\u0DD3\u0DA7\u0DBB\u0DCA] \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Does this bus go to Kandy via Kegalle?", si: "\u0DB8\u0DDA \u0DB6\u0DC3\u0DCA \u0D91\u0D9A \u0D9A\u0DD1\u0D9C\u0DBD\u0DCA\u0DBD \u0DC4\u0DBB\u0DC4\u0DCF \u0DB1\u0DD4\u0DC0\u0DBB\u0DA7 \u0DBA\u0DB1\u0DC0\u0DAF?", singlish: "[\u0DA9\u0DC3\u0DCA \u0DAF\u0DD2\u0DC3\u0DCA \u0DB6\u0DC3\u0DCA \u0D9C\u0DDD \u0DA7\u0DD4 \u0D9A\u0DD0\u0DB1\u0DCA\u0DA9\u0DD2 \u0DC0\u0DCF\u0DBA\u0DCF \u0D9A\u0DD1\u0D9C\u0DBD\u0DCA\u0DBD?]", tip: "Via [\u0DC0\u0DCF\u0DBA\u0DCF] \u0DBA\u0DB1\u0DD4 \u0DC4\u0DBB\u0DC4\u0DCF \u0DBA\u0DB1\u0DCA\u0DB1\u0DBA\u0DD2." },
          { en: "Please stop near the clock tower.", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0D94\u0DBB\u0DBD\u0DDD\u0DC3\u0DD4 \u0D9A\u0DAB\u0DD4\u0DC0 \u0DC5\u0D9F\u0DD2\u0DB1\u0DCA \u0DB1\u0DC0\u0DAD\u0DCA\u0DC0\u0DB1\u0DCA\u0DB1.", singlish: "[\u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA \u0DC3\u0DCA\u0DA7\u0DDC\u0DB4\u0DCA \u0DB1\u0DD2\u0DBA\u0DBB\u0DCA \u0DAF \u0D9A\u0DCA\u0DBD\u0DDC\u0D9A\u0DCA \u0DA7\u0DC0\u0DBB\u0DCA]", tip: "Tower [\u0DA7\u0DC0\u0DBB\u0DCA] \u0DBD\u0DD9\u0DC3 \u0DB4\u0DC0\u0DC3\u0DB1\u0DCA\u0DB1." },
          { en: "Keep the balance as a tip.", si: "\u0D89\u0DAD\u0DD2\u0DBB\u0DD2 \u0DB8\u0DD4\u0DAF\u0DBD \u0DAD\u0DB6\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1.", singlish: "[\u0D9A\u0DD3\u0DB4\u0DCA \u0DAF \u0DB6\u0DD0\u0DBD\u0DB1\u0DCA\u0DC3\u0DCA \u0D88\u0DC3\u0DCA \u0D85 \u0DA7\u0DD2\u0DB4\u0DCA]", tip: "Balance [\u0DB6\u0DD0\u0DBD\u0DB1\u0DCA\u0DC3\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "Drop me here only.", correct: "Please drop me off here.", explanationSinhala: '\u0DBD\u0DCF\u0D82\u0D9A\u0DD2\u0D9A \u0D85\u0DB4 \u0DB1\u0DD2\u0DAD\u0DBB "here only" \u0D9A\u0DD3\u0DC0\u0DAF, \u0DB1\u0DD2\u0DC0\u0DD0\u0DBB\u0DAF\u0DD2 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA "drop me off here" \u0DC0\u0DDA.' },
        adviceSi: '\u0DBB\u0DD2\u0DBA\u0DAF\u0DD4\u0DBB\u0DB1\u0DCA\u0DA7 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1 \u0DC0\u0DD2\u0DA7 "Please" \u0DC0\u0DA0\u0DB1\u0DBA \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1. \u0D91\u0DBA \u0DC0\u0DD2\u0DB1\u0DD3\u0DAD \u0DB6\u0DC0 \u0DB4\u0DD9\u0DB1\u0DCA\u0DC0\u0DBA\u0DD2.'
      }
    ]
  },
  // 7. Dining, Tea Shops & Food (Lessons 301 - 350)
  {
    domain: "Dining, Tea Shops & Sri Lankan Food",
    domainSinhala: "\u0D86\u0DB4\u0DB1\u0DC1\u0DCF\u0DBD\u0DCF \u0DC3\u0DC4 \u0D9A\u0DD1\u0DB8 \u0DB6\u0DD3\u0DB8 \u0D87\u0DAB\u0DC0\u0DD4\u0DB8\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
    subtopics: [
      {
        titleEn: "Ordering Food & Sri Lankan Tea",
        titleSi: "\u0D86\u0DC4\u0DCF\u0DBB \u0DC3\u0DC4 \u0DAD\u0DDA \u0D87\u0DAB\u0DC0\u0DD4\u0DB8\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
        ruleTitleSi: '"I would like to order..." \u0DBA\u0DD9\u0DAF\u0DD3\u0DB8',
        ruleExplainSi: '\u0D86\u0DC4\u0DCF\u0DBB \u0D89\u0DBD\u0DCA\u0DBD\u0DD3\u0DB8\u0DDA\u0DAF\u0DD3 "Give me rice" \u0DB1\u0DDC\u0D9A\u0DD2\u0DBA\u0DCF "I would like to order chicken fried rice" \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "Could I see the lunch menu, please?", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DB8\u0DA7 \u0DAF\u0DC0\u0DBD\u0DCA \u0D86\u0DC4\u0DCF\u0DBB \u0DB8\u0DD9\u0DB1\u0DD4\u0DC0 \u0DB6\u0DBD\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA\u0DAF?", singlish: "[\u0D9A\u0DD4\u0DA9\u0DCA \u0D85\u0DBA\u0DD2 \u0DC3\u0DD3 \u0DAF \u0DBD\u0DB1\u0DCA\u0DA0\u0DCA \u0DB8\u0DD9\u0DB1\u0DD4, \u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA?]", tip: "Menu [\u0DB8\u0DD9\u0DB1\u0DD4] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I would like a cup of hot milk tea.", si: "\u0DB8\u0DA7 \u0D8B\u0DAB\u0DD4 \u0D9A\u0DD2\u0DBB\u0DD2 \u0DAD\u0DDA \u0D9A\u0DDD\u0DB4\u0DCA\u0DB4\u0DBA\u0D9A\u0DCA \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA\u0DBA\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC0\u0DD4\u0DA9\u0DCA \u0DBD\u0DBA\u0DD2\u0D9A\u0DCA \u0D85 \u0D9A\u0DB4\u0DCA \u0D94\u0DC6\u0DCA \u0DC4\u0DDC\u0DA7\u0DCA \u0DB8\u0DD2\u0DBD\u0DCA\u0D9A\u0DCA \u0DA7\u0DD3]", tip: 'Would [\u0DC0\u0DD4\u0DA9\u0DCA] \u0DC4\u0DD2 "l" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA\u0DD2.' },
          { en: "Please make the curry less spicy.", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DC0\u0DCA\u200D\u0DBA\u0D82\u0DA2\u0DB1\u0DBA \u0DC3\u0DD0\u0DBB \u0D85\u0DA9\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA \u0DC4\u0DAF\u0DB1\u0DCA\u0DB1.", singlish: "[\u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA \u0DB8\u0DDA\u0D9A\u0DCA \u0DAF \u0D9A\u0DBB\u0DD2 \u0DBD\u0DD9\u0DC3\u0DCA \u0DC3\u0DCA\u0DB4\u0DBA\u0DD2\u0DC3\u0DD2]", tip: "Less spicy [\u0DBD\u0DD9\u0DC3\u0DCA \u0DC3\u0DCA\u0DB4\u0DBA\u0DD2\u0DC3\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Could you bring the bill, please?", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DB6\u0DD2\u0DBD \u0D9C\u0DD9\u0DB1\u0DAD\u0DCA \u0DAF\u0DD9\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA\u0DAF?", singlish: "[\u0D9A\u0DD4\u0DA9\u0DCA \u0DBA\u0DD6 \u0DB6\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DAF \u0DB6\u0DD2\u0DBD\u0DCA, \u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA?]", tip: 'Bill \u0DC4\u0DD2 "ll" \u0DB8\u0DD8\u0DAF\u0DD4\u0DC0 \u0DB1\u0DC0\u0DAD\u0DCA\u0DC0\u0DB1\u0DCA\u0DB1.' },
          { en: "The food was exceptionally delicious.", si: "\u0D86\u0DC4\u0DCF\u0DBB\u0DBA \u0D85\u0DAD\u0DD2\u0DC1\u0DBA\u0DD2\u0DB1\u0DCA\u0DB8 \u0DBB\u0DC3\u0DC0\u0DAD\u0DCA \u0DC0\u0DD2\u0DBA.", singlish: "[\u0DAF \u0DC6\u0DD4\u0DA9\u0DCA \u0DC0\u0DDC\u0DC3\u0DCA \u0D91\u0D9A\u0DCA\u0DC3\u0DD9\u0DB4\u0DCA\u0DC2\u0DB1\u0DBD\u0DD2 \u0DA9\u0DD2\u0DBD\u0DD2\u0DC2\u0DC3\u0DCA]", tip: "Exceptionally [\u0D91\u0D9A\u0DCA\u0DC3\u0DD9\u0DB4\u0DCA\u0DC2\u0DB1\u0DBD\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "Give me one tea.", correct: "Could I have a cup of tea, please?", explanationSinhala: '"Give me" \u0DBA\u0DB1\u0DD4 \u0D85\u0DAB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0D9A\u0DD2. \u0D86\u0DA0\u0DCF\u0DBB\u0DC1\u0DD3\u0DBD\u0DD3\u0DC0 "Could I have..." \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
        adviceSi: '\u0D86\u0DB4\u0DB1\u0DC1\u0DCF\u0DBD\u0DCF\u0DC0\u0D9A\u0DAF\u0DD3 "Thank you" \u0DB4\u0DD0\u0DC0\u0DC3\u0DD3\u0DB8\u0DA7 \u0D9A\u0DD2\u0DC3\u0DD2\u0DC0\u0DD2\u0DA7\u0DD9\u0D9A\u0DAD\u0DCA \u0DB8\u0DD0\u0DBD\u0DD2 \u0DB1\u0DDC\u0DC0\u0DB1\u0DCA\u0DB1!'
      }
    ]
  },
  // 8. Shopping & Pettah Bargaining (Lessons 351 - 400)
  {
    domain: "Shopping, Supermarkets & Bargaining",
    domainSinhala: "\u0D9A\u0DA9\u0DC3\u0DCF\u0DB4\u0DCA\u0DB4\u0DD4 \u0DC3\u0DC4 \u0DB6\u0DA9\u0DD4 \u0DB8\u0DD2\u0DBD\u0DAF\u0DD3 \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DCA",
    subtopics: [
      {
        titleEn: "Asking Prices & Discounts",
        titleSi: "\u0DB8\u0DD2\u0DBD \u0D9C\u0DAB\u0DB1\u0DCA \u0DC3\u0DC4 \u0DC0\u0DA7\u0DCA\u0DA7\u0DB8\u0DCA \u0DC0\u0DD2\u0DB8\u0DC3\u0DD3\u0DB8",
        ruleTitleSi: '"How much is this?" \u0DC3\u0DC4 "Can you give a discount?"',
        ruleExplainSi: '\u0DB7\u0DCF\u0DAB\u0DCA\u0DA9\u0DBA\u0D9A \u0DB8\u0DD2\u0DBD \u0DC0\u0DD2\u0DB8\u0DC3\u0DD3\u0DB8\u0DA7 "How much does this cost?" \u0DC4\u0DDD "How much is this?" \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "How much does this cotton shirt cost?", si: "\u0DB8\u0DDA \u0D9A\u0DB4\u0DD4 \u0D9A\u0DB8\u0DD2\u0DC3\u0DBA \u0D9A\u0DD3\u0DBA\u0DAF?", singlish: "[\u0DC4\u0DC0\u0DD4 \u0DB8\u0DA0\u0DCA \u0DA9\u0DC3\u0DCA \u0DAF\u0DD2\u0DC3\u0DCA \u0D9A\u0DDC\u0DA7\u0DB1\u0DCA \u0DC2\u0DBB\u0DCA\u0DA7\u0DCA \u0D9A\u0DDC\u0DC3\u0DCA\u0DA7\u0DCA?]", tip: "Cotton [\u0D9A\u0DDC\u0DA7\u0DB1\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Do you have this in medium size?", si: "\u0DB8\u0DD9\u0DBA \u0DB8\u0DB0\u0DCA\u200D\u0DBA\u0DB8 \u0DB4\u0DCA\u200D\u0DBB\u0DB8\u0DCF\u0DAB\u0DBA\u0DD9\u0DB1\u0DCA (Medium) \u0DAD\u0DD2\u0DB6\u0DDA\u0DAF?", singlish: "[\u0DA9\u0DD6 \u0DBA\u0DD6 \u0DC4\u0DD1\u0DC0\u0DCA \u0DAF\u0DD2\u0DC3\u0DCA \u0D89\u0DB1\u0DCA \u0DB8\u0DD3\u0DA9\u0DD2\u0DBA\u0DB8\u0DCA \u0DC3\u0DBA\u0DD2\u0DC3\u0DCA?]", tip: "Medium [\u0DB8\u0DD3\u0DA9\u0DD2\u0DBA\u0DB8\u0DCA] \u0DB4\u0DC0\u0DC3\u0DB1\u0DCA\u0DB1." },
          { en: "Can you offer any special discount?", si: "\u0D94\u0DB6\u0DA7 \u0DC0\u0DD2\u0DC1\u0DDA\u0DC2 \u0DC0\u0DA7\u0DCA\u0DA7\u0DB8\u0D9A\u0DCA \u0DBD\u0DB6\u0DCF \u0DAF\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0D9A\u0DD1\u0DB1\u0DCA \u0DBA\u0DD6 \u0D94\u0DC6\u0DBB\u0DCA \u0D91\u0DB1\u0DD2 \u0DC3\u0DCA\u0DB4\u0DD9\u0DC2\u0DBD\u0DCA \u0DA9\u0DD2\u0DC3\u0DCA\u0D9A\u0DC0\u0DD4\u0DB1\u0DCA\u0DA7\u0DCA?]", tip: "Discount [\u0DA9\u0DD2\u0DC3\u0DCA\u0D9A\u0DC0\u0DD4\u0DB1\u0DCA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Can I pay by credit card or cash?", si: "\u0DB8\u0DA7 \u0D9A\u0DCF\u0DA9\u0DCA\u0DB4\u0DAD\u0D9A\u0DD2\u0DB1\u0DCA \u0DC4\u0DDD \u0DB8\u0DD4\u0DAF\u0DBD\u0DD2\u0DB1\u0DCA \u0D9C\u0DD9\u0DC0\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0D9A\u0DD1\u0DB1\u0DCA \u0D85\u0DBA\u0DD2 \u0DB4\u0DDA \u0DB6\u0DBA\u0DD2 \u0D9A\u0DCA\u200D\u0DBB\u0DD9\u0DA9\u0DD2\u0DA7\u0DCA \u0D9A\u0DCF\u0DA9\u0DCA \u0D95\u0DBB\u0DCA \u0D9A\u0DD1\u0DC2\u0DCA?]", tip: "Credit card [\u0D9A\u0DCA\u200D\u0DBB\u0DD9\u0DA9\u0DD2\u0DA7\u0DCA \u0D9A\u0DCF\u0DA9\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Please give me a printed receipt.", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DB8\u0DA7 \u0DB8\u0DD4\u0DAF\u0DCA\u200D\u0DBB\u0DD2\u0DAD \u0DBB\u0DD2\u0DC3\u0DD2\u0DA7\u0DCA\u0DB4\u0DAD\u0D9A\u0DCA \u0DBD\u0DB6\u0DCF \u0DAF\u0DD9\u0DB1\u0DCA\u0DB1.", singlish: "[\u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA \u0D9C\u0DD2\u0DC0\u0DCA \u0DB8\u0DD3 \u0D85 \u0DB4\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0DA7\u0DA9\u0DCA \u0DBB\u0DD2\u0DC3\u0DD3\u0DA7\u0DCA]", tip: 'Receipt \u0DC4\u0DD2 "p" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA\u0DD2 (\u0DBB\u0DD2\u0DC3\u0DD3\u0DA7\u0DCA).' }
        ],
        mistake: { incorrect: "What is the price of this one?", correct: "How much is this, please?", explanationSinhala: '\u0DB8\u0DD2\u0DBD \u0D85\u0DC3\u0DB1 \u0DC0\u0DD2\u0DA7 \u0DC3\u0DCA\u0DC0\u0DB7\u0DCF\u0DC0\u0DD2\u0D9A \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA "How much is this?" \u0DC0\u0DDA.' },
        adviceSi: "\u0DB8\u0DD2\u0DBD\u0DAF\u0DD3 \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DDA\u0DAF\u0DD3 \u0DB8\u0DD4\u0DAF\u0DBD\u0DCA \u0D9C\u0DB1\u0DD4\u0DAF\u0DD9\u0DB1\u0DD4 \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD."
      }
    ]
  },
  // 9. Telephone & WhatsApp Calls (Lessons 401 - 450)
  {
    domain: "Telephone Manners & WhatsApp Calls",
    domainSinhala: "\u0DAF\u0DD4\u0DBB\u0D9A\u0DAE\u0DB1 \u0DC3\u0DC4 \u0DC0\u0DA7\u0DCA\u0DC3\u0DCA\u0D87\u0DB4\u0DCA \u0D87\u0DB8\u0DAD\u0DD4\u0DB8\u0DCA",
    subtopics: [
      {
        titleEn: "Answering Calls & Taking Messages",
        titleSi: "\u0D87\u0DB8\u0DAD\u0DD4\u0DB8\u0DCA \u0DC0\u0DBD\u0DA7 \u0DB4\u0DD2\u0DC5\u0DD2\u0DAD\u0DD4\u0DBB\u0DD4 \u0DAF\u0DD3\u0DB8 \u0DC3\u0DC4 \u0DB4\u0DAB\u0DD2\u0DC0\u0DD2\u0DA9 \u0DAD\u0DD0\u0DB6\u0DD3\u0DB8",
        ruleTitleSi: '"May I speak to..." \u0DC3\u0DC4 "Speaking"',
        ruleExplainSi: '\u0DAF\u0DD4\u0DBB\u0D9A\u0DAE\u0DB1\u0DBA\u0DD9\u0DB1\u0DCA \u0DAD\u0DB8\u0DB1\u0DCA \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1 \u0DB6\u0DC0 \u0DB4\u0DD0\u0DC0\u0DC3\u0DD3\u0DB8\u0DA7 "I am Nimal" \u0DB1\u0DDC\u0D9A\u0DD2\u0DBA\u0DCF "This is Nimal speaking" \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "Hello, this is Daisy speaking.", si: "\u0DC4\u0DD9\u0DBD\u0DDD, \u0DB8\u0DDA \u0DA9\u0DDA\u0DC3\u0DD2 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1\u0DDA.", singlish: "[\u0DC4\u0DD9\u0DBD\u0DDD, \u0DAF\u0DD2\u0DC3\u0DCA \u0D89\u0DC3\u0DCA \u0DA9\u0DDA\u0DC3\u0DD2 \u0DC3\u0DCA\u0DB4\u0DD3\u0D9A\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA]", tip: "Speaking [\u0DC3\u0DCA\u0DB4\u0DD3\u0D9A\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "May I speak to Mr. Perera, please?", si: "\u0DB8\u0DA7 \u0DB4\u0DD9\u0DBB\u0DDA\u0DBB\u0DCF \u0DB8\u0DC4\u0DAD\u0DCF \u0DC3\u0DB8\u0D9F \u0D9A\u0DAD\u0DCF \u0D9A\u0DC5 \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0DB8\u0DDA \u0D85\u0DBA\u0DD2 \u0DC3\u0DCA\u0DB4\u0DD3\u0D9A\u0DCA \u0DA7\u0DD4 \u0DB8\u0DD2\u0DC3\u0DCA\u0DA7\u0DBB\u0DCA \u0DB4\u0DD9\u0DBB\u0DDA\u0DBB\u0DCF, \u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA?]", tip: "May I [\u0DB8\u0DDA \u0D85\u0DBA\u0DD2] \u0D86\u0DA0\u0DCF\u0DBB\u0DC1\u0DD3\u0DBD\u0DD3\u0DBA\u0DD2." },
          { en: "I am afraid his line is busy right now.", si: "\u0D94\u0DC4\u0DD4\u0D9C\u0DDA \u0DAF\u0DD4\u0DBB\u0D9A\u0DAE\u0DB1 \u0DB8\u0DCF\u0DBB\u0DCA\u0D9C\u0DBA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DB6\u0DC4\u0DD4\u0DBD \u0DB6\u0DC0 \u0DB4\u0DD9\u0DB1\u0DDA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0D85\u0DC6\u0DCA\u200D\u0DBB\u0DD9\u0DBA\u0DD2\u0DA9\u0DCA \u0DC4\u0DD2\u0DC3\u0DCA \u0DBD\u0DBA\u0DD2\u0DB1\u0DCA \u0D89\u0DC3\u0DCA \u0DB6\u0DD2\u0DC3\u0DD2 \u0DBB\u0DBA\u0DD2\u0DA7\u0DCA \u0DB1\u0DC0\u0DD4]", tip: "Busy [\u0DB6\u0DD2\u0DC3\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Could I leave a short message for him?", si: "\u0DB8\u0DA7 \u0D94\u0DC4\u0DD4\u0DA7 \u0D9A\u0DD9\u0DA7\u0DD2 \u0DB4\u0DAB\u0DD2\u0DC0\u0DD2\u0DA9\u0DBA\u0D9A\u0DCA \u0DAD\u0DD0\u0DB6\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0D9A\u0DD4\u0DA9\u0DCA \u0D85\u0DBA\u0DD2 \u0DBD\u0DD3\u0DC0\u0DCA \u0D85 \u0DC2\u0DDD\u0DA7\u0DCA \u0DB8\u0DD9\u0DC3\u0DDA\u0DA2\u0DCA \u0DC6\u0DDD \u0DC4\u0DD2\u0DB8\u0DCA?]", tip: "Message [\u0DB8\u0DD9\u0DC3\u0DDA\u0DA2\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I will call you back in ten minutes.", si: "\u0DB8\u0DB8 \u0DC0\u0DD2\u0DB1\u0DCF\u0DA9\u0DD2 \u0DAF\u0DC4\u0DBA\u0D9A\u0DD2\u0DB1\u0DCA \u0DB1\u0DD0\u0DC0\u0DAD \u0D85\u0DB8\u0DAD\u0DB1\u0DCA\u0DB1\u0DB8\u0DCA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC0\u0DD2\u0DBD\u0DCA \u0D9A\u0DDD\u0DBD\u0DCA \u0DBA\u0DD6 \u0DB6\u0DD1\u0D9A\u0DCA \u0D89\u0DB1\u0DCA \u0DA7\u0DD9\u0DB1\u0DCA \u0DB8\u0DD2\u0DB1\u0DD2\u0DA7\u0DCA\u0DC3\u0DCA]", tip: "Call back [\u0D9A\u0DDD\u0DBD\u0DCA \u0DB6\u0DD1\u0D9A\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "Who is this?", correct: "May I know who is calling, please?", explanationSinhala: '\u0DAF\u0DD4\u0DBB\u0D9A\u0DAE\u0DB1\u0DBA\u0DD9\u0DB1\u0DCA "Who is this?" \u0DBA\u0DB1\u0DD4 \u0DBB\u0DC5\u0DD4\u0DBA. "May I know who is calling?" \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0DAF\u0DD4\u0DBB\u0D9A\u0DAE\u0DB1 \u0D87\u0DB8\u0DAD\u0DD4\u0DB8\u0DCA \u0DC0\u0DBD\u0DAF\u0DD3 \u0DC4\u0DAC \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0DC3\u0DC4 \u0DC3\u0DD9\u0DB8\u0DD9\u0DB1\u0DCA \u0DAD\u0DB6\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1."
      }
    ]
  },
  // 10. Home, Family & Chores (Lessons 451 - 500)
  {
    domain: "Home, Family Members & Chores",
    domainSinhala: "\u0DB1\u0DD2\u0DC0\u0DC3 \u0DC3\u0DC4 \u0DB4\u0DC0\u0DD4\u0DBD\u0DDA \u0D9A\u0DA7\u0DBA\u0DD4\u0DAD\u0DD4",
    subtopics: [
      {
        titleEn: "Family Relationships & Daily Chores",
        titleSi: "\u0DB4\u0DC0\u0DD4\u0DBD\u0DDA \u0DC3\u0DB6\u0DB3\u0DAD\u0DCF \u0DC3\u0DC4 \u0D9C\u0DD9\u0DAF\u0DBB \u0DAF\u0DDC\u0DBB \u0DC0\u0DD0\u0DA9",
        ruleTitleSi: "\u0D9C\u0DD9\u0DAF\u0DBB \u0DC0\u0DD0\u0DA9 \u0DB4\u0DCA\u200D\u0DBB\u0D9A\u0DCF\u0DC1 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8 (Do the dishes, sweep...)",
        ruleExplainSi: '\u0DB4\u0DD2\u0D9F\u0DB1\u0DCA \u0DC3\u0DDA\u0DAF\u0DD3\u0DB8\u0DA7 "wash dishes" \u0DC4\u0DDD "do the dishes", \u0DB8\u0DD2\u0DAF\u0DD4\u0DBD \u0D85\u0DAD\u0DD4\u0D9C\u0DD1\u0DB8\u0DA7 "sweep the garden" \u0DBA\u0DDC\u0DAF\u0DBA\u0DD2.',
        phrases: [
          { en: "My mother is sweeping the front garden.", si: "\u0DB8\u0D9C\u0DDA \u0D85\u0DB8\u0DCA\u0DB8\u0DCF \u0D89\u0DAF\u0DD2\u0DBB\u0DD2\u0DB4\u0DC3 \u0DB8\u0DD2\u0DAF\u0DD4\u0DBD \u0D85\u0DAD\u0DD4\u0D9C\u0DCF\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DB8\u0DBA\u0DD2 \u0DB8\u0DAF\u0DBB\u0DCA \u0D89\u0DC3\u0DCA \u0DC3\u0DCA\u0DC0\u0DD3\u0DB4\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DAF \u0DC6\u0DCA\u200D\u0DBB\u0DB1\u0DCA\u0DA7\u0DCA \u0D9C\u0DCF\u0DBB\u0DCA\u0DA9\u0DB1\u0DCA]", tip: "Sweeping [\u0DC3\u0DCA\u0DC0\u0DD3\u0DB4\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I help my father wash the family car.", si: "\u0DB8\u0DB8 \u0DAD\u0DCF\u0DAD\u0DCA\u0DAD\u0DCF\u0DA7 \u0DB8\u0DDD\u0DA7\u0DBB\u0DCA \u0DBB\u0DAE\u0DBA \u0DC3\u0DDA\u0DAF\u0DD3\u0DB8\u0DA7 \u0D8B\u0DAF\u0DC0\u0DCA \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC4\u0DD9\u0DBD\u0DCA\u0DB4\u0DCA \u0DB8\u0DBA\u0DD2 \u0DC6\u0DCF\u0DAF\u0DBB\u0DCA \u0DC0\u0DDC\u0DC2\u0DCA \u0DAF \u0DC6\u0DD0\u0DB8\u0DD2\u0DBD\u0DD2 \u0D9A\u0DCF\u0DBB\u0DCA]", tip: 'Help [\u0DC4\u0DD9\u0DBD\u0DCA\u0DB4\u0DCA] \u0DC4\u0DD2 "p" \u0DAD\u0DB6\u0DB1\u0DCA\u0DB1.' },
          { en: "My younger brother is studying for exams.", si: "\u0DB8\u0D9C\u0DDA \u0DB6\u0DCF\u0DBD \u0DC3\u0DDC\u0DC4\u0DDC\u0DBA\u0DD4\u0DBB\u0DCF \u0DC0\u0DD2\u0DB7\u0DCF\u0D9C\u0DBA\u0DA7 \u0DB4\u0DCF\u0DA9\u0DB8\u0DCA \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DB8\u0DBA\u0DD2 \u0DBA\u0DB1\u0DCA\u0D9C\u0DBB\u0DCA \u0DB6\u0DCA\u200D\u0DBB\u0DAF\u0DBB\u0DCA \u0D89\u0DC3\u0DCA \u0DC3\u0DCA\u0DA7\u0DA9\u0DD2\u0DBA\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DC6\u0DDD \u0D91\u0D9A\u0DCA\u0DC3\u0DD1\u0DB8\u0DCA\u0DC3\u0DCA]", tip: "Studying [\u0DC3\u0DCA\u0DA7\u0DA9\u0DD2\u0DBA\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "We gather together for dinner every night.", si: "\u0D85\u0DB4\u0DD2 \u0DC3\u0DD1\u0DB8 \u0DBB\u0DCF\u0DAD\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0D9A\u0DB8 \u0DBB\u0DCF\u0DAD\u0DCA\u200D\u0DBB\u0DD3 \u0D86\u0DC4\u0DCF\u0DBB\u0DBA\u0DA7 \u0D91\u0D9A\u0DCA\u0DC0\u0DD9\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC0\u0DD3 \u0D9C\u0DD0\u0DAF\u0DBB\u0DCA \u0DA7\u0DD4\u0D9C\u0DD9\u0DAF\u0DBB\u0DCA \u0DC6\u0DDD \u0DA9\u0DD2\u0DB1\u0DBB\u0DCA \u0D91\u0DC0\u0DCA\u0DBB\u0DD2 \u0DB1\u0DBA\u0DD2\u0DA7\u0DCA]", tip: "Gather [\u0D9C\u0DD0\u0DAF\u0DBB\u0DCA] \u0DBA\u0DB1\u0DD4 \u0D91\u0D9A\u0DCA\u0DBB\u0DD0\u0DC3\u0DCA\u0DC0\u0DD3\u0DB8\u0DBA\u0DD2." },
          { en: "Family harmony brings immense peace of mind.", si: "\u0DB4\u0DC0\u0DD4\u0DBD\u0DDA \u0DC3\u0DB8\u0D9C\u0DD2\u0DBA \u0DC3\u0DD2\u0DAD\u0DA7 \u0DB8\u0DC4\u0DAD\u0DCA \u0DC3\u0DD0\u0DB1\u0DC3\u0DD3\u0DB8\u0D9A\u0DCA \u0D9C\u0DD9\u0DB1 \u0DAF\u0DD9\u0DBA\u0DD2.", singlish: "[\u0DC6\u0DD0\u0DB8\u0DD2\u0DBD\u0DD2 \u0DC4\u0DCF\u0DB8\u0DB1\u0DD2 \u0DB6\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA\u0DC3\u0DCA \u0D89\u0DB8\u0DD9\u0DB1\u0DCA\u0DC3\u0DCA \u0DB4\u0DD3\u0DC3\u0DCA \u0D94\u0DC6\u0DCA \u0DB8\u0DBA\u0DD2\u0DB1\u0DCA\u0DA9\u0DCA]", tip: "Harmony [\u0DC4\u0DCF\u0DB8\u0DB1\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "My family members is good.", correct: "My family members are doing well.", explanationSinhala: '"Members" \u0DB6\u0DC4\u0DD4\u0DC0\u0DA0\u0DB1 \u0DB6\u0DD0\u0DC0\u0DD2\u0DB1\u0DCA "are" \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0DB1\u0DD2\u0DC0\u0DC3\u0DDA \u0DC3\u0DCF\u0DB8\u0DCF\u0DA2\u0DD2\u0D9A\u0DBA\u0DB1\u0DCA \u0DC3\u0DB8\u0D9F\u0DAF \u0D9A\u0DD4\u0DA9\u0DCF \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0DC0\u0DD9\u0DB1\u0DCA\u0DB1!"
      }
    ]
  },
  // 11. Health, Clinic & Pharmacy (Lessons 501 - 550)
  {
    domain: "Health, Medical Clinic & Pharmacy",
    domainSinhala: "\u0DC3\u0DD4\u0DC0\u0DAF\u0DD4\u0D9A\u0DCA \u0DC3\u0DC4 \u0DC0\u0DDB\u0DAF\u0DCA\u200D\u0DBA \u0DB4\u0DCA\u200D\u0DBB\u0DAD\u0DD2\u0D9A\u0DCF\u0DBB",
    subtopics: [
      {
        titleEn: "Describing Symptoms to a Doctor",
        titleSi: "\u0DBB\u0DDD\u0D9C \u0DBD\u0D9A\u0DCA\u0DC2\u0DAB \u0DC0\u0DDB\u0DAF\u0DCA\u200D\u0DBA\u0DC0\u0DBB\u0DBA\u0DCF\u0DA7 \u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
        ruleTitleSi: '"I have a headache / fever / cough"',
        ruleExplainSi: '\u0DC0\u0DDA\u0DAF\u0DB1\u0DCF\u0DC0\u0DB1\u0DCA \u0DC3\u0DB3\u0DC4\u0DCF "I have a headache", "I feel dizzy" \u0D86\u0DAF\u0DD3 \u0DBD\u0DD9\u0DC3 \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "I have had a severe headache since yesterday.", si: "\u0D8A\u0DBA\u0DDA \u0DC3\u0DD2\u0DA7 \u0DB8\u0DA7 \u0DAD\u0DAF \u0DC4\u0DD2\u0DC3\u0DBB\u0DAF\u0DBA\u0D9A\u0DCA \u0DAD\u0DD2\u0DBA\u0DD9\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC4\u0DD1\u0DC0\u0DCA \u0DC4\u0DD1\u0DA9\u0DCA \u0D85 \u0DC3\u0DD2\u0DC0\u0DD2\u0DBA\u0DBB\u0DCA \u0DC4\u0DD9\u0DA9\u0DDA\u0D9A\u0DCA \u0DC3\u0DD2\u0DB1\u0DCA\u0DC3\u0DCA \u0DBA\u0DD9\u0DC3\u0DCA\u0DA7\u0DBB\u0DCA\u0DA9\u0DDA]", tip: "Severe [\u0DC3\u0DD2\u0DC0\u0DD2\u0DBA\u0DBB\u0DCA] \u0DBA\u0DB1\u0DD4 \u0DAD\u0DAF\u0DB6\u0DBD \u0DBA\u0DB1\u0DCA\u0DB1\u0DBA\u0DD2." },
          { en: "I feel slightly dizzy and nauseous.", si: "\u0DB8\u0DA7 \u0DB8\u0DAF\u0D9A\u0DCA \u0D9A\u0DBB\u0D9A\u0DD0\u0DC0\u0DD2\u0DBD\u0DCA\u0DBD \u0DC3\u0DC4 \u0DC0\u0DB8\u0DB1\u0DBA \u0D9C\u0DAD\u0DD2\u0DBA \u0DAF\u0DD0\u0DB1\u0DDA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC6\u0DD3\u0DBD\u0DCA \u0DC3\u0DCA\u0DBD\u0DBA\u0DD2\u0DA7\u0DCA\u0DBD\u0DD2 \u0DA9\u0DD2\u0DC3\u0DD2 \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DB1\u0DDC\u0DC3\u0DD2\u0DBA\u0DC3\u0DCA]", tip: "Dizzy [\u0DA9\u0DD2\u0DC3\u0DD2] \u0D9A\u0DBB\u0D9A\u0DD0\u0DC0\u0DD2\u0DBD\u0DCA\u0DBD\u0DBA\u0DD2." },
          { en: "How many times a day should I take this syrup?", si: "\u0DAF\u0DD2\u0DB1\u0D9A\u0DA7 \u0D9A\u0DD3 \u0DC0\u0DAD\u0DCF\u0DC0\u0D9A\u0DCA \u0DB8\u0DB8 \u0DB8\u0DDA \u0DB4\u0DD0\u0DAB\u0DD2\u0DBA \u0DB6\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DAF?", singlish: "[\u0DC4\u0DC0\u0DD4 \u0DB8\u0DD9\u0DB1\u0DD2 \u0DA7\u0DBA\u0DD2\u0DB8\u0DCA\u0DC3\u0DCA \u0D85 \u0DA9\u0DDA \u0DC2\u0DD4\u0DA9\u0DCA \u0D85\u0DBA\u0DD2 \u0DA7\u0DDA\u0D9A\u0DCA \u0DAF\u0DD2\u0DC3\u0DCA \u0DC3\u0DD2\u0DBB\u0DB4\u0DCA?]", tip: "Syrup [\u0DC3\u0DD2\u0DBB\u0DB4\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Do these tablets have any side effects?", si: "\u0DB8\u0DD9\u0DB8 \u0DB4\u0DD9\u0DAD\u0DD2 \u0DC0\u0DBD\u0DD2\u0DB1\u0DCA \u0D9A\u0DD2\u0DC3\u0DD2\u0DBA\u0DB8\u0DCA \u0D85\u0DAD\u0DD4\u0DBB\u0DD4 \u0D86\u0DB6\u0DCF\u0DB0 \u0DAD\u0DD2\u0DB6\u0DDA\u0DAF?", singlish: "[\u0DA9\u0DD6 \u0DAF\u0DD3\u0DC3\u0DCA \u0DA7\u0DD0\u0DB6\u0DCA\u0DBD\u0DA7\u0DCA\u0DC3\u0DCA \u0DC4\u0DD1\u0DC0\u0DCA \u0D91\u0DB1\u0DD2 \u0DC3\u0DBA\u0DD2\u0DA9\u0DCA \u0D89\u0DC6\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA\u0DC3\u0DCA?]", tip: "Side effects [\u0DC3\u0DBA\u0DD2\u0DA9\u0DCA \u0D89\u0DC6\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA\u0DC3\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Take complete bed rest and drink plenty of fluids.", si: "\u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB \u0DC0\u0DD2\u0DC0\u0DDA\u0D9A\u0DBA \u0DBD\u0DB6\u0DCF \u0DAF\u0DD2\u0DBA\u0DBB \u0DC0\u0DBB\u0DCA\u0D9C \u0DB6\u0DDC\u0DB1\u0DCA\u0DB1.", singlish: "[\u0DA7\u0DDA\u0D9A\u0DCA \u0D9A\u0DB8\u0DCA\u0DB4\u0DCA\u0DBD\u0DD3\u0DA7\u0DCA \u0DB6\u0DD9\u0DA9\u0DCA \u0DBB\u0DD9\u0DC3\u0DCA\u0DA7\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DA9\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0D9A\u0DCA \u0DB4\u0DCA\u0DBD\u0DD9\u0DB1\u0DCA\u0DA7\u0DD2 \u0D94\u0DC6\u0DCA \u0DC6\u0DCA\u0DBD\u0DD4\u0DBA\u0DD2\u0DA9\u0DCA\u0DC3\u0DCA]", tip: "Fluids [\u0DC6\u0DCA\u0DBD\u0DD4\u0DBA\u0DD2\u0DA9\u0DCA\u0DC3\u0DCA] \u0DAF\u0DD2\u0DBA\u0DBB \u0DC0\u0DBB\u0DCA\u0D9C\u0DBA\u0DD2." }
        ],
        mistake: { incorrect: "My head is paining.", correct: "I have a headache.", explanationSinhala: '\u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DDA\u0DAF\u0DD3 "head is paining" \u0DB1\u0DDC\u0D9A\u0DD2\u0DBA\u0DCF "I have a headache" \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0DC0\u0DDB\u0DAF\u0DCA\u200D\u0DBA\u0DC0\u0DBB\u0DBA\u0DCF\u0DA7 \u0DBB\u0DDD\u0D9C \u0DBD\u0D9A\u0DCA\u0DC2\u0DAB \u0DB6\u0DD2\u0DBA \u0DB1\u0DDC\u0DC0\u0DD3 \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1."
      }
    ]
  },
  // 12. Bank, Post Office & Services (Lessons 551 - 600)
  {
    domain: "Bank, Post Office & Government Services",
    domainSinhala: "\u0DB6\u0DD0\u0D82\u0D9A\u0DD4 \u0DC3\u0DC4 \u0DBB\u0DCF\u0DA2\u0DCA\u200D\u0DBA \u0DC3\u0DDA\u0DC0\u0DCF",
    subtopics: [
      {
        titleEn: "Opening an Account & ATM Transactions",
        titleSi: "\u0D9C\u0DD2\u0DAB\u0DD4\u0DB8\u0D9A\u0DCA \u0DC0\u0DD2\u0DC0\u0DD8\u0DAD \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8 \u0DC3\u0DC4 ATM \u0D9C\u0DB1\u0DD4\u0DAF\u0DD9\u0DB1\u0DD4",
        ruleTitleSi: '"I want to deposit / withdraw money"',
        ruleExplainSi: '\u0DB8\u0DD4\u0DAF\u0DBD\u0DCA \u0DAD\u0DD0\u0DB1\u0DCA\u0DB4\u0DAD\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7 "deposit" \u0DAF, \u0DB8\u0DD4\u0DAF\u0DBD\u0DCA \u0DBD\u0DB6\u0DCF\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DA7 "withdraw" \u0DAF \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "I would like to open a savings account.", si: "\u0DB8\u0DA7 \u0D89\u0DAD\u0DD2\u0DBB\u0DD2\u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DDA \u0D9C\u0DD2\u0DAB\u0DD4\u0DB8\u0D9A\u0DCA \u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7 \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA\u0DBA\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC0\u0DD4\u0DA9\u0DCA \u0DBD\u0DBA\u0DD2\u0D9A\u0DCA \u0DA7\u0DD4 \u0D95\u0DB4\u0DB1\u0DCA \u0D85 \u0DC3\u0DDA\u0DC0\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA\u0DC3\u0DCA \u0D91\u0D9A\u0DC0\u0DD4\u0DB1\u0DCA\u0DA7\u0DCA]", tip: "Savings [\u0DC3\u0DDA\u0DC0\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA\u0DC3\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Could you help me fill out this deposit slip?", si: "\u0DB8\u0DD9\u0DB8 \u0DAD\u0DD0\u0DB1\u0DCA\u0DB4\u0DAD\u0DD4 \u0DB4\u0DAD\u0DCA\u200D\u0DBB\u0DD2\u0D9A\u0DCF\u0DC0 \u0DB4\u0DD2\u0DBB\u0DC0\u0DD3\u0DB8\u0DA7 \u0D8B\u0DAF\u0DC0\u0DCA \u0D9A\u0DC5 \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0D9A\u0DD4\u0DA9\u0DCA \u0DBA\u0DD6 \u0DC4\u0DD9\u0DBD\u0DCA\u0DB4\u0DCA \u0DB8\u0DD3 \u0DC6\u0DD2\u0DBD\u0DCA \u0D85\u0DC0\u0DD4\u0DA7\u0DCA \u0DAF\u0DD2\u0DC3\u0DCA \u0DA9\u0DD2\u0DB4\u0DDC\u0DC3\u0DD2\u0DA7\u0DCA \u0DC3\u0DCA\u0DBD\u0DD2\u0DB4\u0DCA?]", tip: "Deposit [\u0DA9\u0DD2\u0DB4\u0DDC\u0DC3\u0DD2\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "The ATM machine did not dispense my cash.", si: "ATM \u0DBA\u0DB1\u0DCA\u0DAD\u0DCA\u200D\u0DBB\u0DBA\u0DD9\u0DB1\u0DCA \u0DB8\u0D9C\u0DDA \u0DB8\u0DD4\u0DAF\u0DBD\u0DCA \u0DB1\u0DD2\u0D9A\u0DD4\u0DAD\u0DCA \u0DC0\u0DD6\u0DBA\u0DDA \u0DB1\u0DD0\u0DAD.", singlish: "[\u0DAF\u0DD2 \u0D92\u0DA7\u0DD3\u0D91\u0DB8\u0DCA \u0DB8\u0DD0\u0DC2\u0DD2\u0DB1\u0DCA \u0DA9\u0DD2\u0DA9\u0DCA \u0DB1\u0DDC\u0DA7\u0DCA \u0DA9\u0DD2\u0DC3\u0DCA\u0DB4\u0DD9\u0DB1\u0DCA\u0DC3\u0DCA \u0DB8\u0DBA\u0DD2 \u0D9A\u0DD1\u0DC2\u0DCA]", tip: "Dispense [\u0DA9\u0DD2\u0DC3\u0DCA\u0DB4\u0DD9\u0DB1\u0DCA\u0DC3\u0DCA] \u0DB1\u0DD2\u0D9A\u0DD4\u0DAD\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DBA\u0DD2." },
          { en: "Please enter your four-digit secret PIN.", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0D94\u0DB6\u0D9C\u0DDA \u0D89\u0DBD\u0D9A\u0DCA\u0D9A\u0DB8\u0DCA \u0DC4\u0DAD\u0DBB\u0DDA \u0DBB\u0DC4\u0DC3\u0DCA \u0D85\u0D82\u0D9A\u0DBA \u0D87\u0DAD\u0DD4\u0DC5\u0DAD\u0DCA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.", singlish: "[\u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA \u0D91\u0DB1\u0DCA\u0DA7\u0DBB\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0DC6\u0DDD \u0DA9\u0DD2\u0DA2\u0DD2\u0DA7\u0DCA \u0DC3\u0DD3\u0D9A\u0DCA\u200D\u0DBB\u0DA7\u0DCA \u0DB4\u0DD2\u0DB1\u0DCA]", tip: "Four-digit [\u0DC6\u0DDD \u0DA9\u0DD2\u0DA2\u0DD2\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I need to send a registered parcel abroad.", si: "\u0DB8\u0DA7 \u0DC0\u0DD2\u0DAF\u0DDA\u0DC1\u0DBA\u0D9A\u0DA7 \u0DBD\u0DD2\u0DBA\u0DCF\u0DB4\u0DAF\u0DD2\u0D82\u0DA0\u0DD2 \u0DB4\u0DCF\u0DBB\u0DCA\u0DC3\u0DBD\u0DBA\u0D9A\u0DCA \u0DBA\u0DD0\u0DC0\u0DD3\u0DB8\u0DA7 \u0D85\u0DC0\u0DC1\u0DCA\u200D\u0DBA\u0DBA\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DB1\u0DD3\u0DA9\u0DCA \u0DA7\u0DD4 \u0DC3\u0DD9\u0DB1\u0DCA\u0DA9\u0DCA \u0D85 \u0DBB\u0DD9\u0DA2\u0DD2\u0DC3\u0DCA\u0DA7\u0DBB\u0DCA\u0DA9\u0DCA \u0DB4\u0DCF\u0DBB\u0DCA\u0DC3\u0DBD\u0DCA \u0D85\u0DB6\u0DCA\u200D\u0DBB\u0DDD\u0DA9\u0DCA]", tip: "Abroad [\u0D85\u0DB6\u0DCA\u200D\u0DBB\u0DDD\u0DA9\u0DCA] \u0DC0\u0DD2\u0DAF\u0DDA\u0DC1\u0DBA\u0DBA\u0DD2." }
        ],
        mistake: { incorrect: "I took out money from bank.", correct: "I withdrew money from the bank.", explanationSinhala: '\u0DB6\u0DD0\u0D82\u0D9A\u0DD4\u0DC0\u0DD9\u0DB1\u0DCA \u0DB8\u0DD4\u0DAF\u0DBD\u0DCA \u0DBD\u0DB6\u0DCF\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DA7 \u0DB1\u0DD2\u0DBA\u0DB8 \u0DB4\u0DAF\u0DBA "withdraw" (\u0D85\u0DAD\u0DD3\u0DAD \u0D9A\u0DCF\u0DBD\u0DBA "withdrew") \u0DC0\u0DDA.' },
        adviceSi: "\u0DB6\u0DD0\u0D82\u0D9A\u0DD4\u0DC0\u0DDA\u0DAF\u0DD3 \u0DB4\u0DDD\u0DBD\u0DD2\u0DB8\u0DDA \u0DC3\u0DD2\u0DA7\u0DD2\u0DB1 \u0DC0\u0DD2\u0DA7 \u0DC0\u0DD2\u0DB1\u0DD3\u0DAD\u0DC0 \u0D85\u0DB1\u0DCA \u0D85\u0DBA\u0DA7 \u0D89\u0DA9 \u0DAF\u0DD9\u0DB1\u0DCA\u0DB1."
      }
    ]
  },
  // 13. Weather & Sri Lankan Seasons (Lessons 601 - 650)
  {
    domain: "Weather, Nature & Sri Lankan Seasons",
    domainSinhala: "\u0D9A\u0DCF\u0DBD\u0D9C\u0DD4\u0DAB\u0DBA \u0DC3\u0DC4 \u0DC3\u0DCA\u0DC0\u0DB7\u0DCF\u0DC0 \u0DC3\u0DDE\u0DB1\u0DCA\u0DAF\u0DBB\u0DCA\u0DBA\u0DBA",
    subtopics: [
      {
        titleEn: "Rain, Monsoons & Island Climate",
        titleSi: "\u0DC0\u0DD0\u0DC3\u0DCA\u0DC3, \u0DB8\u0DDD\u0DC3\u0DB8\u0DCA \u0DC3\u0DD4\u0DC5\u0D82 \u0DC3\u0DC4 \u0DAF\u0DDA\u0DC1\u0D9C\u0DD4\u0DAB\u0DBA",
        ruleTitleSi: '"It is raining", "It looks like rain"',
        ruleExplainSi: '\u0D9A\u0DCF\u0DBD\u0D9C\u0DD4\u0DAB\u0DBA \u0DB4\u0DD0\u0DC0\u0DC3\u0DD3\u0DB8\u0DDA\u0DAF\u0DD3 "It is sunny", "It is windy" \u0DBD\u0DD9\u0DC3 "It" \u0DBA\u0DDC\u0DAF\u0DCF\u0D9C\u0DB1\u0DD3.',
        phrases: [
          { en: "It is pouring heavily outside with thunder.", si: "\u0DB4\u0DD2\u0DA7\u0DAD \u0D9C\u0DD2\u0D9C\u0DD4\u0DBB\u0DD4\u0DB8\u0DCA \u0DC3\u0DC4\u0DD2\u0DAD\u0DC0 \u0DAD\u0DAF\u0DD2\u0DB1\u0DCA \u0DC0\u0DC4\u0DD2\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D89\u0DA7\u0DCA \u0D89\u0DC3\u0DCA \u0DB4\u0DDD\u0DBB\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DC4\u0DD9\u0DC0\u0DD2\u0DBD\u0DD2 \u0D85\u0DC0\u0DD4\u0DA7\u0DCA\u0DC3\u0DBA\u0DD2\u0DA9\u0DCA \u0DC0\u0DD2\u0DAD\u0DCA \u0DAD\u0DB1\u0DCA\u0DA9\u0DBB\u0DCA]", tip: "Pouring [\u0DB4\u0DDD\u0DBB\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA] \u0DAD\u0DAF \u0DC0\u0DD0\u0DC3\u0DCA\u0DC3\u0DBA\u0DD2." },
          { en: "Do not forget to take your umbrella today.", si: "\u0D85\u0DAF \u0D9A\u0DD4\u0DA9\u0DBA \u0D9C\u0DD9\u0DB1\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0D85\u0DB8\u0DAD\u0D9A \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0D91\u0DB4\u0DCF.", singlish: "[\u0DA9\u0DD6 \u0DB1\u0DDC\u0DA7\u0DCA \u0DC6\u0DDD\u0D9C\u0DD9\u0DA7\u0DCA \u0DA7\u0DD4 \u0DA7\u0DDA\u0D9A\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0D85\u0DB8\u0DCA\u0DB6\u0DCA\u200D\u0DBB\u0DD9\u0DBD\u0DCA\u0DBD\u0DCF \u0DA7\u0DD4\u0DA9\u0DDA]", tip: "Umbrella [\u0D85\u0DB8\u0DCA\u0DB6\u0DCA\u200D\u0DBB\u0DD9\u0DBD\u0DCA\u0DBD\u0DCF] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "The Southwest monsoon brings abundant rain.", si: "\u0DB1\u0DD2\u0DBB\u0DD2\u0DAD\u0DAF\u0DD2\u0D9C \u0DB8\u0DDD\u0DC3\u0DB8\u0DD9\u0DB1\u0DCA \u0D85\u0DB0\u0DD2\u0D9A \u0DC0\u0DBB\u0DCA\u0DC2\u0DCF\u0DC0\u0D9A\u0DCA \u0DBD\u0DD0\u0DB6\u0DDA.", singlish: "[\u0DAF \u0DC3\u0DC0\u0DD4\u0DAD\u0DCA\u0DC0\u0DD9\u0DC3\u0DCA\u0DA7\u0DCA \u0DB8\u0DDC\u0DB1\u0DCA\u0DC3\u0DD6\u0DB1\u0DCA \u0DB6\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA\u0DC3\u0DCA \u0D85\u0DB6\u0DB1\u0DCA\u0DA9\u0DB1\u0DCA\u0DA7\u0DCA \u0DBB\u0DDA\u0DB1\u0DCA]", tip: "Abundant [\u0D85\u0DB6\u0DB1\u0DCA\u0DA9\u0DB1\u0DCA\u0DA7\u0DCA] \u0DB6\u0DC4\u0DD4\u0DBD\u0DBA\u0DD2." },
          { en: "The gentle morning breeze is so refreshing.", si: "\u0D8B\u0DAF\u0DD1\u0DC3\u0DB1 \u0DC3\u0DD2\u0DC3\u0DD2\u0DBD\u0DCA \u0DC3\u0DD4\u0DC5\u0D9F \u0DC4\u0DBB\u0DD2\u0DB8 \u0DB4\u0DCA\u200D\u0DBB\u0DB6\u0DDD\u0DB0\u0DB8\u0DAD\u0DCA.", singlish: "[\u0DAF \u0DA2\u0DD9\u0DB1\u0DCA\u0DA7\u0DCA\u0DBD\u0DCA \u0DB8\u0DDD\u0DB1\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DB6\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DCA \u0D89\u0DC3\u0DCA \u0DC3\u0DDD \u0DBB\u0DD2\u0DC6\u0DCA\u200D\u0DBB\u0DD9\u0DC2\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA]", tip: "Breeze [\u0DB6\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DCA] \u0DB8\u0DD8\u0DAF\u0DD4 \u0DC3\u0DD4\u0DC5\u0D9F\u0DBA\u0DD2." },
          { en: "Sri Lanka is blessed with evergreen greenery.", si: "\u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DBD\u0D82\u0D9A\u0DCF\u0DC0 \u0DC3\u0DAF\u0DCF\u0DC4\u0DBB\u0DD2\u0DAD \u0DC3\u0DDC\u0DB6\u0DCF\u0DAF\u0DC4\u0DB8\u0DD9\u0DB1\u0DCA \u0D86\u0DC1\u0DD2\u0DBB\u0DCA\u0DC0\u0DCF\u0DAF \u0DBD\u0DD0\u0DB6\u0DD6\u0DC0\u0D9A\u0DD2.", singlish: "[\u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DBD\u0D82\u0D9A\u0DCF \u0D89\u0DC3\u0DCA \u0DB6\u0DCA\u0DBD\u0DD9\u0DC3\u0DCA\u0DA9\u0DCA \u0DC0\u0DD2\u0DAD\u0DCA \u0D91\u0DC0\u0DBB\u0DCA\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DB1\u0DCA \u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DB1\u0DBB\u0DD2]", tip: "Greenery [\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DB1\u0DBB\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "Big rain is falling.", correct: "It is raining heavily.", explanationSinhala: '"Big rain is falling" \u0DBA\u0DB1\u0DD4 \u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0DC3\u0DD2\u0DAD\u0DD4\u0DC0\u0DD2\u0DBD\u0DCA\u0DBD\u0D9A\u0DD2. "It is raining heavily" \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0D9A\u0DCF\u0DBD\u0D9C\u0DD4\u0DAB\u0DBA \u0D9C\u0DD0\u0DB1 \u0D9A\u0DAD\u0DCF \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DC3\u0D82\u0DC0\u0DCF\u0DAF\u0DBA\u0D9A\u0DCA \u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7 \u0D9A\u0DAF\u0DD2\u0DB8 \u0DB8\u0D9C\u0D9A\u0DD2!"
      }
    ]
  },
  // 14. Job Interviews & Workplace (Lessons 651 - 700)
  {
    domain: "Job Interviews, Career & Workplace",
    domainSinhala: "\u0DBB\u0DD0\u0D9A\u0DD2\u0DBA\u0DCF \u0DC3\u0DB8\u0DCA\u0DB8\u0DD4\u0D9B \u0DB4\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB \u0DC3\u0DC4 \u0DC0\u0DD8\u0DAD\u0DCA\u0DAD\u0DD3\u0DBA \u0DC3\u0DCF\u0DBB\u0DCA\u0DAE\u0D9A\u0DAD\u0DCA\u0DC0\u0DBA",
    subtopics: [
      {
        titleEn: "Interview Strengths & Team Collaboration",
        titleSi: "\u0DC3\u0DB8\u0DCA\u0DB8\u0DD4\u0D9B \u0DB4\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB \u0DC3\u0DC4 \u0D9A\u0DAB\u0DCA\u0DA9\u0DCF\u0DBA\u0DB8\u0DCA \u0DC0\u0DD0\u0DA9",
        ruleTitleSi: "\u0DC4\u0DD0\u0D9A\u0DD2\u0DBA\u0DCF\u0DC0\u0DB1\u0DCA \u0DC3\u0DC4 \u0DAF\u0D9A\u0DCA\u0DC2\u0DAD\u0DCF \u0DB4\u0DCA\u200D\u0DBB\u0D9A\u0DCF\u0DC1 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
        ruleExplainSi: '"I have experience in...", "My greatest strength is..." \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "Thank you for giving me this valuable interview.", si: "\u0DB8\u0DA7 \u0DB8\u0DD9\u0DB8 \u0DC0\u0DA7\u0DD2\u0DB1\u0DCF \u0DC3\u0DB8\u0DCA\u0DB8\u0DD4\u0D9B \u0DB4\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA \u0DBD\u0DB6\u0DCF \u0DAF\u0DD3\u0DB8 \u0D9C\u0DD0\u0DB1 \u0DC3\u0DCA\u0DAD\u0DD6\u0DAD\u0DD2\u0DBA\u0DD2.", singlish: "[\u0DAD\u0DD1\u0DB1\u0DCA\u0D9A\u0DCA \u0DBA\u0DD6 \u0DC6\u0DDD \u0D9C\u0DD2\u0DC0\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DB8\u0DD3 \u0DAF\u0DD2\u0DC3\u0DCA \u0DC0\u0DD0\u0DBD\u0DD2\u0DBA\u0DD4\u0DB6\u0DBD\u0DCA \u0D89\u0DB1\u0DCA\u0DA7\u0DBB\u0DCA\u0DC0\u0DD3\u0DC0\u0DCA]", tip: "Valuable [\u0DC0\u0DD0\u0DBD\u0DD2\u0DBA\u0DD4\u0DB6\u0DBD\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "My greatest strength is my problem-solving ability.", si: "\u0DB8\u0D9C\u0DDA \u0DBD\u0DDC\u0D9A\u0DD4\u0DB8 \u0DC1\u0D9A\u0DCA\u0DAD\u0DD2\u0DBA \u0DC0\u0DB1\u0DCA\u0DB1\u0DDA \u0D9C\u0DD0\u0DA7\u0DBD\u0DD4 \u0DC0\u0DD2\u0DC3\u0DB3\u0DD3\u0DB8\u0DDA \u0DC4\u0DD0\u0D9A\u0DD2\u0DBA\u0DCF\u0DC0\u0DBA\u0DD2.", singlish: "[\u0DB8\u0DBA\u0DD2 \u0D9C\u0DCA\u200D\u0DBB\u0DDA\u0DA7\u0DC3\u0DCA\u0DA7\u0DCA \u0DC3\u0DCA\u0DA7\u0DCA\u200D\u0DBB\u0DD9\u0DB1\u0DCA\u0DAD\u0DCA \u0D89\u0DC3\u0DCA \u0DB8\u0DBA\u0DD2 \u0DB4\u0DCA\u200D\u0DBB\u0DDC\u0DB6\u0DCA\u0DBD\u0DB8\u0DCA \u0DC3\u0DDC\u0DBD\u0DCA\u0DC0\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0D87\u0DB6\u0DD2\u0DBD\u0DD2\u0DA7\u0DD2]", tip: "Strength [\u0DC3\u0DCA\u0DA7\u0DCA\u200D\u0DBB\u0DD9\u0DB1\u0DCA\u0DAD\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I work exceptionally well in a team environment.", si: "\u0DB8\u0DB8 \u0D9A\u0DAB\u0DCA\u0DA9\u0DCF\u0DBA\u0DB8\u0D9A\u0DCA \u0DAD\u0DD4\u0DC5 \u0D89\u0DAD\u0DCF \u0DC3\u0DCF\u0DBB\u0DCA\u0DAE\u0D9A\u0DC0 \u0DC0\u0DD0\u0DA9 \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC0\u0DBB\u0DCA\u0D9A\u0DCA \u0D91\u0D9A\u0DCA\u0DC3\u0DD9\u0DB4\u0DCA\u0DC2\u0DB1\u0DBD\u0DD2 \u0DC0\u0DD9\u0DBD\u0DCA \u0D89\u0DB1\u0DCA \u0D85 \u0DA7\u0DD3\u0DB8\u0DCA \u0D91\u0DB1\u0DCA\u0DC0\u0DBA\u0DD2\u0DBB\u0DB1\u0DCA\u0DB8\u0DB1\u0DCA\u0DA7\u0DCA]", tip: "Environment [\u0D91\u0DB1\u0DCA\u0DC0\u0DBA\u0DD2\u0DBB\u0DB1\u0DCA\u0DB8\u0DB1\u0DCA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I am always eager to learn modern skills.", si: "\u0DB8\u0DB8 \u0DB1\u0DD2\u0DAD\u0DBB\u0DB8 \u0DB1\u0DC0\u0DD3\u0DB1 \u0DB1\u0DD2\u0DB4\u0DD4\u0DAB\u0DAD\u0DCF \u0D89\u0D9C\u0DD9\u0DB1\u0DD3\u0DB8\u0DA7 \u0DB8\u0DC4\u0DAD\u0DCA \u0D8B\u0DB1\u0DB1\u0DCA\u0DAF\u0DD4\u0DC0\u0D9A\u0DCA \u0DAF\u0D9A\u0DCA\u0DC0\u0DB8\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0D95\u0DBD\u0DCA\u0DC0\u0DDA\u0DC3\u0DCA \u0D8A\u0D9C\u0DBB\u0DCA \u0DA7\u0DD4 \u0DBD\u0DBB\u0DCA\u0DB1\u0DCA \u0DB8\u0DDC\u0DA9\u0DBB\u0DCA\u0DB1\u0DCA \u0DC3\u0DCA\u0D9A\u0DD2\u0DBD\u0DCA\u0DC3\u0DCA]", tip: "Modern [\u0DB8\u0DDC\u0DA9\u0DBB\u0DCA\u0DB1\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Where do you see yourself in five years?", si: "\u0DC0\u0DC3\u0DBB \u0DB4\u0DC4\u0D9A\u0DD2\u0DB1\u0DCA \u0D94\u0DB6 \u0D94\u0DB6\u0DC0 \u0DAF\u0D9A\u0DD2\u0DB1\u0DCA\u0DB1\u0DDA \u0D9A\u0DDC\u0DAD\u0DD0\u0DB1\u0DAF?", singlish: "[\u0DC0\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA \u0DA9\u0DD6 \u0DBA\u0DD6 \u0DC3\u0DD3 \u0DBA\u0DD4\u0DC0\u0DBB\u0DCA\u0DC3\u0DD9\u0DBD\u0DCA\u0DC6\u0DCA \u0D89\u0DB1\u0DCA \u0DC6\u0DBA\u0DD2\u0DC0\u0DCA \u0D89\u0DBA\u0DBB\u0DCA\u0DC3\u0DCA?]", tip: "Yourself [\u0DBA\u0DD4\u0DC0\u0DBB\u0DCA\u0DC3\u0DD9\u0DBD\u0DCA\u0DC6\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "I have 5 years experience.", correct: "I have 5 years of experience.", explanationSinhala: '\u0DC3\u0DB8\u0DCA\u0DB8\u0DD4\u0D9B \u0DB4\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0DAB\u0DBA\u0DDA\u0DAF\u0DD3 "5 years of experience" \u0DBD\u0DD9\u0DC3 "of" \u0DBA\u0DD9\u0DAF\u0DD2\u0DBA \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA.' },
        adviceSi: "\u0DC3\u0DB8\u0DCA\u0DB8\u0DD4\u0D9B \u0DB4\u0DBB\u0DD3\u0D9A\u0DCA\u0DC2\u0D9A\u0DC0\u0DBB\u0DBA\u0DCF\u0D9C\u0DDA \u0DAF\u0DD1\u0DC3\u0DCA \u0DAF\u0DD9\u0DC3 \u0DB6\u0DBD\u0DCF \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D86\u0DAD\u0DCA\u0DB8 \u0DC0\u0DD2\u0DC1\u0DCA\u0DC0\u0DCF\u0DC3\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1."
      }
    ]
  },
  // 15. Crucial Sri Lankan Mistakes (Lessons 701 - 750)
  {
    domain: "Crucial Sri Lankan Mistakes Corrected",
    domainSinhala: "\u0DBD\u0DCF\u0D82\u0D9A\u0DD2\u0D9A \u0D85\u0DB4\u0DD2\u0DA7 \u0DB1\u0DD2\u0DAD\u0DBB \u0DC0\u0DBB\u0DAF\u0DD2\u0DB1 \u0DAD\u0DD0\u0DB1\u0DCA \u0DB1\u0DD2\u0DC0\u0DD0\u0DBB\u0DAF\u0DD2 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
    subtopics: [
      {
        titleEn: "Eliminating Direct Sinhala Translations",
        titleSi: "\u0DC0\u0DA0\u0DB1\u0DBA\u0DD9\u0DB1\u0DCA \u0DC0\u0DA0\u0DB1\u0DBA \u0DB4\u0DBB\u0DD2\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA \u0DB1\u0DD0\u0DC0\u0DD0\u0DAD\u0DCA\u0DC0\u0DD3\u0DB8",
        ruleTitleSi: "\u0DC3\u0DCA\u0DC0\u0DCF\u0DB7\u0DCF\u0DC0\u0DD2\u0D9A \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD\u0DBA",
        ruleExplainSi: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA \u0DC0\u0DA0\u0DB1\u0DBA\u0DD9\u0DB1\u0DCA \u0DC0\u0DA0\u0DB1\u0DBA \u0DB4\u0DBB\u0DD2\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA \u0DB1\u0DDC\u0D9A\u0DBB \u0DB1\u0DD2\u0DC0\u0DD0\u0DBB\u0DAF\u0DD2 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DBB\u0DA7\u0DCF\u0DC0 \u0D85\u0DB1\u0DD4\u0D9C\u0DB8\u0DB1\u0DBA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.",
        phrases: [
          { en: "I will go and come back soon.", si: "\u0DB8\u0DB8 \u0D9C\u0DD2\u0DC4\u0DD2\u0DB1\u0DCA \u0D89\u0D9A\u0DCA\u0DB8\u0DB1\u0DD2\u0DB1\u0DCA \u0D91\u0DB1\u0DCA\u0DB1\u0DB8\u0DCA.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC0\u0DD2\u0DBD\u0DCA \u0D9C\u0DDD \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0D9A\u0DB8\u0DCA \u0DB6\u0DD1\u0D9A\u0DCA \u0DC3\u0DD6\u0DB1\u0DCA]", tip: "Come back [\u0D9A\u0DB8\u0DCA \u0DB6\u0DD1\u0D9A\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Could you turn off the lights, please?", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DC0\u0DD2\u0DAF\u0DD4\u0DBD\u0DD2 \u0DB4\u0DC4\u0DB1\u0DCA \u0DB1\u0DD2\u0DC0\u0DCF \u0DAF\u0DB8\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA\u0DAF?", singlish: "[\u0D9A\u0DD4\u0DA9\u0DCA \u0DBA\u0DD6 \u0DA7\u0DBB\u0DCA\u0DB1\u0DCA \u0D95\u0DC6\u0DCA \u0DAF \u0DBD\u0DBA\u0DD2\u0DA7\u0DCA\u0DC3\u0DCA, \u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA?]", tip: "Turn off [\u0DA7\u0DBB\u0DCA\u0DB1\u0DCA \u0D95\u0DC6\u0DCA] \u0DB1\u0DD2\u0DC0\u0DD3\u0DB8\u0DBA\u0DD2." },
          { en: "She gave birth to a healthy baby girl.", si: "\u0D87\u0DBA \u0DB1\u0DD2\u0DBB\u0DDD\u0D9C\u0DD3 \u0DAF\u0DD2\u0DBA\u0DAB\u0DD2\u0DBA\u0D9A\u0DCA \u0DB6\u0DD2\u0DC4\u0DD2 \u0D9A\u0DC5\u0DCF\u0DBA.", singlish: "[\u0DC2\u0DD3 \u0D9C\u0DDA\u0DC0\u0DCA \u0DB6\u0DBB\u0DCA\u0DAD\u0DCA \u0DA7\u0DD4 \u0D85 \u0DC4\u0DD9\u0DBD\u0DCA\u0DAD\u0DD2 \u0DB6\u0DDA\u0DB6\u0DD2 \u0D9C\u0DBB\u0DCA\u0DBD\u0DCA]", tip: "Birth [\u0DB6\u0DBB\u0DCA\u0DAD\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I am waiting for the bus patiently.", si: "\u0DB8\u0DB8 \u0D89\u0DC0\u0DC3\u0DD3\u0DB8\u0DD9\u0DB1\u0DCA \u0DB6\u0DC3\u0DCA \u0DBB\u0DAE\u0DBA \u0D91\u0DB1\u0DAD\u0DD4\u0DBB\u0DD4 \u0DB6\u0DBD\u0DCF \u0DC3\u0DD2\u0DA7\u0DD2\u0DB8\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0DC0\u0DDA\u0DA7\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DC6\u0DDD \u0DAF \u0DB6\u0DC3\u0DCA \u0DB4\u0DDA\u0DC2\u0DB1\u0DCA\u0DA7\u0DCA\u0DBD\u0DD2]", tip: "Patiently [\u0DB4\u0DDA\u0DC2\u0DB1\u0DCA\u0DA7\u0DCA\u0DBD\u0DD2] \u0D89\u0DC0\u0DC3\u0DD3\u0DB8\u0DD9\u0DB1\u0DD2." },
          { en: "He congratulated me on my exam success.", si: "\u0D94\u0DC4\u0DD4 \u0DB8\u0D9C\u0DDA \u0DC0\u0DD2\u0DB7\u0DCF\u0D9C \u0DA2\u0DBA\u0D9C\u0DCA\u200D\u0DBB\u0DC4\u0DAB\u0DBA\u0DA7 \u0DC3\u0DD4\u0DB6 \u0DB4\u0DD0\u0DAD\u0DD4\u0DC0\u0DCF.", singlish: "[\u0DC4\u0DD3 \u0D9A\u0DDC\u0DB1\u0DCA\u0D9C\u0DCA\u200D\u0DBB\u0DD0\u0DA2\u0DD4\u0DBD\u0DDA\u0DA7\u0DA9\u0DCA \u0DB8\u0DD3 \u0D94\u0DB1\u0DCA \u0DB8\u0DBA\u0DD2 \u0D91\u0D9A\u0DCA\u0DC3\u0DD1\u0DB8\u0DCA \u0DC3\u0D9A\u0DCA\u0DC3\u0DC3\u0DCA]", tip: "Congratulated [\u0D9A\u0DDC\u0DB1\u0DCA\u0D9C\u0DCA\u200D\u0DBB\u0DD0\u0DA2\u0DD4\u0DBD\u0DDA\u0DA7\u0DA9\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "Close the light.", correct: "Turn off the light.", explanationSinhala: '\u0DC0\u0DD2\u0DAF\u0DD4\u0DBD\u0DD2 \u0DB6\u0DBD\u0DCA\u0DB6 \u0DC0\u0DBD\u0DA7 "close" \u0DB1\u0DDC\u0D9A\u0DD2\u0DBA\u0DCF "turn off" \u0DC4\u0DDD "switch off" \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD, \u0DC0\u0DD0\u0DBB\u0DAF\u0DD2 \u0DC4\u0DAF\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1 \u0DB6\u0DBA \u0DC0\u0DD9\u0DB1\u0DCA\u0DB1 \u0D91\u0DB4\u0DCF. \u0DC0\u0DD0\u0DBB\u0DAF\u0DD9\u0DB1\u0DCA\u0DB1\u0DDA \u0D8B\u0DAD\u0DCA\u0DC3\u0DCF\u0DC4 \u0D9A\u0DBB\u0DB1 \u0D85\u0DBA\u0DA7\u0DBA\u0DD2!"
      }
    ]
  },
  // 16. Expressing Feelings & Opinions (Lessons 751 - 800)
  {
    domain: "Expressing Feelings, Opinions & Debates",
    domainSinhala: "\u0DC4\u0DD0\u0D9F\u0DD3\u0DB8\u0DCA \u0DC3\u0DC4 \u0DB4\u0DD4\u0DAF\u0DCA\u0D9C\u0DBD\u0DD2\u0D9A \u0D85\u0DAF\u0DC4\u0DC3\u0DCA \u0DB4\u0DCA\u200D\u0DBB\u0D9A\u0DCF\u0DC1 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
    subtopics: [
      {
        titleEn: "Agreeing, Disagreeing & Showing Empathy",
        titleSi: "\u0D91\u0D9A\u0D9F \u0DC0\u0DD3\u0DB8, \u0DC0\u0DD2\u0DBB\u0DD4\u0DAF\u0DCA\u0DB0 \u0DC0\u0DD3\u0DB8 \u0DC3\u0DC4 \u0DC3\u0D82\u0DC0\u0DDA\u0DAF\u0DD3 \u0DC0\u0DD3\u0DB8",
        ruleTitleSi: '"In my honest opinion...", "I totally agree"',
        ruleExplainSi: '\u0DAD\u0DB8\u0DB1\u0DCA\u0D9C\u0DDA \u0DB8\u0DAD\u0DBA \u0DB4\u0DCA\u200D\u0DBB\u0D9A\u0DCF\u0DC1 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8\u0DA7 "In my opinion...", "I believe that..." \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "In my opinion, practice makes everything perfect.", si: "\u0DB8\u0D9C\u0DDA \u0DB8\u0DAD\u0DBA \u0D85\u0DB1\u0DD4\u0DC0 \u0DB4\u0DD4\u0DC4\u0DD4\u0DAB\u0DD4\u0DC0 \u0DC3\u0DD2\u0DBA\u0DBD\u0DCA\u0DBD \u0DC3\u0DCF\u0DBB\u0DCA\u0DAE\u0D9A \u0D9A\u0DBB\u0DBA\u0DD2.", singlish: "[\u0D89\u0DB1\u0DCA \u0DB8\u0DBA\u0DD2 \u0D94\u0DB4\u0DD3\u0DB1\u0DD2\u0DBA\u0DB1\u0DCA, \u0DB4\u0DCA\u200D\u0DBB\u0DD0\u0D9A\u0DCA\u0DA7\u0DD2\u0DC3\u0DCA \u0DB8\u0DDA\u0D9A\u0DCA\u0DC3\u0DCA \u0D91\u0DC0\u0DCA\u0DBB\u0DD2\u0DAD\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DB4\u0DBB\u0DCA\u0DC6\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA]", tip: "Opinion [\u0D94\u0DB4\u0DD3\u0DB1\u0DD2\u0DBA\u0DB1\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I completely agree with your viewpoint.", si: "\u0DB8\u0DB8 \u0D94\u0DB6\u0D9C\u0DDA \u0DB8\u0DAD\u0DBA \u0DC3\u0DB8\u0D9F \u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB\u0DBA\u0DD9\u0DB1\u0DCA\u0DB8 \u0D91\u0D9A\u0D9F \u0DC0\u0DD9\u0DB8\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D9A\u0DB8\u0DCA\u0DB4\u0DCA\u0DBD\u0DD3\u0DA7\u0DCA\u0DBD\u0DD2 \u0D85\u0D9C\u0DCA\u200D\u0DBB\u0DD3 \u0DC0\u0DD2\u0DAD\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0DC0\u0DD3\u0DC0\u0DCA\u0DB4\u0DDC\u0DBA\u0DD2\u0DB1\u0DCA\u0DA7\u0DCA]", tip: "Agree [\u0D85\u0D9C\u0DCA\u200D\u0DBB\u0DD3] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I am so sorry to hear about your loss.", si: "\u0D94\u0DB6\u0DDA \u0D85\u0DC4\u0DD2\u0DB8\u0DD2\u0DC0\u0DD3\u0DB8 \u0D9C\u0DD0\u0DB1 \u0DB8\u0DB8 \u0DB6\u0DD9\u0DC4\u0DD9\u0DC0\u0DD2\u0DB1\u0DCA \u0D9A\u0DAB\u0D9C\u0DCF\u0DA7\u0DD4 \u0DC0\u0DD9\u0DB8\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0D88\u0DB8\u0DCA \u0DC3\u0DDD \u0DC3\u0DDC\u0DBB\u0DD2 \u0DA7\u0DD4 \u0DC4\u0DD2\u0DBA\u0DBB\u0DCA \u0D85\u0DB6\u0DC0\u0DD4\u0DA7\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0DBD\u0DDC\u0DC3\u0DCA]", tip: "Loss [\u0DBD\u0DDC\u0DC3\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Congratulations on your remarkable achievement!", si: "\u0D94\u0DB6\u0D9C\u0DDA \u0DC0\u0DD2\u0DC1\u0DD2\u0DC2\u0DCA\u0DA7 \u0DA2\u0DBA\u0D9C\u0DCA\u200D\u0DBB\u0DC4\u0DAB\u0DBA\u0DA7 \u0D8B\u0DAB\u0DD4\u0DC3\u0DD4\u0DB8\u0DCA \u0DC3\u0DD4\u0DB6\u0DB4\u0DD0\u0DAD\u0DD4\u0DB8\u0DCA!", singlish: "[\u0D9A\u0DDC\u0DB1\u0DCA\u0D9C\u0DCA\u200D\u0DBB\u0DD0\u0DA2\u0DD4\u0DBD\u0DDA\u0DC2\u0DB1\u0DCA\u0DC3\u0DCA \u0D94\u0DB1\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0DBB\u0DD2\u0DB8\u0DCF\u0D9A\u0DB6\u0DBD\u0DCA \u0D85\u0DA0\u0DD3\u0DC0\u0DCA\u0DB8\u0DB1\u0DCA\u0DA7\u0DCA!]", tip: "Remarkable [\u0DBB\u0DD2\u0DB8\u0DCF\u0D9A\u0DB6\u0DBD\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "I deeply appreciate your continuous support.", si: "\u0D94\u0DB6\u0D9C\u0DDA \u0DB1\u0DD2\u0DBB\u0DB1\u0DCA\u0DAD\u0DBB \u0DC3\u0DC4\u0DBA\u0DDD\u0D9C\u0DBA \u0DB8\u0DB8 \u0DC4\u0DAF\u0DC0\u0DAD\u0DD2\u0DB1\u0DCA\u0DB8 \u0D85\u0D9C\u0DBA \u0D9A\u0DBB\u0DB8\u0DD2.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DA9\u0DD3\u0DB4\u0DCA\u0DBD\u0DD2 \u0D85\u0DB4\u0DCA\u200D\u0DBB\u0DD3\u0DC2\u0DD2\u0DBA\u0DDA\u0DA7\u0DCA \u0DBA\u0DDD\u0DBB\u0DCA \u0D9A\u0DB1\u0DCA\u0DA7\u0DD2\u0DB1\u0DD2\u0DBA\u0DD4\u0D85\u0DC3\u0DCA \u0DC3\u0DB4\u0DDD\u0DA7\u0DCA]", tip: "Appreciate [\u0D85\u0DB4\u0DCA\u200D\u0DBB\u0DD3\u0DC2\u0DD2\u0DBA\u0DDA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." }
        ],
        mistake: { incorrect: "I am agree with you.", correct: "I agree with you.", explanationSinhala: '"Agree" \u0DBA\u0DB1\u0DD4 \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF \u0DB4\u0DAF\u0DBA\u0D9A\u0DD2 (Verb). \u0D91\u0DB6\u0DD0\u0DC0\u0DD2\u0DB1\u0DCA "am" \u0DB1\u0DDC\u0DBA\u0DDC\u0DAF\u0DCF "I agree" \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1.' },
        adviceSi: "\u0DC0\u0DD9\u0DB1\u0DAD\u0DCA \u0DB8\u0DAD\u0DBA\u0D9A\u0DCA \u0DB4\u0DD2\u0DC5\u0DD2\u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DDA\u0DAF\u0DD3\u0DAD\u0DCA \u0DC0\u0DD2\u0DB1\u0DD3\u0DAD\u0DC0 \u0D85\u0DAF\u0DC4\u0DC3\u0DCA \u0D89\u0DAF\u0DD2\u0DBB\u0DD2\u0DB4\u0DAD\u0DCA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1."
      }
    ]
  },
  // 17. Modal Verbs: Can, Could, Should, Must (Lessons 801 - 850)
  {
    domain: "Modal Verbs: Can, Could, Should, Must",
    domainSinhala: "\u0DC4\u0DD0\u0D9A\u0DD2\u0DBA\u0DCF\u0DC0\u0DB1\u0DCA \u0DC3\u0DC4 \u0D8B\u0DB4\u0DAF\u0DD9\u0DC3\u0DCA (Modals)",
    subtopics: [
      {
        titleEn: "Obligation, Permission & Advice",
        titleSi: "\u0D85\u0DC0\u0DC3\u0DBB \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8, \u0D8B\u0DB4\u0DAF\u0DD9\u0DC3\u0DCA \u0DAF\u0DD3\u0DB8 \u0DC3\u0DC4 \u0DC0\u0D9C\u0D9A\u0DD3\u0DB8",
        ruleTitleSi: "Modal Verb + \u0DB8\u0DD6\u0DBD\u0DD2\u0D9A \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0 (Bare Infinitive)",
        ruleExplainSi: 'Can, Could, Should, Must \u0DB4\u0DC3\u0DD4\u0DC0 \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0\u0DA7 "to" \u0DC4\u0DDD "ing" \u0D91\u0D9A\u0DCA \u0DB1\u0DDC\u0DC0\u0DDA (You should go, not you should to go).',
        phrases: [
          { en: "You should drink clean boiled water.", si: "\u0D94\u0DB6 \u0DB4\u0DD2\u0DBB\u0DD2\u0DC3\u0DD2\u0DAF\u0DD4 \u0D8B\u0DAB\u0DD4\u0D9A\u0DBB \u0DB1\u0DD2\u0DC0\u0DCF\u0D9C\u0DAD\u0DCA \u0DA2\u0DBD\u0DBA \u0DB4\u0DCF\u0DB1\u0DBA \u0D9A\u0DC5 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA\u0DD2.", singlish: "[\u0DBA\u0DD6 \u0DC2\u0DD4\u0DA9\u0DCA \u0DA9\u0DCA\u200D\u0DBB\u0DD2\u0DB1\u0DCA\u0D9A\u0DCA \u0D9A\u0DCA\u0DBD\u0DD3\u0DB1\u0DCA \u0DB6\u0DDC\u0DBA\u0DD2\u0DBD\u0DCA\u0DA9\u0DCA \u0DC0\u0DDD\u0DA7\u0DBB\u0DCA]", tip: 'Should [\u0DC2\u0DD4\u0DA9\u0DCA] \u0DC4\u0DD2 "l" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA\u0DD2.' },
          { en: "Could you lend me your dictionary for a moment?", si: "\u0DB8\u0DDC\u0DC4\u0DDC\u0DAD\u0D9A\u0DA7 \u0D94\u0DB6\u0DDA \u0DC1\u0DB6\u0DCA\u0DAF\u0D9A\u0DDD\u0DC2\u0DBA \u0DB8\u0DA7 \u0DAB\u0DBA\u0DA7 \u0DAF\u0DD2\u0DBA \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0D9A\u0DD4\u0DA9\u0DCA \u0DBA\u0DD6 \u0DBD\u0DD9\u0DB1\u0DCA\u0DA9\u0DCA \u0DB8\u0DD3 \u0DBA\u0DDD\u0DBB\u0DCA \u0DA9\u0DD2\u0D9A\u0DCA\u0DC2\u0DB1\u0DBB\u0DD2 \u0DC6\u0DDD \u0D85 \u0DB8\u0DDD\u0DB8\u0DB1\u0DCA\u0DA7\u0DCA?]", tip: "Dictionary [\u0DA9\u0DD2\u0D9A\u0DCA\u0DC2\u0DB1\u0DBB\u0DD2] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "We must respect each other always.", si: "\u0D85\u0DB4\u0DD2 \u0DC3\u0DD0\u0DB8\u0DC0\u0DD2\u0DA7\u0DB8 \u0D91\u0D9A\u0DD2\u0DB1\u0DD9\u0D9A\u0DCF\u0DA7 \u0D9C\u0DBB\u0DD4 \u0D9A\u0DC5 \u0DBA\u0DD4\u0DAD\u0DD4\u0DBA.", singlish: "[\u0DC0\u0DD3 \u0DB8\u0DC3\u0DCA\u0DA7\u0DCA \u0DBB\u0DD2\u0DC3\u0DCA\u0DB4\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA \u0D8A\u0DA0\u0DCA \u0D85\u0DAF\u0DBB\u0DCA \u0D95\u0DBD\u0DCA\u0DC0\u0DDA\u0DC3\u0DCA]", tip: "Respect [\u0DBB\u0DD2\u0DC3\u0DCA\u0DB4\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "You can achieve any dream with discipline.", si: "\u0DC0\u0DD2\u0DB1\u0DBA \u0DC3\u0DB8\u0D9F \u0D94\u0DB6\u0DA7 \u0D95\u0DB1\u0DD1\u0DB8 \u0DC3\u0DD2\u0DC4\u0DD2\u0DB1\u0DBA\u0D9A\u0DCA \u0DC3\u0DD0\u0DB6\u0DD1 \u0D9A\u0DBB\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A.", singlish: "[\u0DBA\u0DD6 \u0D9A\u0DD1\u0DB1\u0DCA \u0D85\u0DA0\u0DD3\u0DC0\u0DCA \u0D91\u0DB1\u0DD2 \u0DA9\u0DCA\u200D\u0DBB\u0DD3\u0DB8\u0DCA \u0DC0\u0DD2\u0DAD\u0DCA \u0DA9\u0DD2\u0DC3\u0DD2\u0DB4\u0DCA\u0DBD\u0DD2\u0DB1\u0DCA]", tip: "Discipline [\u0DA9\u0DD2\u0DC3\u0DD2\u0DB4\u0DCA\u0DBD\u0DD2\u0DB1\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "May I borrow your ballpoint pen?", si: "\u0DB8\u0DA7 \u0D94\u0DB6\u0DDA \u0DB6\u0DDD\u0DBD\u0DCA\u0DB4\u0DDC\u0DBA\u0DD2\u0DB1\u0DCA\u0DA7\u0DCA \u0DB4\u0DD1\u0DB1 \u0DBD\u0DB6\u0DCF\u0D9C\u0DAD \u0DC4\u0DD0\u0D9A\u0DD2\u0DAF?", singlish: "[\u0DB8\u0DDA \u0D85\u0DBA\u0DD2 \u0DB6\u0DDC\u0DBB\u0DDD \u0DBA\u0DDD\u0DBB\u0DCA \u0DB6\u0DDD\u0DBD\u0DCA\u0DB4\u0DDC\u0DBA\u0DD2\u0DB1\u0DCA\u0DA7\u0DCA \u0DB4\u0DD9\u0DB1\u0DCA?]", tip: "Borrow [\u0DB6\u0DDC\u0DBB\u0DDD] \u0DAB\u0DBA\u0DA7 \u0D9C\u0DD0\u0DB1\u0DD3\u0DB8\u0DBA\u0DD2." }
        ],
        mistake: { incorrect: "He can to swim.", correct: "He can swim.", explanationSinhala: '"Can" \u0DB4\u0DC3\u0DD4\u0DC0 "to" \u0DB1\u0DDC\u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1. "He can swim" \u0DB1\u0DD2\u0DC0\u0DD0\u0DBB\u0DAF\u0DD2\u0DBA\u0DD2.' },
        adviceSi: '\u0D8B\u0DB4\u0DAF\u0DD9\u0DC3\u0DCA \u0DAF\u0DD9\u0DB1 \u0DC0\u0DD2\u0DA7 "You must" \u0DC0\u0DD9\u0DB1\u0DD4\u0DC0\u0DA7 "You should" \u0DBA\u0DD9\u0DAF\u0DD3\u0DB8 \u0DC0\u0DA9\u0DCF\u0DAD\u0DCA \u0DC3\u0DD4\u0DC4\u0DAF\u0DC1\u0DD3\u0DBD\u0DD3 \u0DC0\u0DDA.'
      }
    ]
  },
  // 18. Emergency & Directions (Lessons 851 - 900)
  {
    domain: "Emergency Situations & Asking Directions",
    domainSinhala: "\u0DC4\u0DAF\u0DD2\u0DC3\u0DD2 \u0D85\u0DC0\u0DC3\u0DCA\u0DAE\u0DCF \u0DC3\u0DC4 \u0DB4\u0DCF\u0DBB\u0DAD\u0DDC\u0DA7 \u0DC0\u0DD2\u0DB8\u0DC3\u0DD3\u0DB8",
    subtopics: [
      {
        titleEn: "Navigating Streets & Urgent Help",
        titleSi: "\u0DB4\u0DCF\u0DBB\u0DC0\u0DBD\u0DCA \u0DC3\u0DD9\u0DC0\u0DD3\u0DB8 \u0DC3\u0DC4 \u0DC4\u0DAF\u0DD2\u0DC3\u0DD2 \u0D8B\u0DAF\u0DC0\u0DCA",
        ruleTitleSi: '"Turn left", "Go straight", "Opposite to"',
        ruleExplainSi: '"Go straight ahead", "Turn left at the junction" \u0D86\u0DAF\u0DD3 \u0DBD\u0DD9\u0DC3 \u0D8B\u0DB4\u0DAF\u0DD9\u0DC3\u0DCA \u0DBD\u0DB6\u0DCF\u0DAF\u0DD9\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "Excuse me, how do I get to the hospital?", si: "\u0DC3\u0DB8\u0DCF\u0DC0\u0DD9\u0DB1\u0DCA\u0DB1, \u0DB8\u0DB8 \u0DBB\u0DDD\u0DC4\u0DBD\u0DA7 \u0DBA\u0DB1\u0DCA\u0DB1\u0DDA \u0D9A\u0DD9\u0DC3\u0DDA\u0DAF?", singlish: "[\u0D91\u0D9A\u0DCA\u0DC3\u0DCA\u0D9A\u0DD2\u0DBA\u0DD4\u0DC3\u0DCA \u0DB8\u0DD3, \u0DC4\u0DC0\u0DD4 \u0DA9\u0DD6 \u0D85\u0DBA\u0DD2 \u0D9C\u0DD9\u0DA7\u0DCA \u0DA7\u0DD4 \u0DAF \u0DC4\u0DDC\u0DC3\u0DCA\u0DB4\u0DD2\u0DA7\u0DBD\u0DCA?]", tip: "Excuse me [\u0D91\u0D9A\u0DCA\u0DC3\u0DCA\u0D9A\u0DD2\u0DBA\u0DD4\u0DC3\u0DCA \u0DB8\u0DD3] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "Go straight ahead and turn right at the junction.", si: "\u0D9A\u0DD9\u0DC5\u0DD2\u0DB1\u0DCA\u0DB8 \u0D9C\u0DDC\u0DC3\u0DCA \u0DC4\u0DB1\u0DCA\u0DAF\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0DAF\u0D9A\u0DD4\u0DAB\u0DA7 \u0DC4\u0DD0\u0DBB\u0DD9\u0DB1\u0DCA\u0DB1.", singlish: "[\u0D9C\u0DDD \u0DC3\u0DCA\u0DA7\u0DCA\u200D\u0DBB\u0DDA\u0DA7\u0DCA \u0D85\u0DC4\u0DD9\u0DA9\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DA7\u0DBB\u0DCA\u0DB1\u0DCA \u0DBB\u0DBA\u0DD2\u0DA7\u0DCA \u0D87\u0DA7\u0DCA \u0DAF \u0DA2\u0DB1\u0DCA\u0D9A\u0DCA\u0DC2\u0DB1\u0DCA]", tip: "Straight [\u0DC3\u0DCA\u0DA7\u0DCA\u200D\u0DBB\u0DDA\u0DA7\u0DCA] \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1." },
          { en: "It is situated directly opposite the post office.", si: "\u0D91\u0DBA \u0DAD\u0DD0\u0DB4\u0DD0\u0DBD\u0DCA \u0D9A\u0DCF\u0DBB\u0DCA\u0DBA\u0DCF\u0DBD\u0DBA\u0DA7 \u0D9A\u0DD9\u0DC5\u0DD2\u0DB1\u0DCA\u0DB8 \u0DC0\u0DD2\u0DBB\u0DD4\u0DAF\u0DCA\u0DB0 \u0DB4\u0DD0\u0DAD\u0DCA\u0DAD\u0DDA \u0DB4\u0DD2\u0DC4\u0DD2\u0DA7\u0DCF \u0D87\u0DAD.", singlish: "[\u0D89\u0DA7\u0DCA \u0D89\u0DC3\u0DCA \u0DC3\u0DD2\u0DA7\u0DD4\u0DC0\u0DD9\u0DBA\u0DD2\u0DA7\u0DA9\u0DCA \u0DA9\u0DD2\u0DBB\u0DD9\u0D9A\u0DCA\u0DA7\u0DCA\u0DBD\u0DD2 \u0D94\u0DB4\u0DC3\u0DD2\u0DA7\u0DCA \u0DAF \u0DB4\u0DDD\u0DC3\u0DCA\u0DA7\u0DCA \u0D94\u0DC6\u0DD2\u0DC3\u0DCA]", tip: "Opposite [\u0D94\u0DB4\u0DC3\u0DD2\u0DA7\u0DCA] \u0DC0\u0DD2\u0DBB\u0DD4\u0DAF\u0DCA\u0DB0 \u0DB4\u0DD0\u0DAD\u0DCA\u0DAD\u0DBA\u0DD2." },
          { en: "Please call an ambulance immediately!", si: "\u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0D9A\u0DBB \u0DC0\u0DC4\u0DCF\u0DB8 \u0D9C\u0DD2\u0DBD\u0DB1\u0DCA \u0DBB\u0DAE\u0DBA\u0D9A\u0DCA \u0D85\u0DB8\u0DAD\u0DB1\u0DCA\u0DB1!", singlish: "[\u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA \u0D9A\u0DDD\u0DBD\u0DCA \u0D87\u0DB1\u0DCA \u0D87\u0DB8\u0DCA\u0DB6\u0DD2\u0DBA\u0DD4\u0DBD\u0DB1\u0DCA\u0DC3\u0DCA \u0D89\u0DB8\u0DD3\u0DA9\u0DD2\u0DBA\u0DA7\u0DCA\u0DBD\u0DD2!]", tip: "Immediately [\u0D89\u0DB8\u0DD3\u0DA9\u0DD2\u0DBA\u0DA7\u0DCA\u0DBD\u0DD2] \u0DC0\u0DC4\u0DCF\u0DB8\u0DBA\u0DD2." },
          { en: "Is there a police station nearby?", si: "\u0DB8\u0DDA \u0D85\u0DC3\u0DBD \u0DB4\u0DDC\u0DBD\u0DD2\u0DC3\u0DCA \u0DC3\u0DCA\u0DAE\u0DCF\u0DB1\u0DBA\u0D9A\u0DCA \u0DAD\u0DD2\u0DB6\u0DDA\u0DAF?", singlish: "[\u0D89\u0DC3\u0DCA \u0DAF\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA \u0D85 \u0DB4\u0DDC\u0DBD\u0DD3\u0DC3\u0DCA \u0DC3\u0DCA\u0DA7\u0DDA\u0DC2\u0DB1\u0DCA \u0DB1\u0DD2\u0DBA\u0DBB\u0DCA\u0DB6\u0DBA\u0DD2?]", tip: "Nearby [\u0DB1\u0DD2\u0DBA\u0DBB\u0DCA\u0DB6\u0DBA\u0DD2] \u0D85\u0DC3\u0DBD\u0DBA\u0DD2." }
        ],
        mistake: { incorrect: "Go front.", correct: "Go straight ahead.", explanationSinhala: '"Go front" \u0DC0\u0DD9\u0DB1\u0DD4\u0DC0\u0DA7 \u0DB1\u0DD2\u0DBA\u0DB8 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD\u0DBA "Go straight ahead" \u0DC0\u0DDA.' },
        adviceSi: '\u0DB4\u0DCF\u0DBB \u0D85\u0DC3\u0DB1 \u0DC0\u0DD2\u0DA7 \u0DC3\u0DD0\u0DB8\u0DC0\u0DD2\u0DA7\u0DB8 "Excuse me" \u0D9A\u0DD2\u0DBA\u0DCF \u0D86\u0DBB\u0DB8\u0DCA\u0DB7 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.'
      }
    ]
  },
  // 19. Festivals, Culture & Traditions (Lessons 901 - 950)
  {
    domain: "Festivals, Culture & Sinhala Traditions",
    domainSinhala: "\u0DC3\u0D82\u0DC3\u0DCA\u0D9A\u0DD8\u0DAD\u0DD2\u0DBA, \u0D8B\u0DAD\u0DCA\u0DC3\u0DC0 \u0DC3\u0DC4 \u0DC3\u0DD2\u0DBB\u0DD2\u0DAD\u0DCA \u0DC0\u0DD2\u0DBB\u0DD2\u0DAD\u0DCA",
    subtopics: [
      {
        titleEn: "Sinhala New Year & Vesak Celebrations",
        titleSi: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0D85\u0DBD\u0DD4\u0DAD\u0DCA \u0D85\u0DC0\u0DD4\u0DBB\u0DD4\u0DAF\u0DCA\u0DAF \u0DC3\u0DC4 \u0DC0\u0DD9\u0DC3\u0D9A\u0DCA \u0D8B\u0DAD\u0DCA\u0DC3\u0DC0\u0DBA",
        ruleTitleSi: "\u0DC3\u0D82\u0DC3\u0DCA\u0D9A\u0DD8\u0DAD\u0DD2\u0D9A \u0DC3\u0DD2\u0DBB\u0DD2\u0DAD\u0DCA \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0DC0\u0DD2\u0DC3\u0DCA\u0DAD\u0DBB \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
        ruleExplainSi: '"We boil milk at the auspicious time", "We light lanterns" \u0DB7\u0DCF\u0DC0\u0DD2\u0DAD \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "Wishing you a happy and prosperous Sinhala New Year!", si: "\u0D94\u0DB6\u0DA7 \u0DC3\u0DD4\u0DB6 \u0DC3\u0DC4 \u0DC3\u0DDE\u0DB7\u0DCF\u0D9C\u0DCA\u200D\u0DBA\u0DB8\u0DAD\u0DCA \u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0D85\u0DBD\u0DD4\u0DAD\u0DCA \u0D85\u0DC0\u0DD4\u0DBB\u0DD4\u0DAF\u0DCA\u0DAF\u0D9A\u0DCA \u0DC0\u0DDA\u0DC0\u0DCF!", singlish: "[\u0DC0\u0DD2\u0DC2\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA \u0DBA\u0DD6 \u0D85 \u0DC4\u0DD0\u0DB4\u0DD2 \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DB4\u0DCA\u200D\u0DBB\u0DDC\u0DC3\u0DCA\u0DB4\u0DBB\u0DC3\u0DCA \u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0DB1\u0DD2\u0DC0\u0DCA \u0D89\u0DBA\u0DBB\u0DCA!]", tip: "Prosperous [\u0DB4\u0DCA\u200D\u0DBB\u0DDC\u0DC3\u0DCA\u0DB4\u0DBB\u0DC3\u0DCA] \u0DC3\u0DDE\u0DB7\u0DCF\u0D9C\u0DCA\u200D\u0DBA\u0DB8\u0DAD\u0DCA\u0DBA." },
          { en: "We boil fresh milk at the auspicious time.", si: "\u0D85\u0DB4\u0DD2 \u0DC3\u0DD4\u0DB6 \u0DB1\u0DD0\u0D9A\u0DAD\u0DD2\u0DB1\u0DCA \u0DB1\u0DD0\u0DC0\u0DD4\u0DB8\u0DCA \u0D9A\u0DD2\u0DBB\u0DD2 \u0D8B\u0DAD\u0DD4\u0DBB\u0DC0\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DC0\u0DD3 \u0DB6\u0DDC\u0DBA\u0DD2\u0DBD\u0DCA \u0DC6\u0DCA\u200D\u0DBB\u0DD9\u0DC2\u0DCA \u0DB8\u0DD2\u0DBD\u0DCA\u0D9A\u0DCA \u0D87\u0DA7\u0DCA \u0DAF\u0DD2 \u0D95\u0DC3\u0DCA\u0DB4\u0DD2\u0DC2\u0DC3\u0DCA \u0DA7\u0DBA\u0DD2\u0DB8\u0DCA]", tip: "Auspicious [\u0D95\u0DC3\u0DCA\u0DB4\u0DD2\u0DC2\u0DC3\u0DCA] \u0DC3\u0DD4\u0DB6 \u0DB1\u0DD0\u0D9A\u0DAD\u0DBA\u0DD2." },
          { en: "Children make colorful Vesak lanterns joyfully.", si: "\u0DC5\u0DB8\u0DBA\u0DD2\u0DB1\u0DCA \u0DC3\u0DAD\u0DD4\u0DA7\u0DD2\u0DB1\u0DCA \u0DC0\u0DBB\u0DCA\u0DAB\u0DC0\u0DAD\u0DCA \u0DC0\u0DD9\u0DC3\u0D9A\u0DCA \u0D9A\u0DD6\u0DA9\u0DD4 \u0DC3\u0DCF\u0DAF\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DA0\u0DD2\u0DBD\u0DCA\u0DA9\u0DCA\u200D\u0DBB\u0DB1\u0DCA \u0DB8\u0DDA\u0D9A\u0DCA \u0D9A\u0DBD\u0DBB\u0DCA\u0DC6\u0DD4\u0DBD\u0DCA \u0DC0\u0DD9\u0DC3\u0D9A\u0DCA \u0DBD\u0DD0\u0DB1\u0DCA\u0DA7\u0DBB\u0DCA\u0DB1\u0DCA\u0DC3\u0DCA \u0DA2\u0DDD\u0DBA\u0DD2\u0DC6\u0DD4\u0DBD\u0DD2]", tip: "Lanterns [\u0DBD\u0DD0\u0DB1\u0DCA\u0DA7\u0DBB\u0DCA\u0DB1\u0DCA\u0DC3\u0DCA] \u0DB4\u0DC4\u0DB1\u0DCA \u0D9A\u0DD6\u0DA9\u0DD4\u0DBA\u0DD2." },
          { en: "People share sweetmeats with their neighbors.", si: "\u0DB8\u0DD2\u0DB1\u0DD2\u0DC3\u0DD4\u0DB1\u0DCA \u0D85\u0DC3\u0DBD\u0DCA\u0DC0\u0DD0\u0DC3\u0DD2\u0DBA\u0DB1\u0DCA \u0DC3\u0DB8\u0D9F \u0D9A\u0DD0\u0DC0\u0DD2\u0DBD\u0DD2 \u0DB4\u0DD9\u0DC0\u0DD2\u0DBD\u0DD2 \u0DB6\u0DD9\u0DAF\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1\u0DC0\u0DCF.", singlish: "[\u0DB4\u0DD3\u0DB4\u0DBD\u0DCA \u0DC2\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA \u0DC3\u0DCA\u0DC0\u0DD3\u0DA7\u0DCA\u0DB8\u0DD3\u0DA7\u0DCA\u0DC3\u0DCA \u0DC0\u0DD2\u0DAD\u0DCA \u0DAF\u0DD9\u0DBA\u0DCF\u0DBB\u0DCA \u0DB1\u0DDA\u0DB6\u0DBB\u0DCA\u0DC3\u0DCA]", tip: "Sweetmeats [\u0DC3\u0DCA\u0DC0\u0DD3\u0DA7\u0DCA\u0DB8\u0DD3\u0DA7\u0DCA\u0DC3\u0DCA] \u0D9A\u0DD0\u0DC0\u0DD2\u0DBD\u0DD2\u0DBA\u0DD2." },
          { en: "Our rich heritage fosters unity and kindness.", si: "\u0D85\u0DB4\u0DDA \u0DB4\u0DDC\u0DC4\u0DDC\u0DC3\u0DAD\u0DCA \u0D8B\u0DBB\u0DD4\u0DB8\u0DBA \u0DC3\u0DB8\u0D9C\u0DD2\u0DBA \u0DC3\u0DC4 \u0D9A\u0DBB\u0DD4\u0DAB\u0DCF\u0DC0 \u0DC0\u0DA9\u0DC0\u0DBA\u0DD2.", singlish: "[\u0D85\u0DC0\u0DBB\u0DCA \u0DBB\u0DD2\u0DA0\u0DCA \u0DC4\u0DD9\u0DBB\u0DD2\u0DA7\u0DDA\u0DA2\u0DCA \u0DC6\u0DDC\u0DC3\u0DCA\u0DA7\u0DBB\u0DCA\u0DC3\u0DCA \u0DBA\u0DD4\u0DB1\u0DD2\u0DA7\u0DD2 \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0D9A\u0DBA\u0DD2\u0DB1\u0DCA\u0DA9\u0DCA\u0DB1\u0DC3\u0DCA]", tip: "Heritage [\u0DC4\u0DD9\u0DBB\u0DD2\u0DA7\u0DDA\u0DA2\u0DCA] \u0D8B\u0DBB\u0DD4\u0DB8\u0DBA\u0DBA\u0DD2." }
        ],
        mistake: { incorrect: "We are boiling milk on nekatha.", correct: "We boil milk at the auspicious time.", explanationSinhala: '"Nekatha" \u0DC3\u0DB3\u0DC4\u0DCF \u0DB1\u0DD2\u0DBA\u0DB8 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DBA\u0DD9\u0DAF\u0DD4\u0DB8 "auspicious time" \u0DC0\u0DDA.' },
        adviceSi: "\u0D85\u0DB4\u0DDA \u0DBD\u0DC3\u0DCA\u0DC3\u0DB1 \u0DC3\u0D82\u0DC3\u0DCA\u0D9A\u0DD8\u0DAD\u0DD2\u0DBA \u0DC0\u0DD2\u0DAF\u0DDA\u0DC1\u0DD2\u0D9A\u0DBA\u0DB1\u0DCA\u0DA7 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0DC0\u0DD9\u0DB1\u0DCA\u0DB1!"
      }
    ]
  },
  // 20. Public Speaking & Fluency Mastery (Lessons 951 - 1000)
  {
    domain: "Journalistic Fluency & Public Speaking",
    domainSinhala: "\u0DB4\u0DCA\u200D\u0DBB\u0DC3\u0DD2\u0DAF\u0DCA\u0DB0 \u0D9A\u0DAE\u0DB1\u0DBA \u0DC3\u0DC4 \u0D9A\u0DAE\u0DD2\u0D9A\u0DAD\u0DCA\u0DC0\u0DBA",
    subtopics: [
      {
        titleEn: "Delivering an Inspiring Speech & Presentation",
        titleSi: "\u0DB4\u0DCA\u200D\u0DBB\u0DC3\u0DD2\u0DAF\u0DCA\u0DB0 \u0D9A\u0DAD\u0DCF\u0DC0\u0D9A\u0DCA \u0DB4\u0DD0\u0DC0\u0DD0\u0DAD\u0DCA\u0DC0\u0DD3\u0DB8 \u0DC3\u0DC4 \u0D89\u0DAF\u0DD2\u0DBB\u0DD2\u0DB4\u0DAD\u0DCA \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8",
        ruleTitleSi: "\u0DAF\u0DDA\u0DC1\u0DB1\u0DBA\u0D9A \u0DC4\u0DD0\u0DB3\u0DD2\u0DB1\u0DCA\u0DC0\u0DD3\u0DB8 \u0DC3\u0DC4 \u0DB4\u0DCA\u200D\u0DBB\u0DDA\u0D9A\u0DCA\u0DC2\u0D9A \u0D86\u0DB8\u0DB1\u0DCA\u0DAD\u0DCA\u200D\u0DBB\u0DAB\u0DBA",
        ruleExplainSi: '"Distinguished guests, ladies and gentlemen...", "It gives me immense pleasure..." \u0DBA\u0DDC\u0DAF\u0DB1\u0DCA\u0DB1.',
        phrases: [
          { en: "Honorable guests, ladies and gentlemen, good morning.", si: "\u0D9C\u0DDE\u0DBB\u0DC0\u0DB1\u0DD3\u0DBA \u0D85\u0DB8\u0DD4\u0DAD\u0DCA\u0DAD\u0DB1\u0DD2, \u0DB1\u0DDD\u0DB1\u0DCF\u0DC0\u0DBB\u0DD4\u0DB1\u0DD2, \u0DB8\u0DC4\u0DAD\u0DCA\u0DC0\u0DBB\u0DD4\u0DB1\u0DD2, \u0DC3\u0DD4\u0DB6 \u0D8B\u0DAF\u0DD1\u0DC3\u0DB1\u0D9A\u0DCA.", singlish: "[\u0D94\u0DB1\u0DBB\u0DB6\u0DBD\u0DCA \u0D9C\u0DD9\u0DC3\u0DCA\u0DA7\u0DCA\u0DC3\u0DCA, \u0DBD\u0DDA\u0DA9\u0DD3\u0DC3\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DA2\u0DD9\u0DB1\u0DCA\u0DA7\u0DCA\u0DBD\u0DCA\u0DB8\u0DD9\u0DB1\u0DCA, \u0D9C\u0DD4\u0DA9\u0DCA \u0DB8\u0DDD\u0DB1\u0DD2\u0DB1\u0DCA\u0D9C\u0DCA]", tip: 'Honorable \u0DC4\u0DD2 "H" \u0DB1\u0DD2\u0DC4\u0DAC\u0DBA\u0DD2 (\u0D94\u0DB1\u0DBB\u0DB6\u0DBD\u0DCA).' },
          { en: "It gives me immense pleasure to address you all.", si: "\u0D94\u0DB6 \u0DC3\u0DD0\u0DB8 \u0D87\u0DB8\u0DAD\u0DD3\u0DB8\u0DA7 \u0DBD\u0DD0\u0DB6\u0DD3\u0DB8 \u0DB8\u0DA7 \u0DB8\u0DC4\u0DAD\u0DCA \u0DC3\u0DAD\u0DD4\u0DA7\u0D9A\u0DCA \u0D9C\u0DD9\u0DB1 \u0DAF\u0DD9\u0DBA\u0DD2.", singlish: "[\u0D89\u0DA7\u0DCA \u0D9C\u0DD2\u0DC0\u0DCA\u0DC3\u0DCA \u0DB8\u0DD3 \u0D89\u0DB8\u0DD9\u0DB1\u0DCA\u0DC3\u0DCA \u0DB4\u0DCA\u0DBD\u0DD9\u0DC2\u0DBB\u0DCA \u0DA7\u0DD4 \u0D87\u0DA9\u0DCA\u200D\u0DBB\u0DC3\u0DCA \u0DBA\u0DD6 \u0D95\u0DBD\u0DCA]", tip: "Immense [\u0D89\u0DB8\u0DD9\u0DB1\u0DCA\u0DC3\u0DCA] \u0D85\u0DAD\u0DD2\u0DB8\u0DC4\u0DAD\u0DCA\u0DBA." },
          { en: "Determination and hard work always lead to success.", si: "\u0D85\u0DAF\u0DD2\u0DA7\u0DB1 \u0DC3\u0DC4 \u0DB8\u0DC4\u0DB1\u0DCA\u0DC3\u0DD2\u0DBA \u0DC3\u0DD0\u0DB8\u0DC0\u0DD2\u0DA7\u0DB8 \u0DA2\u0DBA\u0D9C\u0DCA\u200D\u0DBB\u0DC4\u0DAB\u0DBA \u0D9A\u0DBB\u0DCF \u0D9C\u0DD9\u0DB1 \u0DBA\u0DBA\u0DD2.", singlish: "[\u0DA9\u0DD2\u0DA7\u0DBB\u0DCA\u0DB8\u0DD2\u0DB1\u0DDA\u0DC2\u0DB1\u0DCA \u0D87\u0DB1\u0DCA\u0DA9\u0DCA \u0DC4\u0DCF\u0DA9\u0DCA \u0DC0\u0DBB\u0DCA\u0D9A\u0DCA \u0D95\u0DBD\u0DCA\u0DC0\u0DDA\u0DC3\u0DCA \u0DBD\u0DD3\u0DA9\u0DCA \u0DA7\u0DD4 \u0DC3\u0D9A\u0DCA\u0DC3\u0DC3\u0DCA]", tip: "Determination [\u0DA9\u0DD2\u0DA7\u0DBB\u0DCA\u0DB8\u0DD2\u0DB1\u0DDA\u0DC2\u0DB1\u0DCA] \u0D85\u0DAF\u0DD2\u0DA7\u0DB1\u0DBA\u0DD2." },
          { en: "Thank you very much for your kind attention.", si: "\u0D94\u0DB6\u0D9C\u0DDA \u0D9A\u0DCF\u0DBB\u0DD4\u0DAB\u0DD2\u0D9A \u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA\u0DA7 \u0DB6\u0DDC\u0DC4\u0DDC\u0DB8 \u0DC3\u0DCA\u0DAD\u0DD6\u0DAD\u0DD2\u0DBA\u0DD2.", singlish: "[\u0DAD\u0DD1\u0DB1\u0DCA\u0D9A\u0DCA \u0DBA\u0DD6 \u0DC0\u0DD9\u0DBB\u0DD2 \u0DB8\u0DA0\u0DCA \u0DC6\u0DDD \u0DBA\u0DDD\u0DBB\u0DCA \u0D9A\u0DBA\u0DD2\u0DB1\u0DCA\u0DA9\u0DCA \u0D87\u0DA7\u0DD9\u0DB1\u0DCA\u0DC2\u0DB1\u0DCA]", tip: "Attention [\u0D87\u0DA7\u0DD9\u0DB1\u0DCA\u0DC2\u0DB1\u0DCA] \u0D85\u0DC0\u0DB0\u0DCF\u0DB1\u0DBA\u0DBA\u0DD2." },
          { en: "I hope these ideas will help our community.", si: "\u0DB8\u0DD9\u0DB8 \u0D85\u0DAF\u0DC4\u0DC3\u0DCA \u0D85\u0DB4\u0DDA \u0DB4\u0DCA\u200D\u0DBB\u0DA2\u0DCF\u0DC0\u0DA7 \u0D8B\u0DB4\u0D9A\u0DCF\u0DBB\u0DD3 \u0DC0\u0DB1\u0DD4 \u0D87\u0DAD\u0DD0\u0DBA\u0DD2 \u0DB8\u0DB8 \u0DB6\u0DBD\u0DCF\u0DB4\u0DDC\u0DBB\u0DDC\u0DAD\u0DCA\u0DAD\u0DD4 \u0DC0\u0DD9\u0DB1\u0DC0\u0DCF.", singlish: "[\u0D85\u0DBA\u0DD2 \u0DC4\u0DDD\u0DB4\u0DCA \u0DAF\u0DD3\u0DC3\u0DCA \u0D85\u0DBA\u0DD2\u0DA9\u0DD2\u0DBA\u0DCF\u0DC3\u0DCA \u0DC0\u0DD2\u0DBD\u0DCA \u0DC4\u0DD9\u0DBD\u0DCA\u0DB4\u0DCA \u0D85\u0DC0\u0DBB\u0DCA \u0D9A\u0DB8\u0DD2\u0DBA\u0DD4\u0DB1\u0DD2\u0DA7\u0DD2]", tip: "Community [\u0D9A\u0DB8\u0DD2\u0DBA\u0DD4\u0DB1\u0DD2\u0DA7\u0DD2] \u0DBA\u0DB1\u0DD4 \u0DB4\u0DCA\u200D\u0DBB\u0DA2\u0DCF\u0DC0\u0DBA\u0DD2." }
        ],
        mistake: { incorrect: "Respected sirs and teachers.", correct: "Distinguished guests and respected teachers.", explanationSinhala: '\u0DB4\u0DCA\u200D\u0DBB\u0DC3\u0DD2\u0DAF\u0DCA\u0DB0 \u0D9A\u0DAD\u0DCF\u0DC0\u0D9A\u0DAF\u0DD3 "Distinguished guests" \u0DC0\u0DA9\u0DCF\u0DAD\u0DCA \u0DB1\u0DD2\u0DBD \u0DC3\u0DC4 \u0D8B\u0DC3\u0DC3\u0DCA \u0DBA\u0DD9\u0DAF\u0DD4\u0DB8\u0D9A\u0DD2.' },
        adviceSi: "\u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD, \u0D9A\u0DAD\u0DCF\u0DC0\u0DDA \u0D85\u0DAF\u0DC4\u0DC3\u0DCA \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0DC3\u0DC4 \u0DB4\u0DD2\u0DC5\u0DD2\u0DC0\u0DD9\u0DC5\u0DA7 \u0D89\u0DAF\u0DD2\u0DBB\u0DD2\u0DB4\u0DAD\u0DCA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1. \u0D85\u0DC0\u0DC3\u0DCF\u0DB1\u0DBA\u0DDA \u0DC3\u0DC0\u0DB1\u0DCA \u0DAF\u0DD4\u0DB1\u0DCA \u0DC3\u0DD0\u0DB8\u0DA7 \u0DC3\u0DCA\u0DAD\u0DD6\u0DAD\u0DD2 \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1."
      }
    ]
  }
];
function generateAll1000Lessons() {
  const result = [];
  let lessonCounter = 1;
  for (let d = 0; d < DOMAINS_DATA.length; d++) {
    const domainObj = DOMAINS_DATA[d];
    const subCount = 50;
    for (let i = 1; i <= subCount; i++) {
      const subBp = domainObj.subtopics[(i - 1) % domainObj.subtopics.length];
      const level = lessonCounter <= 250 ? "Beginner 1" : lessonCounter <= 600 ? "Beginner 2" : "Intermediate";
      const lessonNum = lessonCounter;
      const lessonTitleEn = `${domainObj.domain} - Step ${i}: ${subBp.titleEn}`;
      const lessonTitleSi = `${domainObj.domainSinhala} - \u0DB4\u0DD2\u0DBA\u0DC0\u0DBB ${i}: ${subBp.titleSi}`;
      const lessonPhrases = subBp.phrases.map((p, pIdx) => ({
        id: `p-${lessonNum}-${pIdx + 1}`,
        english: p.en,
        sinhala: p.si,
        singlishPronunciation: p.singlish,
        teacherAudioTip: p.tip,
        notesSinhala: `\u0DB4\u0DCF\u0DA9\u0DB8 ${lessonNum} \u0DC4\u0DD2 \u0DB4\u0DCA\u200D\u0DBB\u0DB0\u0DCF\u0DB1 \u0D9A\u0DAE\u0DB1 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA\u0DBA\u0D9A\u0DD2. \u0DA9\u0DDA\u0DC3\u0DD2 \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DD2\u0DBA \u0DC3\u0DB8\u0D9F \u0DC4\u0DAC \u0DB1\u0D9C\u0DCF \u0D9A\u0DD2\u0DBA\u0DC0\u0DB1\u0DCA\u0DB1.`
      }));
      result.push({
        id: `lesson-${lessonNum}`,
        number: lessonNum,
        titleEnglish: lessonTitleEn,
        titleSinhala: lessonTitleSi,
        level,
        summarySinhala: `${domainObj.domainSinhala} \u0DBA\u0DA7\u0DAD\u0DDA \u0D91\u0DB1 \u0D85\u0D82\u0D9A ${lessonNum} \u0DC0\u0DB1 Spoken English \u0DB4\u0DCF\u0DA9\u0DB8. \u0DA9\u0DDA\u0DC3\u0DD2 \u0D9C\u0DD4\u0DBB\u0DD4\u0DAD\u0DD4\u0DB8\u0DD2\u0DBA (Teacher Daisy) \u0DC3\u0DB8\u0D9F \u0DC4\u0DAC \u0DB1\u0D9C\u0DCF \u0DB4\u0DD4\u0DC4\u0DD4\u0DAB\u0DD4 \u0DC0\u0DB1\u0DCA\u0DB1.`,
        grammarRule: {
          ruleTitleSinhala: subBp.ruleTitleSi,
          explanationSinhala: subBp.ruleExplainSi,
          sinhalaVsEnglishPattern: {
            sinhalaOrder: "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD: \u0D9A\u0DBB\u0DCA\u0DAD\u0DD8 + \u0D9A\u0DBB\u0DCA\u0DB8\u0DBA + \u0D9A\u0DCA\u200D\u0DBB\u0DD2\u0DBA\u0DCF\u0DC0 (S - O - V)",
            englishOrder: "\u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2: Subject + Verb + Object (S - V - O)",
            exampleSinhala: "\u0DB8\u0DB8 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DC0\u0DCF.",
            exampleEnglish: "I speak English."
          }
        },
        phrases: lessonPhrases,
        commonMistake: subBp.mistake,
        teacherVoiceAdviceSinhala: `${subBp.adviceSi} \u0DB8\u0DAD\u0D9A \u0DAD\u0DB6\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD0\u0DA7\u0DD2\u0DBA\u0DDD: \u0DB4\u0DCF\u0DA9\u0DB8 ${lessonNum} \u0DC3\u0DCF\u0DBB\u0DCA\u0DAE\u0D9A\u0DC0 \u0DB1\u0DD2\u0DB8 \u0D9A\u0DC5 \u0DB4\u0DC3\u0DD4 \u0D8A\u0DC5\u0D9F \u0DB4\u0DCF\u0DA9\u0DB8\u0DA7 \u0DBA\u0DB1\u0DCA\u0DB1!`
      });
      lessonCounter++;
    }
  }
  return result;
}
var LESSONS = generateAll1000Lessons();

// src/data/lessonQuizzes.ts
var LEGACY_LESSON_QUIZ_VERSION = 1;
var LESSON_QUIZ_VERSION = 2;
var LESSON_QUIZ_PASS_PERCENT = 80;
function shuffle(values, seed) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    const j = seed % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function hashSeed(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0 || 1;
}
var normalize = (text) => text.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
var cache = /* @__PURE__ */ new Map();
function basePhraseOrder(lessonNumber) {
  const offset = (lessonNumber - 1) % 5;
  return [0, 1, 2, 3, 4].map((index) => (offset + index) % 5);
}
function variantPhraseOrder(lessonId, lessonNumber, seed) {
  const base = basePhraseOrder(lessonNumber);
  let order = shuffle([0, 1, 2, 3, 4], hashSeed(`${lessonId}:${seed}:phrases`));
  if (order.every((value, index) => value === base[index])) order = [...order.slice(1), order[0]];
  return order;
}
function buildQuiz(lessonId, version, seed) {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  if (!lesson) return null;
  const order = version === LESSON_QUIZ_VERSION && seed ? variantPhraseOrder(lesson.id, lesson.number, seed) : basePhraseOrder(lesson.number);
  const phrase = (index) => lesson.phrases[order[index % order.length]];
  const questions = [];
  const shuffleFor = (values, salt) => shuffle(values, hashSeed(`${lesson.id}:${seed || "legacy"}:${salt}`));
  const choice = (skill, prompt, answer, alternatives, explanation, sourcePhraseId) => {
    const index = questions.length;
    const distinct = [...new Map(alternatives.map((value) => [normalize(value), value])).values()].filter((value) => normalize(value) !== normalize(answer));
    const options = version === LEGACY_LESSON_QUIZ_VERSION ? shuffle([answer, ...distinct.slice(0, 3)], lesson.number * 37 + index * 13) : shuffleFor([answer, ...distinct.slice(0, 3)], `options-${index}`);
    questions.push({
      id: `${lessonId}-q${index + 1}`,
      type: "choice",
      skill,
      prompt,
      options,
      correctIndex: options.indexOf(answer),
      explanation,
      sourcePhraseId
    });
  };
  const p0 = phrase(0), p1 = phrase(1), p2 = phrase(2), p3 = phrase(3);
  choice(
    "Meaning \u2192 English",
    `\u0DB8\u0DD9\u0DB8 \u0D85\u0DAF\u0DC4\u0DC3 \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2\u0DBA\u0DD9\u0DB1\u0DCA \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1\u0DDA \u0D9A\u0DD9\u0DC3\u0DDA\u0DAF?
${p0.sinhala}`,
    p0.english,
    lesson.phrases.filter((p) => p.id !== p0.id).map((p) => p.english),
    `${p0.english}
${p0.sinhala}
\u0DB8\u0DD9\u0DB8 \u0D85\u0DBB\u0DCA\u0DAE\u0DBA \u0DC3\u0DB3\u0DC4\u0DCF \u0DB4\u0DCF\u0DA9\u0DB8\u0DDA \u0DBA\u0DDC\u0DAF\u0DCF \u0D87\u0DAD\u0DD2 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA\u0DBA \u0DB8\u0DD9\u0DBA\u0DBA\u0DD2.`,
    p0.id
  );
  choice(
    "English \u2192 meaning",
    `\u0DB8\u0DD9\u0DB8 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA\u0DBA\u0DDA \u0D85\u0DBB\u0DCA\u0DAE\u0DBA \u0DAD\u0DDD\u0DBB\u0DB1\u0DCA\u0DB1.
${p1.english}`,
    p1.sinhala,
    lesson.phrases.filter((p) => p.id !== p1.id).map((p) => p.sinhala),
    `${p1.english}
${p1.sinhala}`,
    p1.id
  );
  const correctWords = p2.english.replace(/[.,!?;:]/g, "").trim().split(/\s+/);
  let tokens = version === LEGACY_LESSON_QUIZ_VERSION ? shuffle(correctWords, lesson.number * 113) : shuffle(correctWords, hashSeed(`${lesson.id}:${seed}:tokens`));
  if (tokens.join(" ") === correctWords.join(" ")) tokens = [...tokens.slice(1), tokens[0]];
  questions.push({
    id: `${lessonId}-q3`,
    type: "reorder",
    skill: "Sentence building",
    prompt: `\u0DB4\u0DCF\u0DA9\u0DB8\u0DDA \u0D89\u0D9C\u0DD9\u0DB1\u0D9C\u0DAD\u0DCA \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA\u0DBA \u0DC0\u0DA0\u0DB1 \u0D85\u0DB1\u0DD4\u0DB4\u0DD2\u0DC5\u0DD2\u0DC0\u0DD9\u0DC5\u0DA7 \u0DAD\u0DB6\u0DCF \u0DC3\u0DCF\u0DAF\u0DB1\u0DCA\u0DB1.
${p2.sinhala}`,
    tokens,
    correctWords,
    sourcePhraseId: p2.id,
    explanation: `${p2.english}
${p2.sinhala}
Rebuild the model sentence for this exercise. Other word orders may be valid in different contexts.`
  });
  const sentenceWords = p3.english.split(/\s+/);
  const candidates = sentenceWords.map((word, index) => ({ word: word.replace(/[^a-zA-Z']/g, ""), index })).filter((item) => item.word.length >= 4 && !/^(Teacher|Daisy|Nimal|Colombo|Galle|Congratulations)$/i.test(item.word));
  const gapSeed = version === LESSON_QUIZ_VERSION && seed ? hashSeed(`${seed}:gap`) : lesson.number - 1;
  const gap = candidates[gapSeed % candidates.length] || { word: sentenceWords[1].replace(/[^a-zA-Z']/g, ""), index: 1 };
  const masked = sentenceWords.map((word, i) => i === gap.index ? word.replace(gap.word, "_____") : word).join(" ");
  const distractors = lesson.phrases.flatMap((p) => p.english.split(/\s+/)).map((word) => word.replace(/[^a-zA-Z']/g, "")).filter((word) => word.length >= 3 && word.toLowerCase() !== gap.word.toLowerCase());
  choice(
    "Vocabulary in context",
    `\u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0D85\u0DBB\u0DCA\u0DAE\u0DBA\u0DA7 \u0D9C\u0DD0\u0DC5\u0DB4\u0DD9\u0DB1 \u0DBD\u0DD9\u0DC3 \u0DB4\u0DCF\u0DA9\u0DB8\u0DDA \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA\u0DBA \u0DC3\u0DB8\u0DCA\u0DB4\u0DD6\u0DBB\u0DCA\u0DAB \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1.
${p3.sinhala}
${masked}`,
    gap.word,
    version === LEGACY_LESSON_QUIZ_VERSION ? shuffle([...new Set(distractors)], lesson.number * 19) : shuffleFor([...new Set(distractors)], "gap-options"),
    `Missing word: ${gap.word}
${p3.english}
${p3.sinhala}`,
    p3.id
  );
  const correction = lesson.commonMistake.correct;
  choice(
    "Usage & correction",
    `\u0DB4\u0DCF\u0DA9\u0DB8\u0DDA \u0DB1\u0DD2\u0DBB\u0DCA\u0DAF\u0DDA\u0DC1\u0DD2\u0DAD \u0DC0\u0DA9\u0DCF \u0DC3\u0DD4\u0DAF\u0DD4\u0DC3\u0DD4 \u0DBA\u0DD9\u0DAF\u0DD4\u0DB8 \u0DAD\u0DDD\u0DBB\u0DB1\u0DCA\u0DB1.
Choose the version recommended in this lesson (consider its context).`,
    correction,
    [lesson.commonMistake.incorrect],
    `${correction}
${lesson.commonMistake.explanationSinhala}`
  );
  return { lessonId, title: lesson.titleEnglish, version, ...version === LESSON_QUIZ_VERSION ? { seed } : {}, questions, speakingPhrase: phrase(4) };
}
function getLessonQuiz(lessonId) {
  const cached = cache.get(lessonId);
  if (cached) return cached;
  const quiz = buildQuiz(lessonId, LEGACY_LESSON_QUIZ_VERSION);
  if (quiz) cache.set(lessonId, quiz);
  return quiz;
}
function getLessonQuizVariant(lessonId, seed) {
  return buildQuiz(lessonId, LESSON_QUIZ_VERSION, seed);
}
function getQuizForAttempt(attempt) {
  return attempt.version === LEGACY_LESSON_QUIZ_VERSION ? getLessonQuiz(attempt.lessonId) : attempt.version === LESSON_QUIZ_VERSION && attempt.seed ? getLessonQuizVariant(attempt.lessonId, attempt.seed) : null;
}
function answerIsCorrect(question, answer) {
  if (question.type === "choice") return typeof answer === "number" && answer === question.correctIndex;
  if (!Array.isArray(answer) || answer.length !== question.tokens.length || new Set(answer).size !== answer.length || answer.some((index) => !Number.isInteger(index) || index < 0 || index >= question.tokens.length)) return false;
  return normalize(answer.map((index) => question.tokens[index]).join(" ")) === normalize(question.correctWords.join(" "));
}
function gradeLessonQuiz(quiz, answers) {
  const correct = quiz.questions.map((question) => answerIsCorrect(question, answers[question.id]));
  const correctCount = correct.filter(Boolean).length;
  const score = Math.round(correctCount / quiz.questions.length * 100);
  return { score, correctCount, total: quiz.questions.length, passed: score >= LESSON_QUIZ_PASS_PERCENT, correct };
}
function validQuizAttempt(value) {
  if (!value || typeof value !== "object") return false;
  const data = value;
  if (Object.keys(data).some((key) => !["attemptId", "lessonId", "version", "seed", "answers"].includes(key)) || typeof data.attemptId !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(data.attemptId) || typeof data.lessonId !== "string" || !data.answers || typeof data.answers !== "object" || Array.isArray(data.answers)) return false;
  const legacy = data.version === LEGACY_LESSON_QUIZ_VERSION && data.seed === void 0;
  const variant = data.version === LESSON_QUIZ_VERSION && typeof data.seed === "string" && /^[a-zA-Z0-9-]{16,80}$/.test(data.seed) && data.seed === data.attemptId;
  if (!legacy && !variant) return false;
  const quiz = getQuizForAttempt(data);
  if (!quiz || Object.keys(data.answers).length !== quiz.questions.length) return false;
  return quiz.questions.every((question) => {
    const answer = data.answers[question.id];
    return question.type === "choice" ? Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) < question.options.length : Array.isArray(answer) && answer.length === question.tokens.length && new Set(answer).size === answer.length && answer.every((i) => Number.isInteger(i) && i >= 0 && i < question.tokens.length);
  });
}

// server/database.ts
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
    async recordQuiz(user, attempt) {
      const quiz = getQuizForAttempt(attempt);
      const grade = gradeLessonQuiz(quiz, attempt.answers);
      const answers = JSON.stringify(quiz.questions.map((question) => attempt.answers[question.id]));
      const results = await client.batch([profile(user), {
        sql: `INSERT INTO sg_quiz_attempts(firebase_uid, attempt_id, lesson_id, quiz_version, answers_json, score, correct_count, total, passed)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        args: [user.id, attempt.attemptId, attempt.lessonId, attempt.version, answers, grade.score, grade.correctCount, grade.total, grade.passed ? 1 : 0]
      }, {
        sql: `INSERT INTO sg_lesson_progress(firebase_uid, lesson_id)
          SELECT firebase_uid, lesson_id FROM sg_quiz_attempts
          WHERE firebase_uid=? AND attempt_id=? AND lesson_id=? AND quiz_version=? AND answers_json=? AND passed=1
          ON CONFLICT DO NOTHING`,
        args: [user.id, attempt.attemptId, attempt.lessonId, attempt.version, answers]
      }, {
        sql: "SELECT lesson_id, quiz_version, answers_json FROM sg_quiz_attempts WHERE firebase_uid=? AND attempt_id=?",
        args: [user.id, attempt.attemptId]
      }, select(user.id)], "write");
      const saved = results[3].rows[0];
      const conflict = saved.lesson_id !== attempt.lessonId || Number(saved.quiz_version) !== attempt.version || saved.answers_json !== answers;
      return { conflict, grade, completedLessonIds: results[4].rows.map((row) => String(row.lesson_id)) };
    },
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
  router.post("/quiz-attempts", async (req, res) => {
    if (!validQuizAttempt(req.body)) {
      res.status(400).json({ error: "Submit a complete, valid attempt for the current lesson quiz version." });
      return;
    }
    try {
      const user = res.locals.user;
      const result = await store.recordQuiz(user, req.body);
      if (result.conflict) {
        res.status(409).json({ error: "This attempt ID was already used for different answers." });
        return;
      }
      res.json({ userId: user.id, attemptId: req.body.attemptId, grade: result.grade, completedLessonIds: result.completedLessonIds });
    } catch {
      res.status(503).json({ error: "Quiz saving is unavailable. Keep the pending result on this device and retry." });
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
var AI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
var GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
var APP_ORIGIN = (process.env.AUTH_ORIGIN || process.env.GOOGLE_AUTH_ORIGIN || process.env.APP_URL || "").trim().replace(/\/$/, "");
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
  origin: APP_ORIGIN,
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
  if (!isDev && APP_ORIGIN.startsWith("https:")) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
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
    authConfigured: auth.configured,
    databaseConfigured: Boolean(database),
    environment: isDev ? "development" : "production"
  });
});
app.use("/api", auth.attachUser);
var database = databaseFromEnv();
app.use("/api/progress", createProgressRouter(
  database ? createProgressStore(database) : null,
  APP_ORIGIN
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
  if (!isDev) {
    const missing = [];
    if (!APP_ORIGIN || !APP_ORIGIN.startsWith("https://")) missing.push("AUTH_ORIGIN (HTTPS production origin)");
    if (!auth.configured) missing.push("Firebase settings and AUTH_SESSION_SECRET");
    if (!hasGeminiApiKey) missing.push("GEMINI_API_KEY");
    if (!database) missing.push("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
    if (missing.length) throw new Error(`Production configuration is incomplete: ${missing.join(", ")}`);
    try {
      await database.execute("SELECT 1 AS startup_check");
    } catch {
      throw new Error("Production database check failed. Verify Turso connectivity and credentials.");
    }
  }
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
