import dotenv from 'dotenv';
import { createCurriculumStore, databaseFromEnv, migrateDatabase } from '../server/database';

dotenv.config({ path: ['.env.local', '.env'], quiet: true });
const client = databaseFromEnv();
if (!client) {
  console.error('Set valid TURSO_DATABASE_URL and TURSO_AUTH_TOKEN server environment variables.');
  process.exitCode = 1;
} else {
  try {
    await client.execute('SELECT 1 AS connected');
    console.log('Turso connection verified.');
    if (process.argv.includes('--migrate')) {
      await migrateDatabase(client);
      console.log('Database schema is ready (migrations 1–3). Existing learner records preserved.');
    }
    if (process.argv.includes('--seed-curriculum')) {
      await migrateDatabase(client);
      const { LESSONS, LESSON_VOLUMES } = await import('../src/data/lessonsData');
      const numbers = LESSONS.map(lesson => lesson.number).sort((a, b) => a - b);
      const complete = LESSONS.length === 1000 && numbers.every((number, index) => number === index + 1) &&
        LESSONS.every(lesson => lesson.phrases.length === 5 && lesson.id === `lesson-${lesson.number}`) &&
        LESSON_VOLUMES.length > 0 && LESSON_VOLUMES[0].range[0] === 1 &&
        LESSON_VOLUMES.at(-1)?.range[1] === 1000;
      if (!complete) throw new Error('Refusing to seed an incomplete curriculum. Expected 1,000 sequential lessons with five phrases each.');
      const filler = LESSONS.flatMap(lesson => lesson.phrases.filter(phrase =>
        /\b(?:common|completed) (?:regular |irregular )?(?:past )?actions\b|\bstates and places in the past\b|\bthe experience helped me understand\b/i.test(phrase.english))
        .map(phrase => `${lesson.id}: ${phrase.english}`));
      const generatedTitles = LESSONS.filter(lesson => lesson.titleEnglish.includes(' · '));
      if (filler.length || generatedTitles.length) {
        throw new Error(`Refusing to publish unfinished course content: ${generatedTitles.length} template titles and ${filler.length} generic example sentences remain. The audit must pass before seeding.`);
      }
      const version = process.env.CURRICULUM_VERSION?.trim() || 'a1-b1-2026-10-01';
      const result = await createCurriculumStore(client).publish({
        version,
        lessons: LESSONS,
        sections: LESSON_VOLUMES,
      });
      console.log(`Stored ${result.lessonCount} lesson records in curriculum ${result.version}.`);
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown database setup error';
    console.error(`Database check/setup failed: ${reason}. Credentials have not been logged.`);
    process.exitCode = 1;
  } finally { client.close(); }
}
