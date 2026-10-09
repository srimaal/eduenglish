import { LESSONS } from './lessonsData';
import type { PhraseItem } from '../types';

// Version 1 remains readable so attempts queued before the variant rollout can
// still sync. New attempts use version 2 and carry their attempt seed.
export const LEGACY_LESSON_QUIZ_VERSION = 1;
export const LESSON_QUIZ_VERSION = 2;
export const LESSON_QUIZ_PASS_PERCENT = 80;
export type QuizAnswer = number | number[];
export type LessonQuizQuestion = {
  id: string; skill: string; prompt: string; explanation: string;
  type: 'choice' | 'reorder'; options?: string[]; correctIndex?: number;
  tokens?: string[]; correctWords?: string[]; sourcePhraseId?: string;
};
export type LessonQuiz = {
  lessonId: string; title: string; version: number; seed?: string;
  questions: LessonQuizQuestion[]; speakingPhrase: PhraseItem;
};
export type QuizAttempt = {
  attemptId: string; lessonId: string; version: number; seed?: string;
  answers: Record<string, QuizAnswer>;
};
export type QuizGrade = { score: number; correctCount: number; total: number; passed: boolean; correct: boolean[] };

function shuffle<T>(values: T[], seed: number): T[] {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1); [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0 || 1;
}
const normalize = (text: string) => text.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();
const cache = new Map<string, LessonQuiz>();

function basePhraseOrder(lessonNumber: number): number[] {
  const offset = (lessonNumber - 1) % 5;
  return [0, 1, 2, 3, 4].map(index => (offset + index) % 5);
}
function variantPhraseOrder(lessonId: string, lessonNumber: number, seed: string): number[] {
  const base = basePhraseOrder(lessonNumber);
  let order = shuffle([0, 1, 2, 3, 4], hashSeed(`${lessonId}:${seed}:phrases`));
  // A new attempt should not accidentally render the exact legacy sequence.
  if (order.every((value, index) => value === base[index])) order = [...order.slice(1), order[0]];
  return order;
}

function buildQuiz(lessonId: string, version: number, seed?: string): LessonQuiz | null {
  const lesson = LESSONS.find(item => item.id === lessonId);
  if (!lesson) return null;
  const order = version === LESSON_QUIZ_VERSION && seed
    ? variantPhraseOrder(lesson.id, lesson.number, seed)
    : basePhraseOrder(lesson.number);
  const phrase = (index: number) => lesson.phrases[order[index % order.length]];
  const questions: LessonQuizQuestion[] = [];
  const shuffleFor = (values: string[], salt: string) => shuffle(values, hashSeed(`${lesson.id}:${seed || 'legacy'}:${salt}`));
  const choice = (skill: string, prompt: string, answer: string, alternatives: string[], explanation: string, sourcePhraseId?: string) => {
    const index = questions.length;
    const distinct = [...new Map(alternatives.map(value => [normalize(value), value])).values()].filter(value => normalize(value) !== normalize(answer));
    const options = version === LEGACY_LESSON_QUIZ_VERSION
      ? shuffle([answer, ...distinct.slice(0, 3)], lesson.number * 37 + index * 13)
      : shuffleFor([answer, ...distinct.slice(0, 3)], `options-${index}`);
    questions.push({ id: `${lessonId}-q${index + 1}`, type: 'choice', skill, prompt, options,
      correctIndex: options.indexOf(answer), explanation, sourcePhraseId });
  };
  const p0 = phrase(0), p1 = phrase(1), p2 = phrase(2), p3 = phrase(3);
  choice('Meaning → English', `මෙම අදහස ඉංග්‍රීසියෙන් කියන්නේ කෙසේද?\n${p0.sinhala}`, p0.english,
    lesson.phrases.filter(p => p.id !== p0.id).map(p => p.english), `${p0.english}\n${p0.sinhala}\nමෙම අර්ථය සඳහා පාඩමේ යොදා ඇති වාක්‍යය මෙයයි.`, p0.id);
  choice('English → meaning', `මෙම වාක්‍යයේ අර්ථය තෝරන්න.\n${p1.english}`, p1.sinhala,
    lesson.phrases.filter(p => p.id !== p1.id).map(p => p.sinhala), `${p1.english}\n${p1.sinhala}`, p1.id);

  const correctWords = p2.english.replace(/[.,!?;:]/g, '').trim().split(/\s+/);
  let tokens = version === LEGACY_LESSON_QUIZ_VERSION
    ? shuffle(correctWords, lesson.number * 113)
    : shuffle(correctWords, hashSeed(`${lesson.id}:${seed}:tokens`));
  if (tokens.join(' ') === correctWords.join(' ')) tokens = [...tokens.slice(1), tokens[0]];
  questions.push({ id: `${lessonId}-q3`, type: 'reorder', skill: 'Sentence building',
    prompt: `පාඩමේ ඉගෙනගත් වාක්‍යය වචන අනුපිළිවෙළට තබා සාදන්න.\n${p2.sinhala}`,
    tokens, correctWords, sourcePhraseId: p2.id,
    explanation: `${p2.english}\n${p2.sinhala}\nRebuild the model sentence for this exercise. Other word orders may be valid in different contexts.` });

  const sentenceWords = p3.english.split(/\s+/);
  const candidates = sentenceWords.map((word, index) => ({ word: word.replace(/[^a-zA-Z']/g, ''), index }))
    .filter(item => item.word.length >= 4 && !/^(Teacher|Daisy|Nimal|Colombo|Galle|Congratulations)$/i.test(item.word));
  const gapSeed = version === LESSON_QUIZ_VERSION && seed ? hashSeed(`${seed}:gap`) : lesson.number - 1;
  const gap = candidates[gapSeed % candidates.length] || { word: sentenceWords[1].replace(/[^a-zA-Z']/g, ''), index: 1 };
  const masked = sentenceWords.map((word, i) => i === gap.index ? word.replace(gap.word, '_____') : word).join(' ');
  const distractors = lesson.phrases.flatMap(p => p.english.split(/\s+/)).map(word => word.replace(/[^a-zA-Z']/g, ''))
    .filter(word => word.length >= 3 && word.toLowerCase() !== gap.word.toLowerCase());
  choice('Vocabulary in context', `සිංහල අර්ථයට ගැළපෙන ලෙස පාඩමේ වාක්‍යය සම්පූර්ණ කරන්න.\n${p3.sinhala}\n${masked}`,
    gap.word, version === LEGACY_LESSON_QUIZ_VERSION
      ? shuffle([...new Set(distractors)], lesson.number * 19)
      : shuffleFor([...new Set(distractors)], 'gap-options'),
    `Missing word: ${gap.word}\n${p3.english}\n${p3.sinhala}`, p3.id);

  const correction = lesson.commonMistake.correct;
  choice('Usage & correction', `පාඩමේ නිර්දේශිත වඩා සුදුසු යෙදුම තෝරන්න.\n${lesson.commonMistake.contextSinhala ? `${lesson.commonMistake.contextSinhala}\n` : ''}Choose the version recommended in this lesson (consider its context).`,
    correction, [lesson.commonMistake.incorrect], `${correction}\n${lesson.commonMistake.explanationSinhala}`);
  return { lessonId, title: lesson.titleEnglish, version, ...(version === LESSON_QUIZ_VERSION ? { seed } : {}), questions, speakingPhrase: phrase(4) };
}

// Stable v1 form for older queued attempts and review tooling.
export function getLessonQuiz(lessonId: string): LessonQuiz | null {
  const cached = cache.get(lessonId);
  if (cached) return cached;
  const quiz = buildQuiz(lessonId, LEGACY_LESSON_QUIZ_VERSION);
  if (quiz) cache.set(lessonId, quiz);
  return quiz;
}

// Each new assessment uses its attempt ID as a reproducible presentation seed.
export function getLessonQuizVariant(lessonId: string, seed: string): LessonQuiz | null {
  return buildQuiz(lessonId, LESSON_QUIZ_VERSION, seed);
}

export function getQuizForAttempt(attempt: QuizAttempt): LessonQuiz | null {
  return attempt.version === LEGACY_LESSON_QUIZ_VERSION
    ? getLessonQuiz(attempt.lessonId)
    : attempt.version === LESSON_QUIZ_VERSION && attempt.seed
      ? getLessonQuizVariant(attempt.lessonId, attempt.seed)
      : null;
}

export function answerIsCorrect(question: LessonQuizQuestion, answer: QuizAnswer): boolean {
  if (question.type === 'choice') return typeof answer === 'number' && answer === question.correctIndex;
  if (!Array.isArray(answer) || answer.length !== question.tokens!.length || new Set(answer).size !== answer.length ||
    answer.some(index => !Number.isInteger(index) || index < 0 || index >= question.tokens!.length)) return false;
  return normalize(answer.map(index => question.tokens![index]).join(' ')) === normalize(question.correctWords!.join(' '));
}

export function gradeLessonQuiz(quiz: LessonQuiz, answers: Record<string, QuizAnswer>): QuizGrade {
  const correct = quiz.questions.map(question => answerIsCorrect(question, answers[question.id]));
  const correctCount = correct.filter(Boolean).length;
  const score = Math.round(correctCount / quiz.questions.length * 100);
  return { score, correctCount, total: quiz.questions.length, passed: score >= LESSON_QUIZ_PASS_PERCENT, correct };
}

export function validQuizAttempt(value: unknown): value is QuizAttempt {
  if (!value || typeof value !== 'object') return false;
  const data = value as QuizAttempt;
  if (Object.keys(data).some(key => !['attemptId', 'lessonId', 'version', 'seed', 'answers'].includes(key)) ||
    typeof data.attemptId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(data.attemptId) ||
    typeof data.lessonId !== 'string' || !data.answers || typeof data.answers !== 'object' || Array.isArray(data.answers)) return false;
  const legacy = data.version === LEGACY_LESSON_QUIZ_VERSION && data.seed === undefined;
  const variant = data.version === LESSON_QUIZ_VERSION && typeof data.seed === 'string' &&
    /^[a-zA-Z0-9-]{16,80}$/.test(data.seed) && data.seed === data.attemptId;
  if (!legacy && !variant) return false;
  const quiz = getQuizForAttempt(data);
  if (!quiz || Object.keys(data.answers).length !== quiz.questions.length) return false;
  return quiz.questions.every(question => {
    const answer = data.answers[question.id];
    return question.type === 'choice' ? Number.isInteger(answer) && Number(answer) >= 0 && Number(answer) < question.options!.length
      : Array.isArray(answer) && answer.length === question.tokens!.length && new Set(answer).size === answer.length && answer.every(i => Number.isInteger(i) && i >= 0 && i < question.tokens!.length);
  });
}
