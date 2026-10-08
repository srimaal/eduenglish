import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessonsData';
import { answerIsCorrect, getLessonQuiz, getLessonQuizVariant, gradeLessonQuiz, validQuizAttempt } from './lessonQuizzes';
import { correctQuizAnswers, quizAttempt, variantQuizAttempt } from '../test/quizFixtures';

describe('All 1,000 lesson quizzes', () => {
  it('covers all lesson IDs with five solvable, source-linked questions and optional speech', () => {
    expect(LESSONS).toHaveLength(1000);
    const questionIds = new Set<string>();
    for (const lesson of LESSONS) {
      const quiz = getLessonQuiz(lesson.id)!;
      expect(quiz.lessonId).toBe(lesson.id);
      expect(quiz.questions).toHaveLength(5);
      expect(lesson.phrases).toContainEqual(quiz.speakingPhrase);
      const correct = correctQuizAnswers(quiz);
      expect(gradeLessonQuiz(quiz, correct)).toMatchObject({ score: 100, passed: true, total: 5 });
      expect(validQuizAttempt(quizAttempt(lesson.id))).toBe(true);
      for (const q of quiz.questions) {
        expect(questionIds.has(q.id)).toBe(false); questionIds.add(q.id);
        expect(q.prompt.length).toBeGreaterThan(20);
        expect(q.explanation.length).toBeGreaterThan(20);
        if (q.sourcePhraseId) expect(lesson.phrases.some(p => p.id === q.sourcePhraseId)).toBe(true);
        if (q.type === 'choice') {
          expect(q.options!.length).toBeGreaterThanOrEqual(2);
          const normalized = q.options!.map(s => s.toLowerCase().replace(/[.,!?;:]/g, '').trim());
          expect(new Set(normalized).size).toBe(normalized.length);
          expect(q.options![q.correctIndex!]).toBeTruthy();
          for (let i = 0; i < q.options!.length; i++) expect(answerIsCorrect(q, i)).toBe(i === q.correctIndex);
        } else {
          expect([...q.tokens!].sort()).toEqual([...q.correctWords!].sort());
          expect(q.tokens!.join(' ')).not.toBe(q.correctWords!.join(' '));
          expect(answerIsCorrect(q, Array(q.tokens!.length).fill(0))).toBe(false);
        }
      }
    }
    expect(questionIds.size).toBe(5000);
  });
  it('uses an 80% threshold and rejects incomplete/stale/forged submissions', () => {
    const quiz = getLessonQuiz('lesson-1')!;
    const attempt = quizAttempt();
    attempt.answers[quiz.questions[0].id] = (quiz.questions[0].correctIndex! + 1) % quiz.questions[0].options!.length;
    expect(gradeLessonQuiz(quiz, attempt.answers)).toMatchObject({ score: 80, passed: true });
    attempt.answers[quiz.questions[1].id] = (quiz.questions[1].correctIndex! + 1) % quiz.questions[1].options!.length;
    expect(gradeLessonQuiz(quiz, attempt.answers)).toMatchObject({ score: 60, passed: false });
    expect(validQuizAttempt({ ...attempt, score: 100 })).toBe(false);
    expect(validQuizAttempt({ ...attempt, version: 0 })).toBe(false);
    expect(validQuizAttempt({ ...attempt, answers: {} })).toBe(false);
    expect(validQuizAttempt({ ...attempt, lessonId: 'lesson-1001' })).toBe(false);
    expect(getLessonQuiz('lesson-0')).toBeNull();
  });
  it('creates reproducible but different assessment variants from their attempt seeds', () => {
    const first = getLessonQuizVariant('lesson-1', 'quiz-variant-seed-0001')!;
    const second = getLessonQuizVariant('lesson-1', 'quiz-variant-seed-0002')!;
    expect(first.version).toBe(2);
    expect(first.seed).toBe('quiz-variant-seed-0001');
    expect(JSON.stringify(first)).toBe(JSON.stringify(getLessonQuizVariant('lesson-1', 'quiz-variant-seed-0001')));
    expect(JSON.stringify(first.questions)).not.toBe(JSON.stringify(second.questions));
    expect(validQuizAttempt(variantQuizAttempt('lesson-1', 'quiz-variant-attempt-0001'))).toBe(true);
    expect(validQuizAttempt({ ...variantQuizAttempt(), seed: 'another-seed-0001' })).toBe(false);
  });
  it('keeps every lesson variant solvable at full score', () => {
    for (const lesson of LESSONS) {
      const variant = getLessonQuizVariant(lesson.id, `variant-seed-${lesson.number}`)!;
      expect(gradeLessonQuiz(variant, correctQuizAnswers(variant))).toMatchObject({ score: 100, passed: true, total: 5 });
    }
  });
  it('keeps repeated word tiles independently usable', () => {
    const q = { id: 'repeat', type: 'reorder' as const, skill: 'Order', prompt: 'Rebuild', explanation: 'Example',
      tokens: ['do', 'you', 'do', 'What'], correctWords: ['What', 'do', 'you', 'do'] };
    expect(answerIsCorrect(q, [3, 0, 1, 2])).toBe(true);
    expect(answerIsCorrect(q, [3, 0, 1, 0])).toBe(false);
  });
});
