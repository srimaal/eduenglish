// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
var isDev = process.env.NODE_ENV !== "production";
app.use(express.json());
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var SIR_SYSTEM_INSTRUCTION = `You are "Sir Sri Maal" (\u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DB8\u0DCF\u0DBD\u0DCA \u0DC3\u0DBB\u0DCA), an English mentor and journalist from Sri Lanka who teaches spoken English from Sinhala with practical communication clarity, journalistic articulacy, and encouraging warmth.
Your teaching method:
1. Always communicate in a bilingual, friendly Sri Lankan teacher tone, using authentic Sinhala (\u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0D85\u0D9A\u0DD4\u0DBB\u0DD4) along with clear English.
2. Address students gently as "\u0DB4\u0DD4\u0DAD\u0DCF" (son) or "\u0DAF\u0DD4\u0DC0" (daughter) or "\u0DB8\u0DD2\u0DAD\u0DD4\u0DBB\u0DCF" (friend).
3. Draw upon your journalistic background in clear communication, natural everyday dialogue, storytelling, and media confidence.
4. Empathize with Sinhala thought patterns: explain how Sinhala sentence structure (Subject-Object-Verb, e.g. "\u0DB8\u0DB8 \u0DB6\u0DAD\u0DCA \u0D9A\u0DB1\u0DC0\u0DCF") contrasts with English (Subject-Verb-Object, "I eat rice").
5. Point out common Sri Lankan English colloquial traps with warmth (e.g., saying "open the lights" instead of "turn on the lights", "yesterday only I came", "no?" tag questions, confusing "borrow" and "lend").
6. Provide pronunciation guidance with Sinhala phonetic spelling in square brackets (e.g., "Schedule [\u0DC2\u0DD9\u0DA9\u0DD2\u0DBA\u0DD4\u0DBD\u0DCA]").
7. Always end with inspiring words: "\u0DB6\u0DBA \u0DB1\u0DD0\u0DAD\u0DD4\u0DC0 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1! \u0DC0\u0DD0\u0DBB\u0DAF\u0DD3\u0DB8\u0DCA \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1\u0DDA \u0D89\u0D9C\u0DD9\u0DB1\u0DD4\u0DB8\u0DDA \u0DB4\u0DD2\u0DBA\u0DC0\u0DBB\u0D9A\u0DCA." (Speak without fear! Mistakes are stepping stones in learning.)`;
app.post("/api/chat-with-sir", async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `\u0D86\u0DBA\u0DD4\u0DB6\u0DDD\u0DC0\u0DB1\u0DCA \u0DB4\u0DD4\u0DAD\u0DCF! \u0DB8\u0DB8 \u0DC1\u0DCA\u200D\u0DBB\u0DD3 \u0DB8\u0DCF\u0DBD\u0DCA \u0DC3\u0DBB\u0DCA. "${message}" \u0D9C\u0DD0\u0DB1 \u0DB8\u0D9C\u0DD9\u0DB1\u0DCA \u0D87\u0DC3\u0DD6 \u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1\u0DBA\u0DA7 \u0DC3\u0DCA\u0DAD\u0DD6\u0DAD\u0DD2\u0DBA\u0DD2. \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0D9A\u0DAD\u0DCF \u0D9A\u0DBB\u0DB1\u0D9A\u0DDC\u0DA7 \u0DB8\u0DD4\u0DBD\u0DD2\u0DB1\u0DCA\u0DB8 \u0DC3\u0DD2\u0D82\u0DC4\u0DBD\u0DD9\u0DB1\u0DCA \u0DC4\u0DD2\u0DAD\u0DBD\u0DCF \u0D92\u0D9A \u0DC0\u0DA0\u0DB1\u0DD9\u0DB1\u0DCA \u0DC0\u0DA0\u0DB1\u0DD9\u0DA7 \u0DB4\u0DBB\u0DD2\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1 \u0D91\u0DB4\u0DCF. \u0D8B\u0DAF\u0DCF\u0DC4\u0DBB\u0DAB\u0DBA\u0D9A\u0DA7 '\u0DB8\u0DA7 \u0DAD\u0DDA \u0D91\u0D9A\u0D9A\u0DCA \u0D95\u0DB1\u0DD9' \u0D9A\u0DD2\u0DBA\u0DAF\u0DCA\u0DAF\u0DD3 'I want tea' \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA \u0DC0\u0DD4\u0DAB\u0DAD\u0DCA, \u0DC0\u0DA9\u0DCF\u0DAD\u0DCA \u0DC0\u0DD2\u0DB1\u0DD3\u0DAD\u0DC0 \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1\u0DDA 'Could I have a cup of tea, please?' [\u0D9A\u0DD4\u0DA9\u0DCA \u0D85\u0DBA\u0DD2 \u0DC4\u0DD1\u0DC0\u0DCA \u0D85 \u0D9A\u0DB4\u0DCA \u0D94\u0DC6\u0DCA \u0DA7\u0DD3, \u0DB4\u0DCA\u0DBD\u0DD3\u0DC3\u0DCA?] \u0D9A\u0DD2\u0DBA\u0DBD\u0DBA\u0DD2. \u0DAF\u0DD2\u0DB1\u0DB4\u0DAD\u0DCF\u0DB8 \u0DB4\u0DDC\u0DA9\u0DD2 \u0DB4\u0DDC\u0DA9\u0DD2 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA \u0DC4\u0DAC \u0DB1\u0D9C\u0DBD\u0DCF \u0D9A\u0DD2\u0DBA\u0DC0\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0DC0\u0DD9\u0DB1\u0DCA\u0DB1. \u0DB8\u0DB8 \u0D94\u0DB6\u0DAD\u0DCA \u0D91\u0D9A\u0DCA\u0D9A \u0DB1\u0DD2\u0DAD\u0DBB\u0DB8 \u0D89\u0DB1\u0DCA\u0DB1\u0DC0\u0DCF!`,
        suggestedTip: "\u0DC0\u0DA0\u0DB1\u0DD9\u0DB1\u0DCA \u0DC0\u0DA0\u0DB1\u0DD9\u0DA7 \u0DC3\u0DD2\u0D82\u0DC4\u0DBD\u0DD9\u0DB1\u0DCA \u0DB4\u0DBB\u0DD2\u0DC0\u0DBB\u0DCA\u0DAD\u0DB1\u0DBA \u0DB1\u0DDC\u0D9A\u0DBB \u0DBB\u0DA7\u0DCF\u0DC0 \u0DB8\u0DAD\u0D9A \u0DAD\u0DB6\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1."
      });
    }
    const conversationContext = chatHistory.slice(-6).map((item) => `${item.sender === "user" ? "Student" : "Sir Sri Maal"}: ${item.text}`).join("\n");
    const prompt = `Context of previous conversation:
${conversationContext}

Student's new question / statement:
"${message}"

Respond as Sir Sri Maal in your authentic, warm Sri Lankan English teacher persona. Explain clearly using Sinhala script for explanations, with English phrases in bold or clear text, and include Sinhala phonetic pronunciation where helpful. Keep it structured, welcoming, and concise (under 200 words).`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: SIR_SYSTEM_INSTRUCTION,
        temperature: 0.7
      }
    });
    const replyText = response.text || "\u0DC4\u0DDC\u0DB3 \u0DB4\u0DCA\u200D\u0DBB\u0DC1\u0DCA\u0DB1\u0DBA\u0D9A\u0DCA \u0DB4\u0DD4\u0DAD\u0DCF! \u0DB1\u0DD0\u0DC0\u0DAD \u0D85\u0DC4\u0DB1\u0DCA\u0DB1.";
    res.json({ reply: replyText });
  } catch (error) {
    console.error("Error in /api/chat-with-sir:", error);
    res.json({
      reply: "\u0D86\u0DBA\u0DD4\u0DB6\u0DDD\u0DC0\u0DB1\u0DCA \u0DB4\u0DD4\u0DAD\u0DCF! \u0DB8\u0D9C\u0DDA \u0DC4\u0DAC \u0DC3\u0DB8\u0DCA\u0DB6\u0DB1\u0DCA\u0DB0\u0DAD\u0DCF\u0DC0\u0DBA\u0DDA \u0DC3\u0DD4\u0DC5\u0DD4 \u0DB4\u0DB8\u0DCF\u0DC0\u0D9A\u0DCA \u0D87\u0DAD\u0DD2\u0DC0\u0DD4\u0DAB\u0DCF. \u0DB1\u0DB8\u0DD4\u0DAD\u0DCA \u0DB8\u0DAD\u0D9A \u0DAD\u0DD2\u0DBA\u0DCF\u0D9C\u0DB1\u0DCA\u0DB1: \u0DC4\u0DD0\u0DB8\u0DAF\u0DCF\u0DB8 \u0D85\u0DBD\u0DD4\u0DAD\u0DCA \u0D89\u0D82\u0D9C\u0DCA\u200D\u0DBB\u0DD3\u0DC3\u0DD2 \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA 3\u0D9A\u0DCA \u0DC1\u0DB6\u0DCA\u0DAF \u0DB1\u0D9C\u0DBD\u0DCF \u0D9A\u0DD2\u0DBA\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0DC0\u0DD9\u0DB1\u0DCA\u0DB1. \u0D94\u0DB6\u0DA7 \u0DB4\u0DD4\u0DC5\u0DD4\u0DC0\u0DB1\u0DCA!"
    });
  }
});
app.post("/api/pronunciation-coach", async (req, res) => {
  try {
    const { targetPhrase, spokenTranscript } = req.body;
    if (!targetPhrase || !spokenTranscript) {
      return res.status(400).json({ error: "targetPhrase and spokenTranscript are required." });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        feedbackSinhala: `\u0DC4\u0DDC\u0DB3 \u0D8B\u0DAD\u0DCA\u0DC3\u0DCF\u0DC4\u0DBA\u0D9A\u0DCA \u0DB4\u0DD4\u0DAD\u0DCF! \u0D94\u0DB6 \u0D9A\u0DD3\u0DC0\u0DDA "${spokenTranscript}". \u0D89\u0DBD\u0D9A\u0DCA\u0D9A \u0DC0\u0DCF\u0D9A\u0DCA\u200D\u0DBA\u0DBA "${targetPhrase}". \u0DAF\u0DD2\u0D9C\u0DA7\u0DB8 \u0DB4\u0DD4\u0DBB\u0DD4\u0DAF\u0DD4 \u0DC0\u0DD9\u0DB1\u0DCA\u0DB1!`,
        tipsSinhala: "\u0DC0\u0DA0\u0DB1 \u0DC0\u0DBD \u0D85\u0D9C \u0DC1\u0DB6\u0DCA\u0DAF\u0DBA (ending sound) \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0D8B\u0DA0\u0DCA\u0DA0\u0DCF\u0DBB\u0DAB\u0DBA \u0D9A\u0DBB\u0DB1\u0DCA\u0DB1."
      });
    }
    const prompt = `The student is a native Sinhala speaker learning English pronunciation.
Target English sentence: "${targetPhrase}"
What the student said (speech-to-text transcript): "${spokenTranscript}"

Analyze their pronunciation accuracy and provide:
1. Teacher feedback in Sinhala script (speaking as Sir Sri Maal, warm, gentle, highlighting specific phonemes like 'th', 'w', 'v', 'p', 'f', 's', 'sh' or final consonants where Sri Lankan speakers often need focus).
2. A practical pronunciation tip in Sinhala with English examples.
Keep your response short (2-4 sentences total) and encouraging.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: SIR_SYSTEM_INSTRUCTION,
        temperature: 0.5
      }
    });
    res.json({
      feedbackSinhala: response.text || "\u0DC0\u0DD2\u0DC1\u0DD2\u0DC2\u0DCA\u0DA7 \u0D8B\u0DAD\u0DCA\u0DC3\u0DCF\u0DC4\u0DBA\u0D9A\u0DCA! \u0DAF\u0DD2\u0D9C\u0DA7\u0DB8 \u0DC4\u0DAC \u0DB1\u0D9C\u0DCF \u0DB4\u0DD4\u0DC4\u0DD4\u0DAB\u0DD4 \u0DC0\u0DB1\u0DCA\u0DB1."
    });
  } catch (error) {
    console.error("Error in /api/pronunciation-coach:", error);
    res.json({
      feedbackSinhala: "\u0DC4\u0DDC\u0DB3 \u0D8B\u0DAD\u0DCA\u0DC3\u0DCF\u0DC4\u0DBA\u0D9A\u0DCA! \u0DAD\u0DC0\u0DAD\u0DCA \u0DC0\u0DBB\u0D9A\u0DCA \u0DC3\u0DD9\u0DB8\u0DD9\u0DB1\u0DCA, \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2\u0DC0 \u0D9A\u0DD2\u0DBA\u0DCF \u0DB6\u0DBD\u0DB1\u0DCA\u0DB1 \u0DB4\u0DD4\u0DAD\u0DCF."
    });
  }
});
app.post("/api/generate-lesson-questions", async (req, res) => {
  try {
    const { topic = "Everyday Spoken English" } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ questions: null });
    }
    const prompt = `Generate 3 interactive beginner English spoken practice questions for a Sinhala-speaking learner on the topic: "${topic}".
Format output strictly as JSON with this structure:
{
  "questions": [
    {
      "id": "q1",
      "sinhalaPrompt": "\u0DC3\u0DD2\u0D82\u0DC4\u0DBD \u0D85\u0DBB\u0DCA\u0DAE\u0DBA \u0DC4\u0DDD \u0D8B\u0DB4\u0DAF\u0DD9\u0DC3",
      "targetEnglish": "The correct English phrase",
      "singlishPronunciation": "Sinhala script pronunciation e.g. [\u0D85\u0DBA\u0DD2 \u0D9C\u0DDD \u0DA7\u0DD4 \u0DC3\u0DCA\u0D9A\u0DD6\u0DBD\u0DCA]",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanationSinhala": "\u0D9A\u0DD9\u0DA7\u0DD2 \u0DC0\u0DCA\u200D\u0DBA\u0DCF\u0D9A\u0DBB\u0DAB \u0DB4\u0DD0\u0DC4\u0DD0\u0DAF\u0DD2\u0DBD\u0DD2 \u0D9A\u0DD2\u0DBB\u0DD3\u0DB8 \u0DC3\u0DD2\u0D82\u0DC4\u0DBD\u0DD9\u0DB1\u0DCA"
    }
  ]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: SIR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Error in /api/generate-lesson-questions:", error);
    res.json({ questions: null });
  }
});
app.get("/api/download-cpanel-bundle", (_req, res) => {
  const zipPath = path.join(__dirname, "singlish-guru-cpanel.zip");
  res.download(zipPath, "singlish-guru-cpanel.zip", (err) => {
    if (err) {
      console.error("Error sending zip bundle:", err);
      res.status(500).send("Could not download package.");
    }
  });
});
async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, () => {
    console.log(`Singlish Guru server running on http://localhost:${PORT} in ${isDev ? "development" : "production"} mode`);
  });
}
startServer();
