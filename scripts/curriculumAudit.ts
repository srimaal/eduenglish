import { LESSONS } from '../src/data/lessonsData';

const unique = (values: string[]) => new Set(values).size;
const phraseSetKey = (lesson: (typeof LESSONS)[number]) =>
  lesson.phrases.map((phrase) => phrase.english.trim().toLowerCase()).join('|');
const grammarKey = (lesson: (typeof LESSONS)[number]) =>
  `${lesson.grammarRule.ruleTitleSinhala}|${lesson.grammarRule.explanationSinhala}`;

const numbers = LESSONS.map((lesson) => lesson.number).sort((a, b) => a - b);
const expectedNumbers = Array.from({ length: 1000 }, (_, index) => index + 1);
const invalidIds = LESSONS.filter((lesson) => lesson.id !== `lesson-${lesson.number}`).map((lesson) => lesson.id);
const phraseSets = LESSONS.map(phraseSetKey);
const grammarRules = LESSONS.map(grammarKey);

const report = {
  lessons: LESSONS.length,
  expectedLessons: 1000,
  sequentialNumbers: JSON.stringify(numbers) === JSON.stringify(expectedNumbers),
  uniqueTitles: unique(LESSONS.map((lesson) => lesson.titleEnglish)),
  uniquePhraseSets: unique(phraseSets),
  uniqueGrammarRules: unique(grammarRules),
  duplicatePhraseSetRatio: Number(((LESSONS.length - unique(phraseSets)) / LESSONS.length).toFixed(3)),
  invalidIds,
};

console.log(JSON.stringify(report, null, 2));

if (report.lessons !== report.expectedLessons || !report.sequentialNumbers || report.invalidIds.length > 0) {
  console.error('Curriculum integrity check failed. Every step must have a unique sequential lesson number and stable ID.');
  process.exitCode = 1;
} else if (report.uniquePhraseSets < 100) {
  console.warn('Curriculum content warning: many numbered steps currently reuse phrase sets. Review before marketing them as independent lessons.');
}
