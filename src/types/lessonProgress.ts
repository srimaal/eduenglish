export function isLessonId(value: unknown): value is string {
  return typeof value === 'string' && /^lesson-([1-9]\d{0,2}|1000)$/.test(value);
}

export type LessonProgressResponse = { userId: string; completedLessonIds: string[] };
