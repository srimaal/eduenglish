import { getApps, initializeApp } from 'firebase/app';
import { GoogleAuthProvider, initializeAuth, inMemoryPersistence, browserPopupRedirectResolver, signInWithPopup, signOut } from 'firebase/auth';
import type { AccountUser, FirebaseWebConfig } from '../types/auth';

// Loaded before the click so the popup opens within the user gesture.
export function prepareFirebaseLogin(config: FirebaseWebConfig): () => Promise<AccountUser> {
  const name = `singlish-${config.projectId}`;
  const app = getApps().find(app => app.name === name) || initializeApp(config, name);
  const auth = initializeAuth(app, { persistence: inMemoryPersistence, popupRedirectResolver: browserPopupRedirectResolver });
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return async () => {
    try {
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      const response = await fetch('/api/auth/firebase', { method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }),
        signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create your session. Please try again.');
      return data.user as AccountUser;
    } finally {
      // The app uses an HTTP-only session; don't retain Firebase refresh tokens.
      await signOut(auth).catch(() => undefined);
    }
  };
}
