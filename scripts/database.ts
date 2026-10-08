import dotenv from 'dotenv';
import { databaseFromEnv, migrateDatabase } from '../server/database';

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
      console.log('Lesson progress and quiz schema is ready (migrations 1–2). Existing records preserved.');
    }
  } catch {
    console.error('Database check/setup failed. Check network access, database URL, token permissions/expiry, and retry. Credentials have not been logged.');
    process.exitCode = 1;
  } finally { client.close(); }
}
