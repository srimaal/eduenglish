import { PronunciationResult, WordAnalysis } from '../types';
import { canUseKokoro, playKokoroSpeech, prepareKokoroAudio, stopKokoroSpeech } from './kokoroSpeech';

let cachedVoices: SpeechSynthesisVoice[] = [];
let speechRunId = 0;

function availableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  availableVoices();
  window.speechSynthesis.addEventListener('voiceschanged', availableVoices);
}

function voiceScore(voice: SpeechSynthesisVoice, language: 'en' | 'si'): number {
  const name = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;
  if (language === 'si') {
    if (lang.startsWith('si')) score += 300;
  } else {
    if (lang === 'en-gb') score += 180;
    else if (lang === 'en-au' || lang === 'en-in') score += 150;
    else if (lang.startsWith('en')) score += 100;
  }
  if (/natural|neural|premium|enhanced|online/.test(name)) score += 100;
  if (/microsoft|google|apple/.test(name)) score += 35;
  if (/sonia|libby|aria|jenny|samantha|karen|moira|serena|zira/.test(name)) score += 25;
  if (voice.localService) score += 8;
  if (/compact|espeak|festival/.test(name)) score -= 40;
  return score;
}

function bestVoice(language: 'en' | 'si'): SpeechSynthesisVoice | null {
  const voices = availableVoices();
  if (!voices.length) return null;
  const candidates = language === 'si'
    ? voices.filter((voice) => voice.lang.toLowerCase().startsWith('si'))
    : voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
  if (!candidates.length) return null;
  return [...candidates].sort((a, b) => voiceScore(b, language) - voiceScore(a, language))[0];
}

// Kept for compatibility with existing imports and browser debugging.
export const getLadyVoice = (): SpeechSynthesisVoice | null => bestVoice('en');

function normalizeSpeechText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)]/g, ' ')
    .replace(/[*_#>`~]/g, '')
    .replace(/\bS-V-O\b/gi, 'subject, verb, object')
    .replace(/\bvs\.?\b/gi, 'versus')
    .replace(/\s*[-–—]\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .trim();
}

function speechSegments(text: string): Array<{ text: string; language: 'en' | 'si' }> {
  const sentences = normalizeSpeechText(text)
    .split(/(?<=[.!?।])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const classified = sentences.map((sentence) => {
    const sinhalaCharacters = (sentence.match(/[\u0D80-\u0DFF]/g) || []).length;
    const latinCharacters = (sentence.match(/[A-Za-z]/g) || []).length;
    const language: 'en' | 'si' = sinhalaCharacters > latinCharacters ? 'si' : 'en';
    return {
      text: sentence,
      language,
    };
  });

  // Keep continuous speech natural by joining adjacent sentences that use the
  // same voice. A new utterance is created only when the language changes.
  return classified.reduce<Array<{ text: string; language: 'en' | 'si' }>>((segments, current) => {
    const previous = segments[segments.length - 1];
    if (previous?.language === current.language) {
      previous.text = `${previous.text} ${current.text}`;
    } else {
      segments.push({ ...current });
    }
    return segments;
  }, []);
}

function speakWithSystemVoice(
  text: string,
  language: 'en' | 'si',
  rate: number,
  pitch: number,
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'si' ? 'si-LK' : 'en-GB';
    utterance.rate = Math.min(1.05, Math.max(0.65, rate));
    utterance.pitch = Math.min(1.08, Math.max(0.92, pitch));
    utterance.volume = 1;
    const voice = bestVoice(language);
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// Kokoro handles English locally; Sinhala and constrained devices use system TTS.
export const speakEnglish = (
  text: string,
  rate: number = 0.9,
  pitch: number = 1.0,
  onEnd?: () => void
): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  const segments = speechSegments(text);
  if (!segments.length) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();
  stopKokoroSpeech();
  prepareKokoroAudio();
  const currentRun = ++speechRunId;

  void (async () => {
    for (const segment of segments) {
      if (currentRun !== speechRunId) return;
      if (segment.language === 'en' && canUseKokoro()) {
        try {
          await playKokoroSpeech(segment.text, rate);
          continue;
        } catch (error) {
          console.warn('Kokoro unavailable; using the system English voice.', error);
        }
      }
      if (currentRun !== speechRunId) return;
      await speakWithSystemVoice(segment.text, segment.language, rate, pitch);
    }
    if (currentRun === speechRunId) onEnd?.();
  })();
};

export const stopSpeech = (): void => {
  speechRunId += 1;
  stopKokoroSpeech();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Check if SpeechRecognition is available in the current browser
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

// Levenshtein distance for fuzzy word matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function cleanWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function comparePronunciation(target: string, transcript: string): PronunciationResult {
  const targetWords = target
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const spokenWords = transcript
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(cleanWord);

  const wordsAnalysis: WordAnalysis[] = [];
  let matchedCount = 0;
  const usedSpokenIndices = new Set<number>();

  for (const rawTargetWord of targetWords) {
    const targetClean = cleanWord(rawTargetWord);
    let matchedStatus: 'perfect' | 'near' | 'missed' = 'missed';
    let recognizedWord: string | undefined = undefined;

    // First pass: exact match
    let foundIndex = -1;
    for (let i = 0; i < spokenWords.length; i++) {
      if (!usedSpokenIndices.has(i) && spokenWords[i] === targetClean) {
        foundIndex = i;
        matchedStatus = 'perfect';
        recognizedWord = spokenWords[i];
        matchedCount += 1;
        break;
      }
    }

    // Second pass: near match (Levenshtein distance <= 2 for words > 3 chars, or distance 1)
    if (foundIndex === -1) {
      for (let i = 0; i < spokenWords.length; i++) {
        if (!usedSpokenIndices.has(i)) {
          const dist = levenshteinDistance(targetClean, spokenWords[i]);
          const maxAllowed = targetClean.length > 4 ? 2 : 1;
          if (dist <= maxAllowed) {
            foundIndex = i;
            matchedStatus = 'near';
            recognizedWord = spokenWords[i];
            matchedCount += 0.75;
            break;
          }
        }
      }
    }

    if (foundIndex !== -1) {
      usedSpokenIndices.add(foundIndex);
    }

    wordsAnalysis.push({
      word: rawTargetWord,
      status: matchedStatus,
      recognizedAs: recognizedWord,
    });
  }

  const rawScore = targetWords.length > 0 ? (matchedCount / targetWords.length) * 100 : 0;
  const accuracyScore = Math.min(100, Math.round(rawScore));

  let feedbackSinhala = '';
  if (accuracyScore >= 90) {
    feedbackSinhala = 'විශිෂ්ටයි පැටියෝ! ඔබ ඉතා පැහැදිලිව සහ නිවැරදිව උච්චාරණය කළා. මෙලෙසම ඉදිරියට යන්න! Moo!';
  } else if (accuracyScore >= 70) {
    feedbackSinhala = 'හොඳ උත්සාහයක්! බොහෝ වචන නිවැරදියි. රතු පාටින් ඇති වචන තව වරක් සෙමෙන් ශබ්ද නගා පුරුදු වෙමු.';
  } else if (accuracyScore >= 40) {
    feedbackSinhala = 'උත්සාහය අගය කරනවා! බය වෙන්න එපා. "ගුරුතුමිය කියන හඬ අසන්න" බොත්තම ඔබා නිවැරදි හඬට සවන් දී නැවත කියන්න.';
  } else {
    feedbackSinhala = 'කලබල නොවී නැවත උත්සාහ කරන්න පැටියෝ. මයික්‍රෆෝනය ළඟට ගෙන එක් එක් වචනය පැහැදිලිව ශබ්ද කරන්න.';
  }

  return {
    target,
    transcript,
    accuracyScore,
    words: wordsAnalysis,
    feedbackSinhala,
  };
}
