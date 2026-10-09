# Google sign-in through Firebase Authentication

The React app uses Firebase's Google popup. Express verifies the Firebase ID token
against your project and creates an encrypted HTTP-only session lasting 24 hours.
Firebase credentials stay in memory during sign-in and are cleared after the exchange.
No Firebase database is required; Turso stores lesson progress and signed-in
lesson-quiz attempts separately.

## Firebase Console

1. In Project settings > General, register a Web app (if you haven't already).
2. Copy apiKey, authDomain, projectId and appId from its SDK configuration.
3. In Authentication > Sign-in method, enable Google and set the support email.
4. In Authentication > Settings > Authorized domains, add `127.0.0.1` for the local
   origin in the example below (or `localhost` if that is what you open in your browser)
   and your real domain for production. Enter hostnames, not URLs or ports.

## Environment configuration

Save these in `.env.local` and restart `npm run dev`:

```dotenv
FIREBASE_API_KEY="copy-apiKey-from-Firebase-web-config"
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project"
FIREBASE_APP_ID="copy-appId-from-Firebase-web-config"
AUTH_ORIGIN="http://127.0.0.1:3000"
AUTH_SESSION_SECRET="keep-your-existing-random-secret-at-least-32-characters"
```

The four Firebase values are public web configuration. Express returns only those
four fields to React at runtime. Never put a service-account private key, session
secret or Google client secret in them. Keep `AUTH_SESSION_SECRET` private and stable.
Use `AUTH_ORIGIN` for this setting. Do not configure the legacy
`GOOGLE_AUTH_ORIGIN` alias in production; use your site's HTTPS origin there.
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are no longer used by this app.

Use **Sign in with Google** in the top-right corner of the header (shown as **Sign in**
on small screens). Allow popups for this site.
If a popup is blocked or cancelled, the UI lets you retry without losing progress.

## Redirect URI mismatch

Firebase manages the callback. With the default Firebase auth domain, the provider
redirect URI is `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`.
If Google reports redirect_uri_mismatch, check the OAuth Web client configured in
Firebase's Google provider and register the handler URI for the actual authDomain.
The previous `/api/auth/google/callback` URL is not used by Firebase.

## Production / cPanel

Set the same variables in the Node application settings with `NODE_ENV=production`
and `AUTH_ORIGIN=https://your-domain.example`. Enable HTTPS and authorize that
domain in Firebase. Retain Firebase's authDomain unless you have configured a custom
Firebase auth domain. Do not set `FIREBASE_AUTH_EMULATOR_HOST` for this flow.
Firebase Admin verifies ID tokens using the explicit project ID and Google's public
signing keys; this verification-only integration needs no service-account key.

## Current scope and session limitations

Firebase creates/manages authentication users. Signed-in AI quotas use the verified
Firebase UID. Lesson completions and signed-in lesson-quiz attempts sync through
Express to Turso; see TURSO_SETUP.md. Guest lessons require an explicit import
choice. General-practice scores, XP, badges and flashcards remain browser-local;
quota counters remain in server memory. Guest lesson-quiz attempts are
intentionally not uploaded by the guest-import button.

The current release does not yet provide self-service Firebase account deletion
or a complete progress export. Add those controls before public launch and link
them from the privacy settings screen.

App sessions are stateless and expire after 24 hours. Logout removes the session
from this browser; disabling a Firebase account does not immediately revoke an
already-issued app session. Remote revocation requires an additional session store
or Firebase revocation checks. Rotating AUTH_SESSION_SECRET invalidates all sessions.

`npm run check` runs mocked authentication tests and the production build. A live
Google login still requires your Firebase configuration and a real browser.

References: https://firebase.google.com/docs/auth/web/google-signin and
https://firebase.google.com/docs/auth/admin/verify-id-tokens
