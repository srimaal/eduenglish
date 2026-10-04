import React, { useEffect, useRef, useState } from 'react';
import { getSavedAdSenseConfig } from '../utils/adsenseManager';

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

  // If AdSense is not configured or disabled, don't show any placeholder
  if (!isEnabled) {
    return null;
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
