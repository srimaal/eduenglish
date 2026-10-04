import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  HelpCircle,
  BookOpen,
  User,
  GraduationCap
} from 'lucide-react';
import { speakEnglish, isSpeechRecognitionSupported } from '../utils/speechUtils';
import { CowTeacherAvatar } from './CowTeacherAvatar';

interface AskSirChatProps {
  audioSpeed: number;
  onChatSent?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'sir',
    text: `ආයුබෝවන් පැටියෝ! මම ඩේසි ගුරුතුමිය (Teacher Daisy). ඉංග්‍රීසි කතා කිරීමේදී ඔබට තියෙන ඕනෑම සැකයක්, සිංහලෙන් හිතන දේවල් ඉංග්‍රීසියට හරවාගන්නා හැටි, හෝ උච්චාරණ ගැටලුවක් මගෙන් කෙළින්ම අහන්න. බය නැතුව ඉගෙන ගනිමු!`,
    timestamp: 'Just now',
  },
];

const SUGGESTED_QUESTIONS = [
  'Teacher, "මට හෙට නිවාඩු ඕනෙ" ඉංග්‍රීසියෙන් ආචාරශීලීව කියන්නේ කොහොමද?',
  'Teacher, "Borrow" සහ "Lend" අතර වෙනස සරලව තේරුම් කර දෙන්න.',
  'Teacher, "Open the fan" නොකියා "Turn on the fan" කියන්නේ ඇයි?',
  'Teacher, job interview එකකදී මාව හඳුන්වා දෙන්න හොඳම සරල වාක්‍ය 3ක් මොනවාද?',
];

export const AskSirChat: React.FC<AskSirChatProps> = ({
  audioSpeed,
  onChatSent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    if (onChatSent) {
      onChatSent();
    }

    try {
      const response = await fetch('/api/chat-with-sir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const sirMessage: ChatMessage = {
          id: `sir-${Date.now()}`,
          sender: 'sir',
          text: data.reply || 'හොඳ ප්‍රශ්නයක් පැටියෝ! දිගටම පුරුදු වෙන්න.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, sirMessage]);
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMessage: ChatMessage = {
        id: `sir-${Date.now()}`,
        sender: 'sir',
        text: 'පැටියෝ, ඕනෑම ඉංග්‍රීසි වාක්‍යයක් ගොඩනගද්දී මුලින්ම කර්තෘ, ඊළඟට ක්‍රියාව, අන්තිමට කර්මය (S-V-O) එන බව මතක තබාගන්න. තව ප්‍රශ්නයක් අහන්න!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('හඬින් ඇසීම සඳහා Google Chrome බ්‍රවුසරය භාවිතා කරන්න.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Speaks any English sentences found in the message
  const handleReadEnglishParts = (text: string) => {
    const matches = text.match(/"([^"]+)"/) || text.match(/'([^']+)'/);
    if (matches && matches[1]) {
      speakEnglish(matches[1], audioSpeed, 1.1);
    } else {
      speakEnglish(text, audioSpeed, 1.1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CowTeacherAvatar size="md" showBadge />
          <div>
            <h3 className="font-bold text-base text-[#1c1917] flex items-center gap-1.5">
              <span>ඩේසි ගුරුතුමියගේ Spoken English උපදෙස් කුටිය</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Teacher Daisy</span>
            </h3>
            <p className="text-xs text-[#78716c]">
              සිංහලෙන් හෝ ඉංග්‍රීසියෙන් ඕනෑම ගැටලුවක් කෙළින්ම අහන්න
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-[#15803d] font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>ගුරුතුමිය Online</span>
          </div>
        </div>
      </div>

      {/* Suggested quick questions */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-[#78716c] uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#b45309]" />
          <span>නිතර අසන ප්‍රශ්න (Quick Questions)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-white hover:bg-[#fef3c7] text-[#57534e] hover:text-[#92400e] border border-[#e7e2d9] hover:border-[#b45309] rounded-xl px-3 py-1.5 transition-colors text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-2xl border border-[#e7e2d9] p-4 sm:p-6 shadow-xs min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isSir = msg.sender === 'sir';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isSir ? 'justify-start' : 'justify-end'}`}
            >
              {isSir && (
                <div className="shrink-0 mt-0.5">
                  <CowTeacherAvatar size="sm" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isSir
                    ? 'bg-[#fcfaf7] border border-[#e7ded0] text-[#1c1917]'
                    : 'bg-[#b45309] text-white'
                }`}
              >
                <div className="whitespace-pre-line font-normal">{msg.text}</div>

                <div
                  className={`flex items-center justify-between gap-3 mt-2 pt-2 border-t text-[11px] ${
                    isSir ? 'border-[#e7ded0] text-[#78716c]' : 'border-amber-700/50 text-amber-200'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {isSir && (
                    <button
                      onClick={() => handleReadEnglishParts(msg.text)}
                      className="inline-flex items-center gap-1 text-[#b45309] hover:underline font-semibold cursor-pointer"
                      title="ඉංග්‍රීසි වාක්‍ය හඬින් අසන්න"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>හඬ අසන්න</span>
                    </button>
                  )}
                </div>
              </div>

              {!isSir && (
                <div className="w-8 h-8 rounded-lg bg-stone-300 text-stone-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-[#78716c] italic animate-pulse">
            <CowTeacherAvatar size="sm" />
            <div className="bg-[#fcfaf7] border border-[#e7ded0] rounded-xl px-4 py-2.5">
              ඩේසි ගුරුතුමිය පිළිතුර ලියමින් සිටී...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white rounded-2xl border border-[#e7e2d9] p-3 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse border-rose-600'
                : 'bg-[#faf8f5] text-[#57534e] hover:text-[#1c1917] border-[#e7e2d9]'
            }`}
            title="මයික්‍රෆෝනයෙන් ප්‍රශ්නය අසන්න"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-[#b45309]" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="සිංහලෙන් හෝ ඉංග්‍රීසියෙන් සර් ගෙන් අහන්න..."
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">යවන්න</span>
          </button>
        </form>
      </div>
    </div>
  );
};
