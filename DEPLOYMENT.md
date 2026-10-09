# Deploying Singlish Guru on Hostinger or Namecheap

## Spoken quiz microphone checks

Spoken quizzes require a browser with SpeechRecognition/webkitSpeechRecognition,
HTTPS (or localhost), app microphone consent and browser/OS microphone permission.
Recognition may use the browser provider's online service. A supported API does
not guarantee that service is reachable. The UI reports unsupported browsers,
blocked permissions, missing microphones, no speech, network failures and timeouts.
After saving microphone consent in Privacy Settings, press the microphone again.
The app cannot override a browser/OS permission denial. Embedded deployments also
need permission from the parent frame; keep microphone access restricted to trusted
origins rather than loosening the global Permissions-Policy.

Quiz correction uses final speech-to-text, not acoustic pronunciation scoring.
It aligns words in order and highlights omissions, substitutions and extra words.
Passing requires the normalized sentence to match, allowing punctuation, case
and the explicitly supported common contraction equivalents. Recognition mistakes
can be retried before submitting. Skipped spoken questions are ungraded and do not
award XP. No raw audio is sent to our Express API for quiz grading.

Automated tests mock speech recognition; test with a real microphone before launch.
Reference: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

This application requires a hosting plan that supports a persistent Node.js application. A static/shared HTML-only plan cannot run the Gemini API routes.

Do not deploy only `dist/` to GitHub Pages or another static host. This project
requires `server.js` for Firebase sessions, Gemini routes and Turso progress.
The repository workflow verifies the build but does not publish a static site.

## Production settings

- Node.js version: 20, 22, or 24
- Application root: the project directory
- Build command: `npm ci && npm run build`
- Startup file: `server.js`
- Start command (when supported): `npm start`
- Application URL: your HTTPS domain or subdomain

The hosting panel supplies `PORT`; do not hard-code it. The server listens on all interfaces and uses that value automatically.

## Environment variables

Configure these in the hosting control panel, not in files committed to Git:

```text
NODE_ENV=production
GEMINI_API_KEY=your-real-secret-key
GEMINI_MODEL=gemini-3.5-flash-lite
AI_TIMEOUT_MS=<timeout_in_milliseconds>
APP_URL=https://your-domain.example
AI_DAILY_CHAT_LIMIT=5
AI_DAILY_PRONUNCIATION_LIMIT=10
AI_DAILY_QUIZ_LIMIT=2
TURSO_DATABASE_URL=libsql://your-real-database.turso.io
TURSO_AUTH_TOKEN=your-real-database-token
```

For local development, copy the variable names from `.env.example` into `.env.local`. The server loads `.env.local` automatically, and Vite also uses it for `VITE_*` build-time settings. Never commit `.env.local`; it is covered by `.gitignore`.

Optional iframe allowlist:

```text
ALLOWED_FRAME_ANCESTORS='self' https://www.your-other-domain.example
```

The `VITE_ADSENSE_*` variables are public build-time settings. Do not put private secrets in any variable beginning with `VITE_`.

## Deployment sequence

1. Upload or clone the repository into the Node application directory.
2. Configure the environment variables in hPanel or cPanel.
3. Run `npm ci`.
4. Run `npm run db:check` and `npm run db:setup` to verify Turso and apply the additive schema (including version 2 for lesson-quiz attempts). Then run `npm run build` to generate `dist/` and `server.js`. These commands need the development dependencies installed by `npm ci`; run them before pruning dependencies if your host does that.
5. Start or restart the Node application with `server.js` as its startup file.
6. Verify `https://your-domain.example/api/health` returns JSON with `status: "ok"` and `aiConfigured: true`.
7. Test chat, pronunciation feedback, and fresh-question generation from the public HTTPS URL.

## Hosting-plan warning

Some low-cost shared plans support only PHP/static websites. Confirm that the selected Hostinger or Namecheap plan includes Node.js application hosting and lets you set environment variables. If it does not, use a VPS or another Node-capable service.

The included rate limiter is suitable for an initial single-process beta. Before scaling to multiple Node processes or servers, replace it with a shared Redis-backed limiter.

Anonymous learners receive a random browser ID used only for enforcing daily AI quotas. The server combines it with network information and keeps quota counters in memory; it does not store chat messages or pronunciation transcripts in usage metrics. Document this identifier and the transfer of submitted AI content in the production privacy notice.

Google sign-in now uses Firebase; configure its variables and AUTH_ORIGIN/AUTH_SESSION_SECRET as described in GOOGLE_AUTH.md. Express verifies the Firebase ID token and uses its UID for session ownership. Never trust an email address or user ID sent directly by the browser. Turso stores lesson completions and signed-in lesson-quiz attempts (see TURSO_SETUP.md); general-practice scores, XP, badges and flashcards are still local. AI quotas remain in memory and need shared persistence before multi-process scaling.

Before public launch, add a self-service account/data deletion flow and an export
endpoint. The current privacy controls clear browser data, while Firebase/Turso
records require an administrator-assisted deletion process.

XP is deliberately capped at 500 points per browser-local calendar day to reduce
accidental or automated farming. This is not an anti-cheat system and must not be
used as a server-trusted achievement value until progress is moved to a validated
account-side model.
