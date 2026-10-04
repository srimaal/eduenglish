import React, { useState } from 'react';
import {
  AdSenseConfig,
  getSavedAdSenseConfig,
  saveAdSenseConfig,
  injectAdSenseScript,
} from '../utils/adsenseManager';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Save,
  Trash2,
} from 'lucide-react';

interface AdSenseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: AdSenseConfig) => void;
}

export const AdSenseConfigModal: React.FC<AdSenseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<AdSenseConfig>(getSavedAdSenseConfig());
  const [clientIdInput, setClientIdInput] = useState<string>(config.clientId || '');
  const [bannerSlotInput, setBannerSlotInput] = useState<string>(config.bannerSlotId || '');
  const [inFeedSlotInput, setInFeedSlotInput] = useState<string>(config.inFeedSlotId || '');
  const [rewardedSlotInput, setRewardedSlotInput] = useState<string>(config.rewardedSlotId || '');
  const [isEnabled, setIsEnabled] = useState<boolean>(config.isEnabled);
  const [testMode, setTestMode] = useState<boolean>(config.testMode);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    let trimmedClientId = clientIdInput.trim();

    if (isEnabled && !trimmedClientId) {
      setValidationError('කරුණාකර ඔබගේ AdSense Publisher ID (ca-pub-...) ඇතුළත් කරන්න.');
      return;
    }

    if (trimmedClientId && !trimmedClientId.startsWith('ca-pub-')) {
      // Auto prepend ca-pub- if only digits were typed
      const digitsOnly = trimmedClientId.replace(/[^0-9]/g, '');
      if (digitsOnly.length >= 10) {
        trimmedClientId = `ca-pub-${digitsOnly}`;
      } else {
        setValidationError('Publisher ID එක "ca-pub-XXXXXXXXXXXXXXXX" ආකෘතියෙන් විය යුතුය.');
        return;
      }
    }

    const updated: AdSenseConfig = {
      clientId: trimmedClientId,
      bannerSlotId: bannerSlotInput.trim(),
      inFeedSlotId: inFeedSlotInput.trim(),
      rewardedSlotId: rewardedSlotInput.trim(),
      isEnabled: isEnabled && Boolean(trimmedClientId),
      testMode,
    };

    saveAdSenseConfig(updated);
    setConfig(updated);
    setClientIdInput(trimmedClientId);
    setSaveSuccess(true);

    if (updated.clientId && updated.isEnabled) {
      injectAdSenseScript(updated.clientId);
    }

    if (onConfigSaved) onConfigSaved(updated);

    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    if (confirm('ඔබට AdSense තොරතුරු ඉවත් කිරීමට අවශ්‍යද?')) {
      const resetConfig: AdSenseConfig = {
        clientId: '',
        bannerSlotId: '',
        inFeedSlotId: '',
        rewardedSlotId: '',
        isEnabled: false,
        testMode: false,
      };
      saveAdSenseConfig(resetConfig);
      setConfig(resetConfig);
      setClientIdInput('');
      setBannerSlotInput('');
      setInFeedSlotInput('');
      setRewardedSlotInput('');
      setIsEnabled(false);
      if (onConfigSaved) onConfigSaved(resetConfig);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#e7e2d9] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#e7e2d9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-bold text-lg border border-[#fde68a] shrink-0">
              Ad
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#1c1917]">
                Google AdSense Setup
              </h3>
              <p className="text-xs text-[#78716c]">
                Google AdSense දැන්වීම් ඒකාබද්ධ කිරීම
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {validationError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>AdSense තොරතුරු සාර්ථකව සුරැකිණි! දැන්වීම් සක්‍රිය වේ.</span>
            </div>
          )}

          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] border border-[#e7ded0]">
            <div>
              <span className="text-xs font-bold text-[#1c1917] block">
                AdSense දැන්වීම් සක්‍රිය කරන්න (Enable Ads)
              </span>
              <span className="text-[11px] text-[#78716c]">
                Singlish Guru වෙබ් අඩවියේ AdSense බැනර් පෙන්වයි
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b45309]" />
            </label>
          </div>

          {/* Publisher ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1c1917] flex items-center justify-between">
              <span>Google AdSense Publisher ID (Client ID) *</span>
              <span className="text-[10px] text-[#b45309] font-mono">ca-pub-XXXXXXXXXXXXXXXX</span>
            </label>
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="e.g. ca-pub-1234567890123456"
              className="w-full bg-[#faf8f5] border border-[#d6cfc4] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309] focus:bg-white font-mono"
            />
            <p className="text-[11px] text-[#78716c]">
              Google AdSense ගිණුමේ: <strong>Account &gt; Settings &gt; Account information &gt; Publisher ID</strong> වෙතින් ලබාගත හැක.
            </p>
          </div>

          {/* Ad Slot ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1c1917] flex items-center justify-between">
              <span>Banner Ad Slot ID (විකල්ප - Optional)</span>
              <span className="text-[10px] text-[#78716c]">10-digit number</span>
            </label>
            <input
              type="text"
              value={bannerSlotInput}
              onChange={(e) => setBannerSlotInput(e.target.value)}
              placeholder="e.g. 9876543210 (Leave blank for Auto Ads)"
              className="w-full bg-[#faf8f5] border border-[#d6cfc4] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309] focus:bg-white font-mono"
            />
          </div>

          {/* Google Rewarded Ad Slot Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1c1917] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Google Ad Slot ID for Rewards (ත්‍යාග දැන්වීම් Slot ID)</span>
                <span className="text-[10px] bg-amber-100 text-[#b45309] px-1.5 py-0.2 rounded font-semibold">Display Ad</span>
              </span>
              <span className="text-[10px] text-[#78716c]">10-digit number</span>
            </label>
            <input
              type="text"
              value={rewardedSlotInput}
              onChange={(e) => setRewardedSlotInput(e.target.value)}
              placeholder="e.g. 1234567890 (AdSense 'Display ads' slot)"
              className="w-full bg-[#faf8f5] border border-[#d6cfc4] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309] focus:bg-white font-mono"
            />
            <p className="text-[11px] text-[#78716c]">
              Google AdSense හි <strong>"Display ads"</strong> (පළමු නිල් කොටුව) තෝරා සාදාගත් 10-digit Slot ID එක මෙතැනට යොදන්න.
            </p>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] border border-[#e7ded0]">
            <div>
              <span className="text-xs font-semibold text-[#1c1917] block">
                පරීක්ෂණ මාදිලිය (Test Mode - data-adtest)
              </span>
              <span className="text-[11px] text-[#78716c]">
                සැබෑ ක්ලික් ගණනය නොවී පරීක්ෂණ දැන්වීම් පමණක් පෙන්වයි
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Instruction Guide Card */}
          <div className="bg-[#fcfaf7] border border-[#e7ded0] rounded-2xl p-4 text-xs text-[#57534e] space-y-2">
            <div className="font-bold text-[#b45309] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>AdSense අනුමැතිය සහ සක්‍රිය කිරීම:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>ඔබගේ AdSense Publisher ID සුරකින විට, අදාළ නිල Google AdSense script ස්වයංක්‍රීයව එක්වේ.</li>
              <li>Google AdSense ගිණුමෙන් මෙම වෙබ් අඩවියේ URL එක (Domain/Subdomain) අනුමත (Sites list) කර තිබිය යුතුය.</li>
              <li>පරිසර විචල්‍ය (Env Var) ලෙස <code>VITE_ADSENSE_CLIENT_ID</code> ද භාවිතා කළ හැක.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ඉවත් කරන්න (Clear)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#d6cfc4] text-[#57534e] hover:bg-[#faf8f5] text-xs font-semibold cursor-pointer"
              >
                අවලංගු කරන්න
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>සුරකින්න (Save AdSense)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
