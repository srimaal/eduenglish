import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(express.json());

// Enable iframe embedding on lankan.org and custom domains
app.use((_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *;');
  next();
});

// Initialize GoogleGenAI server-side with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const TEACHER_SYSTEM_INSTRUCTION = `You are "Teacher Daisy" (ඩේසි ගුරුතුමිය), a warm, kind, and encouraging English teacher who is an anthropomorphic cow lady wearing a yellow floral sundress. You teach spoken English from Sinhala with immense patience, warmth, and practical clarity.
Your teaching method:
1. Always communicate in a bilingual, friendly Sri Lankan teacher tone, using authentic Sinhala (සිංහල අකුරු) along with clear English.
2. Address students gently as "පැටියෝ" (dear one), "පුතා" (son), "දුව" (daughter), or "මිතුරේ" (friend). You can occasionally include a gentle, cheerful "Moo!" or warm encouragement.
3. Empathize with Sinhala thought patterns: explain how Sinhala sentence structure (Subject-Object-Verb, e.g. "මම බත් කනවා") contrasts with English (Subject-Verb-Object, "I eat rice").
4. Point out common Sri Lankan English colloquial traps with warmth (e.g., saying "open the lights" instead of "turn on the lights", "yesterday only I came", "no?" tag questions, confusing "borrow" and "lend").
5. Provide pronunciation guidance with Sinhala phonetic spelling in square brackets (e.g., "Schedule [ෂෙඩියුල්]").
6. Always end with inspiring words: "බය නැතුව කතා කරන්න පැටියෝ! වැරදීම් කියන්නේ ඉගෙනුමේ පියවරක්." (Speak without fear! Mistakes are stepping stones in learning.)`;

// API: Chat with Teacher Daisy
app.post('/api/chat-with-sir', async (req: Request, res: Response) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Offline fallback with genuine teacher advice
      return res.json({
        reply: `ආයුබෝවන් පැටියෝ! මම ඩේසි ගුරුතුමිය. "${message}" ගැන මගෙන් ඇසූ ප්‍රශ්නයට ස්තූතියි. ඉංග්‍රීසි කතා කරනකොට මුලින්ම සිංහලෙන් හිතලා ඒක වචනෙන් වචනෙට පරිවර්තනය කරන්න එපා. උදාහරණයකට 'මට තේ එකක් ඕනෙ' කියද්දී 'I want tea' කියන්න පුළුවන් වුණත්, වඩාත් විනීතව කියන්නේ 'Could I have a cup of tea, please?' [කුඩ් අයි හෑව් අ කප් ඔෆ් ටී, ප්ලීස්?] කියලයි. දිනපතාම පොඩි පොඩි වාක්‍ය හඬ නගලා කියවන්න පුරුදු වෙන්න. ඩේසි මිස් ඔබත් එක්ක නිතරම ඉන්නවා!`,
        suggestedTip: 'වචනෙන් වචනෙට සිංහලෙන් පරිවර්තනය නොකර රටාව මතක තබාගන්න.',
      });
    }

    const conversationContext = chatHistory
      .slice(-6)
      .map((item: { sender: string; text: string }) => `${item.sender === 'user' ? 'Student' : 'Teacher Daisy'}: ${item.text}`)
      .join('\n');

    const prompt = `Context of previous conversation:
${conversationContext}

Student's new question / statement:
"${message}"

Respond as Teacher Daisy (the kind cow teacher in the yellow floral dress) in your authentic, warm Sri Lankan English teacher persona. Explain clearly using Sinhala script for explanations, with English phrases in bold or clear text, and include Sinhala phonetic pronunciation where helpful. Keep it structured, welcoming, and concise (under 200 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: TEACHER_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'හොඳ ප්‍රශ්නයක් පැටියෝ! නැවත අහන්න.';
    res.json({ reply: replyText });
  } catch (error) {
    console.error('Error in /api/chat-with-sir:', error);
    res.json({
      reply: 'ආයුබෝවන් පැටියෝ! මගේ හඬ සම්බන්ධතාවයේ සුළු පමාවක් ඇතිවුණා. නමුත් මතක තියාගන්න: හැමදාම අලුත් ඉංග්‍රීසි වාක්‍ය 3ක් ශබ්ද නගලා කියන්න පුරුදු වෙන්න. ඔබට පුළුවන්!',
    });
  }
});

// API: Detailed Pronunciation Coach
app.post('/api/pronunciation-coach', async (req: Request, res: Response) => {
  try {
    const { targetPhrase, spokenTranscript } = req.body;

    if (!targetPhrase || !spokenTranscript) {
      return res.status(400).json({ error: 'targetPhrase and spokenTranscript are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        feedbackSinhala: `හොඳ උත්සාහයක් පුතා! ඔබ කීවේ "${spokenTranscript}". ඉලක්ක වාක්‍යය "${targetPhrase}". දිගටම පුරුදු වෙන්න!`,
        tipsSinhala: 'වචන වල අග ශබ්දය (ending sound) පැහැදිලිව උච්චාරණය කරන්න.',
      });
    }

    const prompt = `The student is a native Sinhala speaker learning English pronunciation.
Target English sentence: "${targetPhrase}"
What the student said (speech-to-text transcript): "${spokenTranscript}"

Analyze their pronunciation accuracy and provide:
1. Teacher feedback in Sinhala script (speaking as Teacher Daisy, warm, gentle, highlighting specific phonemes like 'th', 'w', 'v', 'p', 'f', 's', 'sh' or final consonants where Sri Lankan speakers often need focus).
2. A practical pronunciation tip in Sinhala with English examples.
Keep your response short (2-4 sentences total) and encouraging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: TEACHER_SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    res.json({
      feedbackSinhala: response.text || 'විශිෂ්ට උත්සාහයක්! දිගටම හඬ නගා පුහුණු වන්න. Moo!',
    });
  } catch (error) {
    console.error('Error in /api/pronunciation-coach:', error);
    res.json({
      feedbackSinhala: 'හොඳ උත්සාහයක්! තවත් වරක් සෙමෙන්, පැහැදිලිව කියා බලන්න පැටියෝ.',
    });
  }
});

// API: Dynamic Practice Questions Generator
app.post('/api/generate-lesson-questions', async (req: Request, res: Response) => {
  try {
    const { topic = 'Everyday Spoken English' } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ questions: null });
    }

    const prompt = `Generate 3 interactive beginner English spoken practice questions for a Sinhala-speaking learner on the topic: "${topic}".
Format output strictly as JSON with this structure:
{
  "questions": [
    {
      "id": "q1",
      "sinhalaPrompt": "සිංහල අර්ථය හෝ උපදෙස",
      "targetEnglish": "The correct English phrase",
      "singlishPronunciation": "Sinhala script pronunciation e.g. [අයි ගෝ ටු ස්කූල්]",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanationSinhala": "කෙටි ව්‍යාකරණ පැහැදිලි කිරීම සිංහලෙන්"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: TEACHER_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error) {
    console.error('Error in /api/generate-lesson-questions:', error);
    res.json({ questions: null });
  }
});

// API: Download cPanel Static ZIP Bundle
app.get('/api/download-cpanel-bundle', (_req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'singlish-guru-cpanel.zip');
  res.download(zipPath, 'singlish-guru-cpanel.zip', (err) => {
    if (err) {
      console.error('Error sending zip bundle:', err);
      res.status(500).send('Could not download package.');
    }
  });
});

async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Singlish Guru server running on http://localhost:${PORT} in ${isDev ? 'development' : 'production'} mode`);
  });
}

startServer();
