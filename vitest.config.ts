import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,
    // The curriculum contract intentionally grades 1,000 lesson quizzes in one
    // test; allow slower CI machines enough time without weakening assertions.
    testTimeout: 15000,
    env: {
      GEMINI_API_KEY: 'test-key-that-is-long-enough-for-validation',
      NODE_ENV: 'test',
      GOOGLE_CLIENT_ID: '',
      GOOGLE_CLIENT_SECRET: '',
      FIREBASE_API_KEY: '',
      FIREBASE_AUTH_DOMAIN: '',
      FIREBASE_PROJECT_ID: '',
      FIREBASE_APP_ID: '',
      AUTH_SESSION_SECRET: '',
      TURSO_DATABASE_URL: '',
      TURSO_AUTH_TOKEN: '',
    },
  },
});
