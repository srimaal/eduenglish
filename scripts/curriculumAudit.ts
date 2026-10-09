import { LESSONS } from '../src/data/lessonsData';

const unique = (values: string[]) => new Set(values).size;
const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
const phraseSetKey = (lesson: (typeof LESSONS)[number]) =>
  lesson.phrases.map((phrase) => normalize(phrase.english)).join('|');
const grammarKey = (lesson: (typeof LESSONS)[number]) =>
  `${lesson.grammarRule.ruleTitleSinhala}|${lesson.grammarRule.explanationSinhala}`;

const numbers = LESSONS.map((lesson) => lesson.number).sort((a, b) => a - b);
const expectedNumbers = Array.from({ length: 1000 }, (_, index) => index + 1);
const invalidIds = LESSONS.filter((lesson) => lesson.id !== `lesson-${lesson.number}`).map((lesson) => lesson.id);
const phraseSets = LESSONS.map(phraseSetKey);
const lessonGroups = new Map<string, typeof LESSONS>();
for (const lesson of LESSONS) {
  const moduleName = lesson.phrases[0]?.category ?? 'Unknown module';
  lessonGroups.set(moduleName, [...(lessonGroups.get(moduleName) ?? []), lesson]);
}

// Catch the precise failure mode that produced sentences such as
// “I described common irregular past actions yesterday.” These are
// deterministic content checks, not a substitute for the lesson authoring.
const fillerPatterns = [
  /\b(?:common|completed|regular|irregular) (?:regular |irregular )?(?:past )?actions\b/i,
  /\bstates and places in the past\b/i,
  /\b(?:discuss|describe|prepare|share|practise) (?:the )?(?:topic|grammar|key words|greetings and introductions|family roles and personalities)\b/i,
  /\bthe experience helped me understand\b/i,
  /\bi am agree\b/i,
];
const knownFiller = LESSONS.flatMap(lesson => lesson.phrases
  .filter(phrase => fillerPatterns.some(pattern => pattern.test(phrase.english)))
  .map(phrase => ({ lesson: lesson.number, title: lesson.titleEnglish, phrase: phrase.english })));
const missingSinhala = LESSONS.flatMap(lesson => lesson.phrases
  .filter(phrase => !/[\u0D80-\u0DFF]/u.test(phrase.sinhala))
  .map(phrase => ({ lesson: lesson.number, phrase: phrase.english })));
const malformedLessons = LESSONS.filter(lesson =>
  !lesson.titleEnglish.trim() || !lesson.summarySinhala.trim() || lesson.phrases.length !== 5 ||
  lesson.phrases.some(phrase => !phrase.english.trim() || !phrase.sinhala.trim()) ||
  !lesson.commonMistake.incorrect.trim() || !lesson.commonMistake.correct.trim());
const repeatedModules = [...lessonGroups].flatMap(([module, lessons]) => {
  const distinctSets = unique(lessons.map(phraseSetKey));
  return distinctSets < lessons.length ? [{ module, lessons: lessons.length, distinctPhraseSets: distinctSets }] : [];
});
const report = {
  lessons: LESSONS.length,
  expectedLessons: 1000,
  sequentialNumbers: JSON.stringify(numbers) === JSON.stringify(expectedNumbers),
  stableIds: invalidIds.length === 0,
  uniqueTitles: unique(LESSONS.map(lesson => lesson.titleEnglish)),
  uniqueModules: lessonGroups.size,
  uniquePhraseSets: unique(phraseSets),
  explicitlyAuthoredTitles: LESSONS.filter(lesson => !lesson.titleEnglish.includes(' · ')).length,
  templateTitles: LESSONS.filter(lesson => lesson.titleEnglish.includes(' · ')).length,
  uniqueGrammarRules: unique(LESSONS.map(grammarKey)),
  knownFillerCount: knownFiller.length,
  knownFillerExamples: knownFiller.slice(0, 12),
  missingSinhalaCount: missingSinhala.length,
  missingSinhalaExamples: missingSinhala.slice(0, 12),
  malformedLessonCount: malformedLessons.length,
  repeatedModules,
};

console.log(JSON.stringify(report, null, 2));

const structuralFailure = report.lessons !== report.expectedLessons || !report.sequentialNumbers ||
  !report.stableIds || report.uniqueTitles !== report.lessons || report.uniquePhraseSets !== report.lessons ||
  report.missingSinhalaCount > 0 || report.malformedLessonCount > 0;
const contentFailure = report.knownFillerCount > 0 || report.templateTitles > 0 || repeatedModules.length > 0;
if (structuralFailure || contentFailure) {
  console.error('Curriculum audit failed. Do not publish/seed this version until every lesson is specific, topic-aligned, bilingual, and structurally complete.');
  process.exitCode = 1;
}
