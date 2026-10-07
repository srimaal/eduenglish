import { describe, expect, it, vi } from 'vitest';
import {
  OPEN_PRIVACY_EVENT,
  PRIVACY_CHANGED_EVENT,
  clearSinglishGuruLocalData,
  getPrivacyChoices,
  hasConsent,
  requireConsent,
  savePrivacyChoices,
} from './privacyManager';

describe('privacy choices', () => {
  it('defaults every optional category to denied', () => {
    expect(getPrivacyChoices()).toEqual(expect.objectContaining({ ai: false, microphone: false, advertising: false }));
  });

  it('persists consent and announces the change', () => {
    const listener = vi.fn();
    window.addEventListener(PRIVACY_CHANGED_EVENT, listener);
    savePrivacyChoices({ ai: true, microphone: false, advertising: false });
    expect(hasConsent('ai')).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(PRIVACY_CHANGED_EVENT, listener);
  });

  it('opens privacy controls when required consent is absent', () => {
    const listener = vi.fn();
    window.addEventListener(OPEN_PRIVACY_EVENT, listener);
    expect(requireConsent('microphone')).toBe(false);
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener(OPEN_PRIVACY_EVENT, listener);
  });

  it('clears only Singlish Guru data', () => {
    localStorage.setItem('singlish_guru_example', 'private');
    localStorage.setItem('unrelated_app', 'keep');
    clearSinglishGuruLocalData();
    expect(localStorage.getItem('singlish_guru_example')).toBeNull();
    expect(localStorage.getItem('unrelated_app')).toBe('keep');
  });
});
