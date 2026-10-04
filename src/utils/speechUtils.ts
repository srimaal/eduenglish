import { PronunciationResult, WordAnalysis } from '../types';

// Web Speech Synthesis
export const speakEnglish = (
  text: string,
  rate: number = 0.85,
  pitch: number = 1.0,
  onEnd?: () => void
): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();

  const cleanText = text.replace(/\[.*?\]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-GB'; // British/International English fits Sri Lankan English teaching tradition best
  utterance.rate = rate; // 0.75 for slow, 1.0 for normal
  utterance.pitch = pitch;

  // Try to pick a natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en-IN') || v.name.includes('Natural')) ||
    voices.find((v) => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = (): void => {
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
    feedbackSinhala = 'විශිෂ්ටයි පුතා! ඔබ ඉතා පැහැදිලිව සහ නිවැරදිව උච්චාරණය කළා. මෙලෙසම ඉදිරියට යන්න!';
  } else if (accuracyScore >= 70) {
    feedbackSinhala = 'හොඳ උත්සාහයක්! බොහෝ වචන නිවැරදියි. රතු පාටින් ඇති වචන තව වරක් සෙමෙන් ශබ්ද නගා පුරුදු වෙමු.';
  } else if (accuracyScore >= 40) {
    feedbackSinhala = 'උත්සාහය අගය කරනවා! බය වෙන්න එපා. "සර් කියන හඬ අසන්න" බොත්තම ඔබා නිවැරදි හඬට සවන් දී නැවත කියන්න.';
  } else {
    feedbackSinhala = 'කලබල නොවී නැවත උත්සාහ කරන්න පුතා. මයික්‍රෆෝනය ළඟට ගෙන එක් එක් වචනය පැහැදිලිව ශබ්ද කරන්න.';
  }

  return {
    target,
    transcript,
    accuracyScore,
    words: wordsAnalysis,
    feedbackSinhala,
  };
}
