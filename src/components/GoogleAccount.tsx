import { useEffect, useId, useRef, useState } from 'react';
import type { AccountSession, AccountUser } from '../types/auth';

const errors: Record<string, string> = {
  firebase: 'Sign-in now uses Firebase. Please use the Google sign-in button below.',
  unconfigured: 'Google sign-in is not configured yet. You can continue as a guest.',
  expired: 'Your sign-in attempt expired. Please try again.',
  cancelled: 'Google sign-in was cancelled. You can try again or continue as a guest.',
  invalid: 'Google sign-in could not complete. Please try again.',
  verification: 'We could not verify your Google sign-in. Please try again.',
  unavailable: 'Google sign-in is temporarily unavailable. Please try again.',
};

export function GoogleAccount({ onUserChange }: { onUserChange?: (user: AccountUser | null) => void }) {
  const progressNoteId = useId();
  const [session, setSession] = useState<AccountSession | null>(null);
  const login = useRef<(() => Promise<AccountUser>) | null>(null);
  const [loginReady, setLoginReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => { if (session) onUserChange?.(session.user); }, [session, onUserChange]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('auth_error');
    if (code) {
      setError(errors[code] || errors.invalid);
      params.delete('auth_error');
      const query = params.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
    }
    const controller = new AbortController();
    fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error();
        const data: AccountSession = await response.json();
        if (controller.signal.aborted) return;
        setSession(data);
        if (data.configured && data.firebase) {
          const { prepareFirebaseLogin } = await import('../utils/firebaseLogin');
          if (controller.signal.aborted) return;
          login.current = prepareFirebaseLogin(data.firebase);
          setLoginReady(true);
        }
      }).catch(() => { if (!controller.signal.aborted) setError('Unable to check sign-in. Please retry.'); });
    return () => controller.abort();
  }, [retry]);

  async function signIn() {
    if (!login.current || busy) return;
    setBusy(true);
    setError('');
    try {
      const user = await login.current();
      setSession(current => current ? { ...current, user } : null);
    } catch (error) {
      const code = (error as { code?: string })?.code;
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'Sign-in was cancelled. You can try again or continue as a guest.',
        'auth/popup-blocked': 'Please allow pop-ups for this site, then try again.',
        'auth/unauthorized-domain': 'This website is not yet authorized for sign-in. Please contact the site owner.',
        'auth/operation-not-allowed': 'Google sign-in has not been enabled by the site owner yet.',
        'auth/network-request-failed': 'Please check your connection and try again.',
      };
      setError(messages[code || ''] || 'Google sign-in failed. Please try again.');
    } finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error();
      setSession(current => current ? { ...current, user: null } : null);
    } catch { setError('Sign-out failed. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <section aria-label="Your account" aria-describedby={progressNoteId} className="relative text-xs">
      <p id={progressNoteId} className="sr-only">Signed-in lesson completions sync to your account when connected. Other learning progress stays on this browser.</p>
      {!session ? (
        <button type="button" disabled={!error} onClick={() => { setError(''); setRetry(value => value + 1); }} className="min-h-9 rounded-xl border border-stone-300 bg-white px-3 py-2 font-semibold disabled:opacity-60">{error ? 'Retry sign-in' : 'Checking account…'}</button>
      ) : session.user ? (
        <div className="flex items-center justify-end gap-2">
          <span aria-label={`Signed in as ${session.user.name} (${session.user.email})`} title={`${session.user.name} (${session.user.email}) — See lesson sync status in Lessons`} className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-900">{session.user.name.trim().charAt(0).toUpperCase() || 'L'}</span>
            <span aria-hidden="true" className="hidden min-w-0 sm:block">
              <span className="block max-w-24 truncate font-bold text-stone-800">{session.user.name}</span>
              <span className="block text-[10px] text-stone-500">Learner account</span>
            </span>
          </span>
          <button type="button" disabled={busy} onClick={signOut} className="min-h-9 shrink-0 rounded-xl border border-stone-300 bg-white px-2.5 py-2 font-semibold hover:bg-stone-50 disabled:opacity-50">{busy ? 'Signing out…' : 'Sign out'}</button>
        </div>
      ) : session.configured ? (
        <div className="text-right">
          <button type="button" aria-label={busy ? 'Signing in…' : !loginReady ? 'Preparing sign-in…' : 'Sign in with Google'} disabled={!loginReady || busy} onClick={signIn} className="min-h-9 rounded-xl border border-stone-300 bg-white px-3 py-2 text-center font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-50">{busy ? 'Signing in…' : !loginReady ? 'Preparing…' : <>Sign in<span className="hidden sm:inline"> with Google</span></>}</button>
        </div>
      ) : <span title="Google sign-in is not configured yet. Continue learning as a guest." className="inline-block rounded-xl border border-stone-200 px-3 py-2 text-stone-500">Guest mode</span>}
      {error && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-red-200 bg-white p-3 shadow-lg">
          <p role="alert" className="text-red-700">{error}</p>
          <div className="mt-2 flex flex-wrap justify-end gap-3">
            {!loginReady && session?.configured && <button type="button" onClick={() => { setError(''); setRetry(value => value + 1); }} className="underline">Retry sign-in setup</button>}
            {(session?.user || loginReady || session?.configured === false) && <button type="button" onClick={() => setError('')} className="underline">Dismiss</button>}
          </div>
        </div>
      )}
    </section>
  );
}
