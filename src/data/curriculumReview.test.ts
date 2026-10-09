import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessonsData';
import { getLessonQuiz } from './lessonQuizzes';

describe('second pedagogical review of lessons 1–300', () => {
  const reviewed = LESSONS.slice(0, 300);
  it('maintains complete bilingual lessons, stable numbering and unique lesson objectives', () => {
    expect(reviewed).toHaveLength(300);
    expect(new Set(reviewed.map(l => l.titleEnglish)).size).toBe(300);
    expect(new Set(reviewed.map(l => l.phrases.map(p => p.english).join('|'))).size).toBe(300);
    for (const [index, lesson] of reviewed.entries()) {
      expect(lesson.number).toBe(index + 1);
      expect(lesson.id).toBe(`lesson-${index + 1}`);
      expect(lesson.phrases).toHaveLength(5);
      expect(lesson.keyVocabulary).toHaveLength(4);
      expect(lesson.guidedPracticeSinhala).toMatch(/[\u0D80-\u0DFF]/u);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.exampleEnglish).toBe(lesson.phrases[0].english);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.exampleSinhala).toBe(lesson.phrases[0].sinhala);
    }
  });
  it('avoids unscaffolded past, perfect and passive forms in the early core examples', () => {
    const lesson = (number: number) => LESSONS[number - 1];
    expect(lesson(2).phrases.every(p => /^How (are|is)|^Is /.test(p.english))).toBe(true);
    expect(lesson(8).phrases.every(p => p.english.startsWith('This is '))).toBe(true);
    for (const number of [24, 26, 27, 28, 29, 30, 31, 32, 35, 38, 39, 40, 44, 47, 48, 50]) {
      for (const phrase of lesson(number).phrases) {
        expect(phrase.english, `lesson ${number}`).not.toMatch(/\b(won|checked|completed|visited|helped|invited|planted|explained|sent|gave|carried|fixed|saw|bought|waited|left|watched|crossed|stopped|borrowed|recycled)\b/);
      }
    }
    expect(lesson(12).keyVocabulary?.some(v => v.english === 'moved to')).toBe(false);
    expect(lesson(228).keyVocabulary?.some(v => v.english === 'woke up')).toBe(true);
  });
  it('accounts for useful exceptions instead of rejecting valid English', () => {
    expect(LESSONS[35].grammarRule.explanationSinhala).toContain('Would you like some biscuits?');
    expect(LESSONS[54].grammarRule.explanationSinhala).toContain('parents’');
    expect(LESSONS[54].grammarRule.explanationSinhala).toContain('children’s');
    expect(LESSONS[83].commonMistake.incorrect).not.toBe('What bus goes to the hospital, 120 or 138?');
    expect(LESSONS[97].commonMistake.incorrect).not.toContain('568 one');
    expect(LESSONS[124].commonMistake.incorrect).toContain('a glasses');
    expect(LESSONS[124].grammarRule.explanationSinhala).toContain('two teas');
  });
  it('supplies the actual situation for context-dependent corrections and quizzes', () => {
    const contextual = reviewed.filter(l => l.commonMistake.kind === 'context');
    expect(contextual.map(l => l.number)).toEqual([1, 42, 65, 75, 81, 286, 296]);
    for (const lesson of contextual) {
      expect(lesson.commonMistake.contextSinhala).toMatch(/[\u0D80-\u0DFF]/u);
      const question = getLessonQuiz(lesson.id)?.questions.find(q => q.skill === 'Usage & correction');
      expect(question?.prompt).toContain(lesson.commonMistake.contextSinhala);
    }
  });
});
