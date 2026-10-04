import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#e7e2d9] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e7e2d9] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-bold border border-[#fde68a]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1c1917]">
                Privacy Policy & AdSense Disclosure
              </h3>
              <p className="text-xs text-[#78716c]">
                රහස්‍යතා ප්‍රතිපත්තිය සහ කුකීස් භාවිතය පිළිබඳ දැනුවත් කිරීම
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-[#faf8f5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#57534e] leading-relaxed">
          <div className="bg-[#faf8f5] border border-[#e7ded0] rounded-2xl p-4 space-y-2">
            <h4 className="font-bold text-[#1c1917] text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Google AdSense Compliance Notice</span>
            </h4>
            <p className="text-xs text-[#78716c]">
              This site is configured to comply with Google AdSense Publisher Policies, including transparency around advertising cookies and personalized ad serving.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#1c1917]">1. Information We Collect (අප රැස්කරන තොරතුරු)</h5>
            <p>
              Singlish Guru is an educational spoken English learning platform. We do not sell or collect private personal records without your explicit consent. Your practice progress, quiz scores, and milestone badges are stored locally on your device (using standard browser local storage).
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#1c1917]">2. Google AdSense & Third-Party Cookies (දැන්වීම් සහ කුකීස්)</h5>
            <p>
              When Google AdSense is enabled on this website:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to your sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-[#b45309] underline font-semibold">Google Ads Settings</a>.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#1c1917]">3. Microphone & Voice Recognition Data (හඬ දත්ත)</h5>
            <p>
              When you practice English pronunciation in the Voice Recognition Lab, your speech is processed by your browser's native Web Speech Recognition API purely for real-time acoustic feedback and pronunciation scoring. We do not store or transmit your voice recordings to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#1c1917]">4. Educational Contact & Questions</h5>
            <p>
              For educational questions regarding Sir Sri Maal's spoken curriculum or site inquiries, you can reach out via the in-app teacher desk or at <strong>sriandsritech@gmail.com</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e7e2d9] bg-[#faf8f5] flex items-center justify-between rounded-b-3xl shrink-0">
          <span className="text-[11px] text-[#78716c]">
            Last updated: October 2026 · Compliant with Google AdSense
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            තේරුම් ගත්තා (Understood)
          </button>
        </div>
      </div>
    </div>
  );
};
