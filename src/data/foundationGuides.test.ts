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
      expect(lesson.keyVocabulary, `lesson ${lesson.number} vocabulary`).toHaveLength(4);
      for (const item of lesson.keyVocabulary ?? []) {
        expect(item.english.trim(), `lesson ${lesson.number} English vocabulary`).not.toBe('');
        expect(item.sinhala.trim(), `lesson ${lesson.number} Sinhala vocabulary`).not.toBe('');
      }
      expect(lesson.teacherVoiceAdviceSinhala, `lesson ${lesson.number} teacher advice`)
        .not.toContain('වාක්‍ය පහම හඬ නගා');
      for (const phrase of lesson.phrases) {
        expect(phrase.teacherAudioTip, `lesson ${lesson.number} audio guidance`)
          .not.toBe('Say the sentence clearly. Stress the key information, then repeat it naturally.');
      }
    }
  });

  it('uses a different vocabulary set and practice task for every foundation lesson', () => {
    const foundationLessons = LESSONS.slice(0, 100);
    const vocabularySets = foundationLessons.map(lesson =>
      (lesson.keyVocabulary ?? []).map(item => `${item.english}|${item.sinhala}`).join('||'),
    );
    const practiceTasks = foundationLessons.map(lesson => lesson.guidedPracticeSinhala);

    expect(new Set(vocabularySets).size).toBe(100);
    expect(new Set(practiceTasks).size).toBe(100);
  });

  it('keeps vocabulary tied to the skill taught in each lesson', () => {
    const expectedTerms = new Map<number, string>([
      [1, 'Good morning'], [11, 'full name'], [21, 'subject pronoun'], [31, 'a bird'],
      [41, 'this'], [51, 'my'], [61, 'wake up'], [71, 'during meals'],
      [81, 'Are you …?'], [91, 'Monday'], [100, 'Are you free …?'],
    ]);

    for (const [lessonNumber, expectedTerm] of expectedTerms) {
      const lesson = LESSONS[lessonNumber - 1];
      expect(
        lesson.keyVocabulary?.some(item => item.english === expectedTerm),
        `lesson ${lessonNumber} vocabulary should include ${expectedTerm}`,
      ).toBe(true);
    }
  });

  it('keeps model sentences aligned with their lesson focus', () => {
    const reasonLesson = LESSONS[29];
    expect(reasonLesson.phrases.every(phrase => phrase.english.includes('because'))).toBe(true);

    const identificationLesson = LESSONS[44];
    expect(identificationLesson.phrases.some(phrase => phrase.english === 'What is that beside the door?')).toBe(true);

    const oneLesson = LESSONS[47];
    expect(oneLesson.phrases.some(phrase => /These ones|Those ones/.test(phrase.english))).toBe(false);
  });

  it('uses 500 distinct practical model sentences across lessons 1–100', () => {
    const phrases = LESSONS.slice(0, 100).flatMap(lesson => lesson.phrases.map(phrase => phrase.english.toLowerCase()));
    expect(phrases).toHaveLength(500);
    expect(new Set(phrases).size).toBe(500);
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
