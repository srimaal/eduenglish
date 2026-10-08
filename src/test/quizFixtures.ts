import { getLessonQuiz, getLessonQuizVariant, type LessonQuiz, type QuizAttempt, type QuizAnswer } from '../data/lessonQuizzes';

export function correctQuizAnswers(quiz: LessonQuiz): Record<string, QuizAnswer> {
  return Object.fromEntries(quiz.questions.map(q => {
    if (q.type === 'choice') return [q.id, q.correctIndex!];
    const used = new Set<number>();
    return [q.id, q.correctWords!.map(word => {
      const index = q.tokens!.findIndex((token, i) => token === word && !used.has(i));
      used.add(index); return index;
    })];
  }));
}
export function quizAttempt(lessonId = 'lesson-1', attemptId = 'quiz-test-attempt-0001'): QuizAttempt {
  const quiz = getLessonQuiz(lessonId)!;
  return { attemptId, lessonId, version: quiz.version, answers: correctQuizAnswers(quiz) };
}
export function variantQuizAttempt(lessonId = 'lesson-1', attemptId = 'quiz-variant-attempt-0001'): QuizAttempt {
  const quiz = getLessonQuizVariant(lessonId, attemptId)!;
  return { attemptId, lessonId, version: quiz.version, seed: attemptId, answers: correctQuizAnswers(quiz) };
}
