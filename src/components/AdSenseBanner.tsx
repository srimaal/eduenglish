import React, { useEffect, useRef, useState } from 'react';
import { getSavedAdSenseConfig } from '../utils/adsenseManager';
import { LayoutGrid, Sparkles, ExternalLink, Settings } from 'lucide-react';

interface AdSenseBannerProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
  onOpenSettings?: () => void;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slotId,
  format = 'auto',
  className = '',
  onOpenSettings,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [isAdLoaded, setIsAdLoaded] = useState<boolean>(false);
  const [adError, setAdError] = useState<boolean>(false);
  const [config, setConfig] = useState(getSavedAdSenseConfig());

  useEffect(() => {
    setConfig(getSavedAdSenseConfig());
  }, []);

  const effectiveClientId = config.clientId;
  const effectiveSlotId = slotId || config.bannerSlotId;
  const isEnabled = config.isEnabled && Boolean(effectiveClientId);

  useEffect(() => {
    if (!isEnabled) return;

    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsAdLoaded(true);
      }
    } catch (e) {
      console.warn('Google AdSense push error or adblocker detected:', e);
      setAdError(true);
    }
  }, [isEnabled, effectiveSlotId]);

  // If AdSense is not configured or disabled, show setup preview banner
  if (!isEnabled) {
    return (
      <div
        className={`bg-gradient-to-r from-[#fbf9f5] via-white to-[#fbf9f5] rounded-2xl border border-dashed border-[#d6cfc4] p-4 text-center text-xs text-[#78716c] transition-all my-6 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0 border border-[#fde68a]">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-[#1c1917] flex items-center gap-1.5">
                <span>Google AdSense Slot Ready</span>
                <span className="text-[10px] bg-[#f5efe6] text-[#b45309] px-1.5 py-0.5 rounded font-mono">
                  ca-pub- ready
                </span>
              </div>
              <p className="text-[11px] text-[#78716c] mt-0.5">
                ඔබගේ Google AdSense Publisher ID (ca-pub-...) ඇතුළත් කර දැන්වීම් සක්‍රිය කරන්න.
              </p>
            </div>
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#d6cfc4] hover:border-[#b45309] hover:bg-[#faf8f5] text-[#1c1917] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#b45309]" />
              <span>AdSense සකසන්න</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={adRef}
      className={`adsense-container overflow-hidden my-6 text-center bg-white/40 rounded-xl p-2 min-h-[90px] flex items-center justify-center ${className}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '250px' }}
        data-ad-client={effectiveClientId}
        data-ad-slot={effectiveSlotId || '1234567890'}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-adtest={config.testMode ? 'on' : undefined}
      />
    </div>
  );
};
