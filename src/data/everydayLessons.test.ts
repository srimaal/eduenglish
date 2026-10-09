import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessonsData';
import { enhanceEverydayLesson } from './everydayLessons';

describe('reviewed everyday A1 lessons 101–200', () => {
  const everyday = LESSONS.slice(100, 200);
  it('provides complete bilingual lessons, focused practice and valid stable identifiers', () => {
    expect(everyday).toHaveLength(100);
    for (const lesson of everyday) {
      expect(lesson.id).toBe(`lesson-${lesson.number}`);
      expect(lesson.phrases).toHaveLength(5);
      expect(lesson.keyVocabulary).toHaveLength(4);
      expect(lesson.level).toBe('Beginner 1');
      for (const value of [lesson.titleSinhala, lesson.summarySinhala,
        lesson.grammarRule.explanationSinhala, lesson.guidedPracticeSinhala,
        lesson.commonMistake.explanationSinhala, lesson.teacherVoiceAdviceSinhala]) {
        expect(value).toMatch(/[\u0D80-\u0DFF]/u);
      }
      for (const phrase of lesson.phrases) {
        expect(phrase.english.trim()).not.toBe('');
        expect(phrase.sinhala).toMatch(/[\u0D80-\u0DFF]/u);
        expect(phrase.teacherAudioTip?.length).toBeGreaterThan(30);
        expect(phrase.category).toBe(lesson.phrases[0].category);
      }
      for (const term of lesson.keyVocabulary ?? []) {
        expect(term.english.trim()).not.toBe('');
        expect(term.sinhala).toMatch(/[\u0D80-\u0DFF]/u);
      }
      expect(lesson.commonMistake.incorrect).not.toBe(lesson.commonMistake.correct);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.exampleEnglish).toBe(lesson.phrases[0].english);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.exampleSinhala).toBe(lesson.phrases[0].sinhala);
    }
    expect(new Set(everyday.map(l => l.titleEnglish)).size).toBe(100);
    for (const lesson of everyday) {
      expect(LESSONS.filter(l => l.titleEnglish === lesson.titleEnglish).map(l => l.number), lesson.titleEnglish).toEqual([lesson.number]);
    }
    expect(new Set(everyday.map(l => l.guidedPracticeSinhala)).size).toBe(100);
    expect(new Set(everyday.map(l => l.keyVocabulary?.map(v => v.english).join('|'))).size).toBe(100);
  });
  it('keeps every numbered module aligned with its teaching examples', () => {
    const expected = new Map([
      [101, 'mother'], [111, 'living room'], [121, 'menu'], [131, 'shirt'],
      [141, 'post office'], [151, 'page ten'], [161, 'shop assistant'],
      [171, 'left hand'], [181, 'sunny'], [191, 'neighbour'], [200, 'bookshop'],
    ]);
    for (const [number, word] of expected) {
      expect(LESSONS[number - 1].phrases.some(p => p.english.includes(word))).toBe(true);
    }
    expect(LESSONS[108].phrases.every(p => !/\b(met|made|took|left|helped)\b/.test(p.english))).toBe(true);
    expect(LESSONS[124].phrases.some(p => p.english.includes('a glass of fresh lime juice'))).toBe(true);
    expect(LESSONS[174].grammarRule.explanationSinhala).toContain('for two days');
  });
  it('preserves phrases and lesson content outside the reviewed range', () => {
    for (const number of [1, 100, 201, 1000]) {
      const lesson = LESSONS[number - 1];
      expect(enhanceEverydayLesson(lesson)).toBe(lesson);
    }
    for (const lesson of everyday) {
      lesson.phrases.forEach((p, index) => {
        expect(p.id).toBe(`p-${Math.ceil(lesson.number / 10)}-${((lesson.number - 1) % 10) + 1}-${index + 1}`);
      });
    }
  });
});
