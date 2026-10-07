export type ConsentCategory = 'ai' | 'microphone' | 'advertising';

export interface PrivacyChoices {
  version: 1;
  ai: boolean;
  microphone: boolean;
  advertising: boolean;
  updatedAt: string;
}

const CONSENT_KEY = 'singlish_guru_privacy_choices_v1';
export const OPEN_PRIVACY_EVENT = 'singlish-guru:open-privacy';
export const PRIVACY_CHANGED_EVENT = 'singlish-guru:privacy-changed';

export function getPrivacyChoices(): PrivacyChoices {
  const defaults: PrivacyChoices = {
    version: 1,
    ai: false,
    microphone: false,
    advertising: false,
    updatedAt: '',
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (saved?.version === 1) return { ...defaults, ...saved };
  } catch {
    // Invalid consent data is treated as no consent.
  }
  return defaults;
}

export function savePrivacyChoices(choices: Omit<PrivacyChoices, 'version' | 'updatedAt'>): void {
  const saved: PrivacyChoices = {
    version: 1,
    ...choices,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(saved));
  window.dispatchEvent(new CustomEvent(PRIVACY_CHANGED_EVENT, { detail: saved }));
}

export function hasConsent(category: ConsentCategory): boolean {
  return getPrivacyChoices()[category] === true;
}

export function requireConsent(category: ConsentCategory): boolean {
  if (hasConsent(category)) return true;
  window.dispatchEvent(new CustomEvent(OPEN_PRIVACY_EVENT, { detail: { category } }));
  return false;
}

export function clearSinglishGuruLocalData(): void {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith('singlish_guru_'));
  keys.forEach((key) => localStorage.removeItem(key));
}
