import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Trash2,
  Volume2,
} from 'lucide-react';
import { ApiError, apiPost } from '../utils/apiClient';
import { requireConsent } from '../utils/privacyManager';
import { isSpeechRecognitionSupported, speakEnglish } from '../utils/speechUtils';
import { CowTeacherAvatar } from './CowTeacherAvatar';

type ServiceState = 'checking' | 'ready' | 'unconfigured' | 'offline';

interface DaisyMessage {
  id: string;
  role: 'learner' | 'teacher';
  text: string;
  createdAt: Date;
}

interface TeacherDaisyChatProps {
  audioSpeed: number;
  onChatSent?: () => void;
}

const WELCOME_MESSAGE: DaisyMessage = {
  id: 'welcome',
  role: 'teacher',
  text: 'ආයුබෝවන් පැටියෝ! මම ඩේසි ගුරුතුමිය. Spoken English, grammar, pronunciation හෝ දිනපතා භාවිතා කරන වාක්‍ය ගැන මගෙන් අහන්න.',
  createdAt: new Date(),
};

const SUGGESTIONS = [
  '“මට හෙට නිවාඩු ඕනෙ” ඉංග්‍රීසියෙන් ආචාරශීලීව කියන්නේ කොහොමද?',
  'Borrow සහ lend අතර වෙනස පැහැදිලි කරන්න.',
  'Job interview එකකදී මාව හඳුන්වා දෙන්නේ කොහොමද?',
];

export const TeacherDaisyChat: React.FC<TeacherDaisyChatProps> = ({
  audioSpeed,
  onChatSent,
}) => {
  const [messages, setMessages] = useState<DaisyMessage[]>([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [serviceState, setServiceState] = useState<ServiceState>('checking');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const checkService = async () => {
    setServiceState('checking');
    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Health check failed');
      if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('Health endpoint did not return JSON');
      }
      const data = await response.json() as { aiConfigured?: boolean };
      setServiceState(data.aiConfigured ? 'ready' : 'unconfigured');
    } catch {
      setServiceState('offline');
    }
  };

  useEffect(() => {
    checkService();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const submit = async (text = draft) => {
    const question = text.trim();
    if (!question || isSending) return;
    const learnerMessage: DaisyMessage = {
      id: `learner-${crypto.randomUUID()}`,
      role: 'learner',
      text: question,
      createdAt: new Date(),
    };
    const history = messages.slice(-6).map((message) => ({
      sender: message.role === 'learner' ? 'user' : 'teacher',
      text: message.text,
    }));

    setMessages((current) => [...current, learnerMessage]);
    setDraft('');
    setErrorMessage(null);
    setIsSending(true);

    try {
      const result = await apiPost<{ reply: string }>('/api/chat-with-sir', {
        message: question,
        chatHistory: history,
      });
      if (!result.reply?.trim()) throw new Error('Empty teacher reply');
      setServiceState('ready');
      setMessages((current) => [
        ...current,
        {
          id: `teacher-${crypto.randomUUID()}`,
          role: 'teacher',
          text: result.reply.trim(),
          createdAt: new Date(),
        },
      ]);
      onChatSent?.();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') {
        setErrorMessage('Privacy Settings තුළ AI processing සඳහා අවසර ලබාදී නැවත ප්‍රශ්නය යවන්න.');
      } else if (error instanceof ApiError && error.status === 429) {
        setErrorMessage('අද දිනට හිමි නොමිලේ AI ප්‍රශ්න ගණන අවසන්. හෙට නැවත උත්සාහ කරන්න.');
      } else if (error instanceof ApiError && error.status === 503) {
        setServiceState('unconfigured');
        setErrorMessage('Gemini API key එක running server එකට load වී නැත. Server එක restart කර Retry කරන්න.');
      } else {
        setServiceState('offline');
        setErrorMessage('ඩේසි ගුරුතුමිය සමඟ සම්බන්ධ වීමට නොහැකි විය. Retry කර නැවත උත්සාහ කරන්න.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const startVoiceInput = () => {
    if (!requireConsent('microphone')) return;
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage('Voice input සඳහා Chrome හෝ Edge browser එකක් භාවිතා කරන්න.');
      return;
    }
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => setDraft(event.results[0][0].transcript || '');
    recognition.onerror = () => {
      setIsListening(false);
      setErrorMessage('Voice input හඳුනාගැනීමට නොහැකි විය. නැවත උත්සාහ කරන්න.');
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const status = {
    checking: { label: 'Checking AI…', color: 'text-stone-600 bg-stone-100', icon: RefreshCw },
    ready: { label: 'Teacher Daisy online', color: 'text-emerald-800 bg-emerald-50', icon: CheckCircle2 },
    unconfigured: { label: 'Gemini not configured', color: 'text-rose-800 bg-rose-50', icon: AlertCircle },
    offline: { label: 'AI server unreachable', color: 'text-rose-800 bg-rose-50', icon: AlertCircle },
  }[serviceState];
  const StatusIcon = status.icon;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4" aria-label="Chat with Teacher Daisy">
      <header className="bg-white rounded-2xl border border-[#e7e2d9] p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CowTeacherAvatar size="md" showBadge />
          <div className="min-w-0">
            <h2 className="font-bold text-[#1c1917] truncate">ඩේසි ගුරුතුමිය · Teacher Daisy</h2>
            <p className="text-xs text-[#78716c] truncate">Sinhala-friendly spoken English help</p>
          </div>
        </div>
        <button type="button" onClick={checkService} className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 cursor-pointer ${status.color}`}>
          <StatusIcon className={`w-3.5 h-3.5 ${serviceState === 'checking' ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{status.label}</span>
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => submit(suggestion)} disabled={isSending} className="px-3 py-2 rounded-xl bg-white border border-[#e7e2d9] hover:border-amber-400 text-xs text-left cursor-pointer disabled:opacity-50">
            {suggestion}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e7e2d9] shadow-xs overflow-hidden">
        <div className="h-[420px] overflow-y-auto p-4 sm:p-6 space-y-4" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'learner' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'learner' ? 'bg-[#92400e] text-white rounded-br-md' : 'bg-[#faf8f5] border border-[#e7ded0] text-[#1c1917] rounded-bl-md'}`}>
                {message.text}
                {message.role === 'teacher' && (
                  <button type="button" onClick={() => speakEnglish(message.text, audioSpeed, 1.0)} className="mt-2 block text-[#b45309] hover:text-[#78350f] cursor-pointer" aria-label="Read Teacher Daisy response aloud">
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex justify-start"><div className="rounded-2xl bg-[#faf8f5] border border-[#e7ded0] px-4 py-3 text-xs text-[#78716c] flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> ඩේසි ගුරුතුමිය පිළිතුර සකස් කරමින් සිටී…</div></div>
          )}
          <div ref={endRef} />
        </div>

        {errorMessage && (
          <div role="alert" className="mx-4 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2.5 text-xs flex items-center justify-between gap-3">
            <span>{errorMessage}</span>
            <button type="button" onClick={checkService} className="font-bold underline cursor-pointer shrink-0">Retry</button>
          </div>
        )}

        <div className="border-t border-[#e7e2d9] p-3 sm:p-4 flex items-end gap-2">
          <button type="button" onClick={startVoiceInput} disabled={isSending} className={`p-3 rounded-xl border cursor-pointer ${isListening ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-[#57534e] border-[#d6cfc4]'}`} aria-label="Use voice input">
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={2}
            maxLength={1000}
            placeholder="ඩේසි ගුරුතුමියගෙන් අහන්න…"
            className="flex-1 resize-none rounded-xl border border-[#d6cfc4] px-3 py-2.5 text-sm focus:outline-none focus:border-[#b45309]"
          />
          {messages.length > 1 && !draft ? (
            <button type="button" onClick={() => { setMessages([WELCOME_MESSAGE]); setErrorMessage(null); }} className="p-3 rounded-xl text-stone-500 hover:bg-stone-100 cursor-pointer" aria-label="Clear conversation"><Trash2 className="w-4 h-4" /></button>
          ) : (
            <button type="button" onClick={() => submit()} disabled={!draft.trim() || isSending} className="p-3 rounded-xl bg-[#b45309] text-white disabled:bg-stone-300 disabled:cursor-not-allowed cursor-pointer" aria-label="Send message"><Send className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </section>
  );
};
