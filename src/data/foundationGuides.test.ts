import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessonsData';
import { FOUNDATION_GUIDES, FOUNDATION_LESSON_MISTAKES, FOUNDATION_PRACTICE_PROMPTS } from './foundationGuides';

describe('foundation lesson teaching notes', () => {
  it('gives each of the first 100 lessons a clear, lesson-specific explanation', () => {
    expect(FOUNDATION_GUIDES).toHaveLength(100);
    expect(FOUNDATION_PRACTICE_PROMPTS).toHaveLength(100);
    expect(FOUNDATION_LESSON_MISTAKES).toHaveLength(100);
    for (const lesson of LESSONS.slice(0, 100)) {
      expect(lesson.summarySinhala.length, `lesson ${lesson.number} summary`).toBeGreaterThan(30);
      expect(lesson.grammarRule.ruleTitleSinhala, `lesson ${lesson.number} focus`).not.toBe('');
      expect(lesson.grammarRule.explanationSinhala.length, `lesson ${lesson.number} explanation`).toBeGreaterThan(40);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.englishOrder, `lesson ${lesson.number} pattern`).not.toBe('');
      expect(lesson.summarySinhala).not.toContain(lesson.titleSinhala);
      expect(lesson.guidedPracticeSinhala, `lesson ${lesson.number} guided practice`).toBeTruthy();
      expect(lesson.commonMistake.incorrect, `lesson ${lesson.number} mistake`).not.toBe(lesson.commonMistake.correct);
    }
  });

  it('explains the meeting lesson with rules that match its examples', () => {
    const meetingLesson = LESSONS.find(lesson => lesson.number === 100)!;
    expect(meetingLesson.summarySinhala).toContain('වෙනත් දිනයක්');
    expect(meetingLesson.grammarRule.explanationSinhala).toContain('on Thursday');
    expect(meetingLesson.grammarRule.explanationSinhala).toContain('at 2:30');
    expect(meetingLesson.grammarRule.sinhalaVsEnglishPattern.englishOrder).toContain('Can we meet');
    expect(meetingLesson.grammarRule.explanationSinhala).not.toContain('how many');
  });

  it('uses different, topic-relevant corrections for different question skills', () => {
    const beQuestion = LESSONS.find(lesson => lesson.number === 81)!;
    const quantityQuestion = LESSONS.find(lesson => lesson.number === 87)!;
    expect(beQuestion.commonMistake.incorrect).toBe('You are a new student?');
    expect(beQuestion.commonMistake.correct).toBe('Are you a new student?');
    expect(quantityQuestion.commonMistake.incorrect).toContain('How much');
    expect(quantityQuestion.commonMistake.correct).toContain('How many');
    expect(beQuestion.commonMistake.correct).not.toBe(quantityQuestion.commonMistake.correct);
  });
});
