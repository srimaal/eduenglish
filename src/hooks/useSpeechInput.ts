import { useCallback, useEffect, useRef, useState } from 'react';
import { hasConsent, PRIVACY_CHANGED_EVENT, requireConsent } from '../utils/privacyManager';
import { stopSpeech } from '../utils/speechUtils';

export interface Recognition {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
type State = { status: 'idle' | 'starting' | 'listening' | 'stopping' | 'complete' | 'error'; transcript: string; finalTranscript: string; error: string };
const initial: State = { status: 'idle', transcript: '', finalTranscript: '', error: '' };
const errors: Record<string, string> = {
  'not-allowed': 'Microphone permission was blocked. Allow the microphone in this site’s browser settings and your device privacy settings, then retry.',
  'service-not-allowed': 'The browser blocked speech recognition. Try a supported browser with speech recognition enabled.',
  'audio-capture': 'No microphone could be captured. Connect/select a microphone and close other apps using it, then retry.',
  'no-speech': 'No speech was detected. Move closer to the microphone and try again.',
  network: 'The speech recognition service could not connect. Check your internet connection and retry.',
  aborted: 'Recording was interrupted. Press the microphone to try again.',
  'language-not-supported': 'English speech recognition is unavailable in this browser. Try another supported browser.',
};

export function useSpeechInput(resetKey: string) {
  const [state, setState] = useState<State>(initial);
  const recognition = useRef<Recognition | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispose = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const instance = recognition.current;
    recognition.current = null;
    if (instance) {
      instance.onstart = instance.onresult = instance.onerror = instance.onend = null;
      try { instance.abort(); } catch { /* Already stopped. */ }
    }
  }, []);
  const reset = useCallback(() => { dispose(); setState(initial); }, [dispose]);
  useEffect(() => { reset(); return dispose; }, [resetKey, reset, dispose]);
  useEffect(() => {
    const changed = () => { if (!hasConsent('microphone')) { dispose(); setState({ ...initial, status: 'error', error: 'Microphone consent is off. Enable it in Privacy Settings, then press the microphone again.' }); } };
    window.addEventListener(PRIVACY_CHANGED_EVENT, changed);
    return () => window.removeEventListener(PRIVACY_CHANGED_EVENT, changed);
  }, [dispose]);

  const start = () => {
    if (recognition.current) return;
    setState(initial); // Never reuse a score/transcript from an earlier recording.
    const fail = (error: string) => { dispose(); setState({ ...initial, status: 'error', error }); };
    if (!requireConsent('microphone')) { fail('Enable “Microphone and speech recognition” in Privacy Settings, save your choice, then press the microphone again.'); return; }
    if (window.isSecureContext === false) { fail('Microphone recording needs HTTPS or localhost. Open the secure site, not an HTTP network address.'); return; }
    const Constructor = (window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition;
    if (!Constructor) { fail('Speech recognition is not supported in this browser. Try Chrome or Edge, or skip this spoken question without a grade.'); return; }
    try {
      stopSpeech(); // Do not transcribe the model voice playing through the speakers.
      const instance = new Constructor();
      recognition.current = instance;
      instance.lang = 'en-US'; instance.interimResults = true; instance.continuous = false; instance.maxAlternatives = 1;
      let finalText = '';
      const isCurrent = () => recognition.current === instance;
      const finish = () => {
        if (!isCurrent()) return;
        if (!finalText.trim()) { fail(errors['no-speech']); return; }
        dispose();
        setState({ status: 'complete', transcript: finalText, finalTranscript: finalText, error: '' });
      };
      instance.onstart = () => { if (isCurrent()) setState({ ...initial, status: 'listening' }); };
      instance.onresult = event => {
        if (!isCurrent()) return;
        const results = Array.from(event.results);
        const text = results.map(result => result[0].transcript).join(' ').trim();
        finalText = results.filter(result => result.isFinal).map(result => result[0].transcript).join(' ').trim();
        setState(previous => ({ ...previous, transcript: text }));
        if (results.length && results.every(result => result.isFinal)) finish();
      };
      instance.onerror = event => { if (isCurrent()) fail(errors[event.error] || 'Speech recognition failed. Please retry or skip this question.'); };
      instance.onend = finish;
      setState({ ...initial, status: 'starting' });
      timer.current = setTimeout(() => { if (isCurrent()) fail('Recording timed out. Check the microphone permission prompt and try again.'); }, 30_000);
      instance.start();
    } catch (error) {
      fail((error as { name?: string })?.name === 'NotAllowedError' ? errors['not-allowed'] : 'The microphone could not start. Check browser/device permissions, then retry.');
    }
  };
  const stop = () => {
    const instance = recognition.current;
    if (!instance) return;
    setState(previous => ({ ...previous, status: 'stopping' }));
    try { instance.stop(); } catch { dispose(); setState({ ...initial, status: 'error', error: 'Recording stopped without a result. Please retry.' }); }
    if (recognition.current === instance) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { dispose(); setState({ ...initial, status: 'error', error: 'No final speech result arrived. Please retry.' }); }, 5000);
    }
  };
  return { ...state, start, stop, reset, busy: ['starting', 'listening', 'stopping'].includes(state.status) };
}
