import { describe, expect, it } from 'vitest';
import { LESSONS } from './lessonsData';
import { enhanceGrammarLesson } from './grammarLessons';
import { getLessonQuiz, getLessonQuizVariant, gradeLessonQuiz } from './lessonQuizzes';
import { correctQuizAnswers } from '../test/quizFixtures';

describe('reviewed grammar bridge lessons 201–300', () => {
  const reviewed = LESSONS.slice(200, 300);
  it('supplies complete bilingual teaching and preserves all identifiers', () => {
    expect(reviewed).toHaveLength(100);
    for (const lesson of reviewed) {
      expect(lesson.id).toBe(`lesson-${lesson.number}`);
      expect(lesson.level).toBe('Beginner 2');
      expect(lesson.phrases).toHaveLength(5);
      expect(lesson.keyVocabulary).toHaveLength(4);
      expect(lesson.titleEnglish).not.toContain(' · ');
      for (const value of [lesson.titleSinhala, lesson.summarySinhala, lesson.guidedPracticeSinhala,
        lesson.grammarRule.explanationSinhala, lesson.teacherVoiceAdviceSinhala,
        lesson.commonMistake.explanationSinhala]) {
        expect(value, `lesson ${lesson.number}`).toMatch(/[\u0D80-\u0DFF]/u);
        expect(value).not.toMatch(/à¶|à·|â€™/);
      }
      expect(lesson.commonMistake.incorrect).not.toBe(lesson.commonMistake.correct);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.englishOrder.trim()).not.toBe('');
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.exampleEnglish).toBe(lesson.phrases[0].english);
      expect(lesson.grammarRule.sinhalaVsEnglishPattern.exampleSinhala).toBe(lesson.phrases[0].sinhala);
      lesson.phrases.forEach((phrase, index) => {
        expect(phrase.id).toBe(`p-${Math.ceil(lesson.number / 10)}-${((lesson.number - 1) % 10) + 1}-${index + 1}`);
        expect(phrase.english.trim()).not.toBe('');
        expect(phrase.sinhala).toMatch(/[\u0D80-\u0DFF]/u);
        expect(phrase.sinhala).not.toMatch(/à¶|à·/);
        expect(phrase.teacherAudioTip?.length).toBeGreaterThan(30);
        expect(phrase.notesSinhala).toMatch(/[\u0D80-\u0DFF]/u);
      });
      for (const term of lesson.keyVocabulary ?? []) {
        expect(term.english.trim()).not.toBe('');
        expect(term.sinhala).toMatch(/[\u0D80-\u0DFF]/u);
      }
      expect(LESSONS.filter(l => l.titleEnglish === lesson.titleEnglish).map(l => l.number), lesson.titleEnglish).toEqual([lesson.number]);
    }
    expect(new Set(reviewed.map(l => l.guidedPracticeSinhala)).size).toBe(100);
    expect(new Set(reviewed.map(l => l.grammarRule.explanationSinhala)).size).toBe(100);
    expect(new Set(reviewed.map(l => l.keyVocabulary?.map(v => v.english).join('|'))).size).toBe(100);
    expect(new Set(reviewed.map(l => l.phrases.map(p => p.english).join('|'))).size).toBe(100);
    const englishPhrases = reviewed.flatMap(l => l.phrases.map(p => p.english.toLowerCase()));
    expect(englishPhrases).toHaveLength(500);
    expect(new Set(englishPhrases).size).toBe(500);
  });

  it('matches the crucial tense contrasts and corrects the relevant error', () => {
    const lesson = (number: number) => LESSONS[number - 1];
    expect(lesson(233).phrases.every(p => /^Who (?!did)/.test(p.english))).toBe(true);
    expect(lesson(233).grammarRule.sinhalaVsEnglishPattern.englishOrder).toContain('Who + past verb');
    expect(lesson(245).phrases.every(p => /\bwas|\bwere/.test(p.english) && p.english.includes('when'))).toBe(true);
    expect(lesson(246).phrases.every(p => p.english.includes('while'))).toBe(true);
    expect(lesson(267).phrases.some(p => p.english.includes('going to'))).toBe(true);
    expect(lesson(267).phrases.some(p => p.english.includes('I’ll'))).toBe(true);
    expect(lesson(278).phrases.some(p => p.english.includes('I know'))).toBe(true);
    expect(lesson(287).phrases.some(p => p.english.includes('for three years'))).toBe(true);
    expect(lesson(287).phrases.some(p => p.english.includes('since January'))).toBe(true);
    expect(lesson(288).commonMistake.correct).toBe('I visited Galle last December.');
    expect(lesson(298).commonMistake.correct).toBe('Although it was raining, we went to class.');
    expect(lesson(300).guidedPracticeSinhala).toContain('විනාඩි දෙකක');
    const generic = /(?:common irregular past actions|states and places in the past|the experience helped me understand|discuss the topic)/i;
    expect(reviewed.flatMap(l => l.phrases).some(p => generic.test(p.english))).toBe(false);
  });

  it('builds and grades legacy and variant quizzes against the reviewed content', () => {
    for (const lesson of reviewed) {
      for (const quiz of [getLessonQuiz(lesson.id), getLessonQuizVariant(lesson.id, 'grammar-review')]) {
        expect(quiz).not.toBeNull();
        if (!quiz) continue;
        expect(quiz.questions).toHaveLength(5);
        expect(lesson.phrases.map(p => p.id)).toContain(quiz.speakingPhrase.id);
        expect(gradeLessonQuiz(quiz, correctQuizAnswers(quiz)).score, `lesson ${lesson.number}`).toBe(100);
      }
    }
  });

  it('leaves all earlier reviewed lessons and lessons after 300 intact', () => {
    for (const number of [1, 100, 101, 200, 301, 1000]) {
      const lesson = LESSONS[number - 1];
      expect(enhanceGrammarLesson(lesson)).toBe(lesson);
    }
  });
});
