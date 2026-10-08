import { hasConsent } from './privacyManager';

export interface AdSenseConfig {
  clientId: string; // e.g. "ca-pub-1234567890123456"
  bannerSlotId?: string;
  inFeedSlotId?: string;
  rewardedSlotId?: string; // e.g. "9876543210"
  isEnabled: boolean;
  testMode: boolean;
}

const ADSENSE_STORAGE_KEY = 'singlish_guru_adsense_config_v1';

export function getSavedAdSenseConfig(): AdSenseConfig {
  const envClientId = (import.meta as any).env?.VITE_ADSENSE_CLIENT_ID || '';
  const envBannerSlot = (import.meta as any).env?.VITE_ADSENSE_SLOT_BANNER || '';
  const envRewardedSlot = (import.meta as any).env?.VITE_ADSENSE_SLOT_REWARDED || '';

  // Ads stay disabled until a real production publisher/slot is configured.
  // Never ship a fallback publisher ID: it can load another account's ads and
  // makes consent and revenue ownership ambiguous.
  const activeClientId = envClientId;
  const activeSlotId = envBannerSlot;

  const defaultConfig: AdSenseConfig = {
    clientId: activeClientId,
    bannerSlotId: activeSlotId,
    inFeedSlotId: '',
    rewardedSlotId: envRewardedSlot || activeSlotId,
    isEnabled: Boolean(activeClientId && activeSlotId),
    testMode: false,
  };

  if (typeof window === 'undefined') return defaultConfig;

  try {
    const raw = localStorage.getItem(ADSENSE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultConfig,
        ...parsed,
        // If localStorage has clientId, keep it, else fallback to active
        clientId: parsed.clientId || activeClientId,
        bannerSlotId: parsed.bannerSlotId || activeSlotId,
        rewardedSlotId: parsed.rewardedSlotId || activeSlotId,
      };
    }
  } catch (e) {
    console.warn('Failed to parse AdSense config from localStorage', e);
  }

  return defaultConfig;
}

export function saveAdSenseConfig(config: AdSenseConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADSENSE_STORAGE_KEY, JSON.stringify(config));
    if (config.clientId && config.isEnabled) {
      injectAdSenseScript(config.clientId);
    }
  } catch (e) {
    console.warn('Failed to save AdSense config to localStorage', e);
  }
}

export function injectAdSenseScript(clientId: string): void {
  if (typeof window === 'undefined' || !clientId || !hasConsent('advertising')) return;

  const scriptId = 'google-adsense-script';
  const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

  // Clean clientId format: ensure ca-pub- prefix
  const cleanId = clientId.startsWith('ca-pub-') ? clientId : `ca-pub-${clientId.replace(/[^0-9]/g, '')}`;

  if (existingScript) {
    if (!existingScript.src.includes(cleanId)) {
      existingScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanId}`;
    }
    return;
  }

  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cleanId}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}
