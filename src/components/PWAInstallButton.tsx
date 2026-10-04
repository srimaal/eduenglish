import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, CheckCircle, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running inside standalone app, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          disabled={installing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-medium text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-[#fde68a]" />
          <span>{installing ? 'Installing...' : 'Install Mobile App (App එක දාගන්න)'}</span>
        </button>

        {showGuide && (
          <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#b45309] font-medium text-xs border border-[#b45309]/30 transition-all cursor-pointer"
        title="Install Singlish Guru as a Mobile App on your Phone"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Install App</span>
        <span className="xs:hidden">App</span>
      </button>

      {showGuide && (
        <InstallGuideModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
};

interface InstallGuideModalProps {
  isIOS: boolean;
  onClose: () => void;
}

const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isIOS, onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-[#e7e2d9] text-[#1c1917]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#78716c] hover:bg-[#f5f2eb] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#d97706] to-[#92400e] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            SG
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1c1917]">
              Install Singlish Guru App
            </h3>
            <p className="text-xs text-[#78716c]">
              ස්මාර්ට්ෆෝන් එකට ඇප් එකක් ලෙස එකතු කරගන්න
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-3.5 text-xs text-[#44403c] bg-[#faf8f5] p-4 rounded-xl border border-[#e7ded0]">
            <p className="font-semibold text-[#1c1917] flex items-center gap-1.5">
              <span>Apple iPhone / iPad (Safari Browser) උපදෙස්:</span>
            </p>
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-white border border-[#e7ded0] text-[#b45309]">
                <Share className="w-4 h-4" />
              </div>
              <p>
                <strong>1.</strong> Safari බ්‍රවුසරයේ පහළ ඇති <strong>Share</strong> බොත්තම ඔබන්න.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-white border border-[#e7ded0] text-[#b45309]">
                <PlusSquare className="w-4 h-4" />
              </div>
              <p>
                <strong>2.</strong> මඳක් පහළට ගොස් <strong>"Add to Home Screen"</strong> (මුල් තිරයට එක් කරන්න) තෝරන්න.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-white border border-[#e7ded0] text-[#16a34a]">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p>
                <strong>3.</strong> ඉහළ දකුණු කෙළවරේ ඇති <strong>"Add"</strong> ඔබන්න. දැන් ඔබගේ හෝම් ස්ක්‍රීන් එකේ ඇප් එක ඇත!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 text-xs text-[#44403c] bg-[#faf8f5] p-4 rounded-xl border border-[#e7ded0]">
            <p className="font-semibold text-[#1c1917]">
              Android / Chrome Browser උපදෙස්:
            </p>
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#b45309] bg-white px-2 py-0.5 rounded-md border border-[#e7ded0]">1</span>
              <p>
                Chrome බ්‍රවුසරයේ ඉහළ දකුණු කෙළවරේ ඇති <strong>තිත් තුන (⋮ Menu)</strong> ඔබන්න.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#b45309] bg-white px-2 py-0.5 rounded-md border border-[#e7ded0]">2</span>
              <p>
                <strong>"Install app"</strong> හෝ <strong>"Add to Home screen"</strong> තෝරන්න.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-[#16a34a] bg-white px-2 py-0.5 rounded-md border border-[#e7ded0]">3</span>
              <p>
                <strong>Install</strong> තහවුරු කරන්න. කිසිදු Play Store ගිණුමක් හෝ ඉඩක් නාස්ති නොවී ස්වාධීනව ක්‍රියා කරයි!
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white rounded-xl font-medium text-xs transition-colors cursor-pointer"
          >
            තේරුණා (Understood)
          </button>
        </div>
      </div>
    </div>
  );
};
