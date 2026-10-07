import { useEffect, useState } from 'react';
import { CheckCircle2, Volume2 } from 'lucide-react';
import { KOKORO_STATUS_EVENT, KokoroStatus } from '../utils/kokoroSpeech';

export function KokoroLoadIndicator() {
  const [status, setStatus] = useState<KokoroStatus | null>(null);

  useEffect(() => {
    let hideTimer: number | undefined;
    const handleStatus = (event: Event) => {
      const next = (event as CustomEvent<KokoroStatus>).detail;
      window.clearTimeout(hideTimer);
      setStatus(next);
      if (next.phase === 'ready' || next.phase === 'error') {
        hideTimer = window.setTimeout(() => setStatus(null), next.phase === 'ready' ? 1800 : 4000);
      }
    };
    window.addEventListener(KOKORO_STATUS_EVENT, handleStatus);
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener(KOKORO_STATUS_EVENT, handleStatus);
    };
  }, []);

  if (!status) return null;
  const ready = status.phase === 'ready';
  const failed = status.phase === 'error';
  const progress = ready ? 100 : Math.max(3, Math.min(99, Math.round(status.progress ?? 3)));

  return (
    <div
      className="fixed bottom-20 sm:bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-amber-200 bg-white/95 p-4 shadow-xl backdrop-blur"
      role="status"
      aria-live="polite"
    >
      <div className="mb-2 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${ready ? 'bg-emerald-100 text-emerald-700' : failed ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
          {ready ? <CheckCircle2 className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-stone-900">
            {ready ? 'Natural voice is ready' : failed ? 'Using device voice' : 'Preparing natural voice'}
          </p>
          <p className="text-xs text-stone-600">
            {ready
              ? 'Future playback will start faster.'
              : failed
                ? 'Kokoro could not load, so playback will continue with your device voice.'
                : `${status.backend === 'wasm' ? 'Compatibility mode' : 'High-quality mode'} · ${progress}%`}
          </p>
        </div>
      </div>
      {!failed && (
        <div className="h-2 overflow-hidden rounded-full bg-amber-100" aria-label={`Voice model loading ${progress}%`}>
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${ready ? 'bg-emerald-500' : 'bg-amber-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {status.phase === 'loading' && (
        <p className="mt-2 text-[11px] text-stone-500">First-time setup may take a minute. Please keep this page open.</p>
      )}
    </div>
  );
}
