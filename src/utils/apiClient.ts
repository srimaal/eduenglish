import { requireConsent } from './privacyManager';

const ANONYMOUS_ID_KEY = 'singlish_guru_anonymous_id_v1';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function createAnonymousId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return 'server-render';
  const saved = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (saved) return saved;
  const created = createAnonymousId();
  localStorage.setItem(ANONYMOUS_ID_KEY, created);
  return created;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  if (!requireConsent('ai')) {
    throw new ApiError('AI processing consent is required.', 451, 'CONSENT_REQUIRED');
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Anonymous-Id': getAnonymousId(),
      'X-Privacy-Consent': 'ai-v1',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({})) as {
    error?: string;
    code?: string;
  };

  if (!response.ok) {
    throw new ApiError(data.error || 'The service is temporarily unavailable.', response.status, data.code);
  }
  return data as T;
}

export function aiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') {
    return 'AI සේවාව භාවිතා කිරීමට Privacy Settings තුළ අවසරය ලබා දෙන්න.';
  }
  if (error instanceof ApiError && error.status === 429) {
    return 'අද දිනට හිමි AI වාර ගණන අවසන්. හෙට නැවත උත්සාහ කරන්න.';
  }
  if (error instanceof ApiError && error.status === 503) {
    return 'AI සේවාව තාවකාලිකව සකස් කර නැත. පසුව නැවත උත්සාහ කරන්න.';
  }
  return 'ඩේසි ගුරුතුමිය දැනට කාර්යබහුලයි. සුළු මොහොතකින් නැවත උත්සාහ කරන්න.';
}
