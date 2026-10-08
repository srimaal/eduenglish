export type SpeechCorrection = { expected?: string; heard?: string; kind: 'match' | 'missing' | 'different' | 'extra' };
export type SpeechAssessment = { score: number; passed: boolean; corrections: SpeechCorrection[] };

function words(text: string): string[] {
  const contractions: Record<string, string> = {
    "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
    "can't": 'cannot', "won't": 'will not', "don't": 'do not', "doesn't": 'does not',
    "didn't": 'did not', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not',
    "weren't": 'were not', "couldn't": 'could not', "wouldn't": 'would not', "shouldn't": 'should not',
    "i've": 'i have', "we've": 'we have', "they've": 'they have', "you've": 'you have',
    "i'll": 'i will', "you'll": 'you will', "we'll": 'we will', "they'll": 'they will',
  };
  return text.slice(0, 4000).toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\b[a-z]+'[a-z]+\b/g, token => contractions[token] || token)
    .replace(/\bcan not\b/g, 'cannot').replace(/[^a-z0-9'\s]/g, ' ')
    .trim().split(/\s+/).filter(Boolean).slice(0, 200);
}

// Word-level edit distance, not acoustic/phoneme analysis. Order and extra words matter.
export function assessSpokenAnswer(target: string, transcript: string): SpeechAssessment {
  const expected = words(target), heard = words(transcript);
  const matrix = Array.from({ length: expected.length + 1 }, (_, i) =>
    Array.from({ length: heard.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= expected.length; i++) for (let j = 1; j <= heard.length; j++) {
    matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1,
      matrix[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1));
  }
  const corrections: SpeechCorrection[] = [];
  let i = expected.length, j = heard.length;
  while (i || j) {
    if (i && j && matrix[i][j] === matrix[i - 1][j - 1] + (expected[i - 1] === heard[j - 1] ? 0 : 1)) {
      corrections.push({ expected: expected[i - 1], heard: heard[j - 1], kind: expected[i - 1] === heard[j - 1] ? 'match' : 'different' }); i--; j--;
    } else if (i && matrix[i][j] === matrix[i - 1][j] + 1) {
      corrections.push({ expected: expected[--i], kind: 'missing' });
    } else { corrections.push({ heard: heard[--j], kind: 'extra' }); }
  }
  const edits = matrix[expected.length][heard.length];
  return { score: expected.length ? Math.max(0, Math.round(100 * (1 - edits / expected.length))) : 0,
    passed: expected.length > 0 && heard.length > 0 && edits === 0, corrections: corrections.reverse() };
}
