import React, { useEffect, useState } from 'react';
import { Bot, Cookie, Mic, Shield, Trash2, X } from 'lucide-react';
import { getPrivacyChoices, savePrivacyChoices } from '../utils/privacyManager';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearLearningData: () => void;
  onClearAllLocalData: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onClearLearningData,
  onClearAllLocalData,
}) => {
  const [ai, setAi] = useState(false);
  const [microphone, setMicrophone] = useState(false);
  const [advertising, setAdvertising] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const choices = getPrivacyChoices();
    setAi(choices.ai);
    setMicrophone(choices.microphone);
    setAdvertising(choices.advertising);
    setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const save = () => {
    const previous = getPrivacyChoices();
    savePrivacyChoices({ ai, microphone, advertising });
    setSaved(true);
    if (previous.advertising && !advertising) window.location.reload();
  };

  const consentRow = (
    icon: React.ReactNode,
    title: string,
    description: string,
    checked: boolean,
    setChecked: (value: boolean) => void,
  ) => (
    <label className="flex items-start gap-3 rounded-2xl border border-[#e7e2d9] p-4 bg-white cursor-pointer">
      <span className="mt-0.5 text-[#b45309]">{icon}</span>
      <span className="flex-1">
        <span className="block font-bold text-[#1c1917] text-sm">{title}</span>
        <span className="block text-xs text-[#57534e] mt-1 leading-relaxed">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          setChecked(event.target.checked);
          setSaved(false);
        }}
        className="mt-1 h-4 w-4 accent-[#b45309]"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#e7e2d9]">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#e7e2d9] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center border border-[#fde68a]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1c1917]">Privacy & Consent Settings</h3>
              <p className="text-xs text-[#78716c]">ඔබේ දත්ත භාවිතය ඔබට පාලනය කළ හැක</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close privacy settings" className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          <p className="text-xs text-stone-600 leading-relaxed">Optional Google sign-in is managed by Firebase Authentication, which stores your authentication profile. This app uses your verified Firebase user ID, name and email for your session and account-based AI limits. An encrypted, HTTP-only session cookie expires after 24 hours. Use Sign out in the top-right corner to remove it from this browser. Firebase sign-in tokens are held in memory only while signing in. When signed in and using Lessons, your Firebase user ID, name, email, completed lesson IDs, lesson-quiz attempts and timestamps are stored in Turso for cross-device progress. A passed lesson quiz completes that lesson automatically. Guest lesson completions are uploaded only if you choose Import guest lessons; guest quiz attempts are not uploaded by that button. General-practice scores, XP, badges and flashcards are not synced.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed">
            Core lessons, flashcards, and locally calculated practice scores work without optional consent. AI, microphone, and advertising choices can be changed independently at any time.
          </div>

          <div className="space-y-3">
            {consentRow(
              <Bot className="w-5 h-5" />,
              'AI processing · Gemini',
              'Allows chat messages, up to six recent chat messages, quiz topics, and pronunciation transcripts to be sent through our server to Google Gemini. We do not include your anonymous quota ID in the Gemini prompt.',
              ai,
              setAi,
            )}
            {consentRow(
              <Mic className="w-5 h-5" />,
              'Microphone and speech recognition',
              'Allows the browser speech-recognition service to process speech after you press a microphone button. Singlish Guru does not intentionally store raw audio. The recognized text may be sent to Gemini only when AI processing is also enabled.',
              microphone,
              setMicrophone,
            )}
            {consentRow(
              <Cookie className="w-5 h-5" />,
              'Advertising cookies and Google AdSense',
              'Allows the Google AdSense script to load. Google and its partners may use cookies or similar technologies according to their policies. Ads remain disabled when this choice is off.',
              advertising,
              setAdvertising,
            )}
          </div>

          <div className="space-y-3 text-xs text-[#57534e] leading-relaxed border-t border-[#e7e2d9] pt-5">
            <h4 className="font-bold text-sm text-[#1c1917]">What is stored locally</h4>
            <p>Learning progress, mastered flashcards, consent choices, optional ad configuration, and a random anonymous ID are stored in this browser. Signed-in lesson caches and pending saves are stored separately for each Firebase user ID; guest lesson records are separate. These local caches are not encrypted, so avoid shared browser profiles for private data. The anonymous ID is used with network information to enforce daily AI limits.</p>
            <p>AI quota counters are held temporarily in server memory. Server operational logs contain request IDs and error messages, not learner prompts by design. Hosting and third-party providers may maintain their own technical logs.</p>
            <p>
              Learn more from{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-[#b45309] underline">Google Privacy Policy</a>
              {' '}and manage ad personalization in{' '}
              <a href="https://myadcenter.google.com/" target="_blank" rel="noreferrer" className="text-[#b45309] underline">Google My Ad Center</a>.
            </p>
            <p>Questions or cloud-data deletion requests: <strong>sriandsritech@gmail.com</strong>. The first button below resets local XP, badges and flashcards only. Clear all local data also removes cached and unsynced lesson completions; it does not delete records already saved in Turso or your Firebase account. Cloud lesson completions are downloaded again when you sign in and open Lessons.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 border-t border-[#e7e2d9] pt-5">
            <button
              type="button"
              onClick={() => window.confirm('Clear XP, badges, and mastered flashcards?') && onClearLearningData()}
              className="px-4 py-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear local XP, badges & flashcards
            </button>
            <button
              type="button"
              onClick={() => window.confirm('Clear all local data and consent choices, including unsynced lessons? This does not delete cloud progress.') && onClearAllLocalData()}
              className="px-4 py-3 rounded-xl border border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear all local data
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-[#e7e2d9] bg-[#faf8f5] flex flex-wrap items-center justify-between gap-3 rounded-b-3xl shrink-0">
          <span className="text-[11px] text-[#78716c]">Privacy notice updated October 7, 2026</span>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-emerald-700 font-semibold">Saved</span>}
            <button onClick={save} className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold cursor-pointer">
              Save choices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
