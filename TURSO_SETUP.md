# Turso lesson-progress storage

Firebase handles login. React calls the same-origin Express API; only Express has
the Turso database token. The server uses `@libsql/client/http`, with no local
SQLite file or native database binding required on the production host.

## Setup

Set the following in `.env.local` locally or your hosting panel in production:

```dotenv
TURSO_DATABASE_URL="libsql://your-real-database.turso.io"
TURSO_AUTH_TOKEN="your-real-database-token"
```

Keep these private and do not use `VITE_` prefixes. Retain the Firebase settings,
AUTH_ORIGIN and AUTH_SESSION_SECRET described in GOOGLE_AUTH.md.

```sh
npm run db:check
npm run db:setup
npm run dev
```

`db:check` runs SELECT 1. `db:setup` creates sg_users, sg_lesson_progress and
sg_schema_migrations with additive, repeatable statements in a transaction.
It does not clear existing data or create fake users. It needs a database token
with write/schema permissions. Production requires the same migration before
starting the new build; migrations are not run automatically on every request.

## Included in this phase

- A signed-in profile (verified Firebase UID, name, email, creation timestamp).
- Explicit lesson completions, with server-generated completion timestamps.
- GET /api/progress and POST /api/progress/lessons, using the encrypted session.
- A separate rate limit for progress, not the small AI-request allowance.
- Separate browser caches and pending queues per UID, plus a guest-only cache.
- Automatic retry when Lessons opens, the connection returns, or the window
  regains focus; a visible Retry sync button after errors.
- Guest import is explicitly chosen by the learner. The guest copy is retained.

POST accepts only lessonIds (1–1000 valid curriculum IDs). A composite primary
key makes completion/import/retry idempotent; transactions preserve other
devices' completions. The API takes ownership exclusively from the verified
session. X-Progress-User only guards against stale tabs after account switching;
it cannot authenticate a request. Writes require the configured same-origin Origin.

All sync responses use Cache-Control: no-store and the service worker excludes
/api routes. A stopped account controller ignores late responses. Browser caches
are not encrypted; account scoping prevents accidental mixing, not access by
someone who can inspect the browser profile. Failed saves stay in that account's
local pending queue. If browser storage is blocked, the UI warns that pending
work is in memory only. Do not clear local data before pending work has synced.

## Not included yet

XP, quizzes, pronunciation scores, badges and flashcards remain local to the
browser, not account-scoped cloud records. AI quotas remain in memory. Opening
a lesson does not mark it complete and does not award additional XP. Existing
local counters cannot reliably be converted into lesson IDs, so they are not
silently imported. Completions are learner self-reports, not verified assessments.

There is no cloud reset/account deletion UI in this phase; deletion requests use
the contact in the privacy notice. Local reset controls do not delete Turso data.
Backups, retention policy and remote session revocation need separate production
planning. Existing app sessions expire after 24 hours.

## Verification

`npm run check` uses isolated in-memory SQLite databases, mocked Firebase token
verification and mocked browser requests; tests never access the real Turso DB.
They cover ownership, CSRF, account switching, validation, duplicate/concurrent
writes, rollback, offline queues, explicit import and late responses.

For a live check: restart the app, sign in, mark one lesson complete, wait for
the synced status and reload. Sign in as the same user on another device to see
the completion, then test another user to confirm their list is separate.

References: https://github.com/tursodatabase/libsql-client-ts and
https://tursodatabase.github.io/libsql-client-ts/interfaces/Client.html
