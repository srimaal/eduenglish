import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LessonQuiz } from './LessonQuiz';
import { getLessonQuizVariant } from '../data/lessonQuizzes';
import { correctQuizAnswers } from '../test/quizFixtures';
vi.mock('../utils/speechUtils', () => ({ speakEnglish: vi.fn(), stopSpeech: vi.fn() }));

const FIRST_SEED = '123e4567-e89b-12d3-a456-426614174000';
function finish(lessonId: string, seed: string, wrong = 0) {
  const quiz = getLessonQuizVariant(lessonId, seed)!;
  const answers = correctQuizAnswers(quiz);
  quiz.questions.forEach((q, i) => {
    if (q.type === 'choice') {
      const option = i < wrong ? (q.correctIndex! + 1) % q.options!.length : q.correctIndex!;
      fireEvent.click(within(screen.getByRole('group', { name: 'Answer options' })).getAllByRole('button')[option]);
    } else {
      const bank = within(screen.getByRole('group', { name: 'Word bank' })).getAllByRole('button');
      for (const index of answers[q.id] as number[]) fireEvent.click(bank[index]);
    }
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    fireEvent.click(screen.getByRole('button', { name: i === 4 ? 'Finish quiz & save result' : 'Next question' }));
  });
}
describe('Lesson-specific quiz runner', () => {
  beforeEach(() => vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(FIRST_SEED));
  afterEach(() => vi.restoreAllMocks());
  it('saves exactly one complete attempt for the chosen lesson without requiring a microphone', () => {
    const onFinish = vi.fn().mockReturnValue(true);
    render(<LessonQuiz lessonId="lesson-2" audioSpeed={1} ready onFinish={onFinish} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Lesson 2 quiz' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    finish('lesson-2', FIRST_SEED);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish.mock.calls[0][0]).toMatchObject({ lessonId: 'lesson-2', version: 2, seed: FIRST_SEED });
    expect(screen.getByText(/Passed! This lesson/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start recording' })).not.toBeInTheDocument();
  });
  it('retains failed results and offers review and a fresh attempt', () => {
    const onFinish = vi.fn().mockReturnValue(true);
    const secondSeed = '123e4567-e89b-12d3-a456-426614174001';
    let idCalls = 0;
    vi.mocked(globalThis.crypto.randomUUID).mockImplementation(() => idCalls++ === 0 ? FIRST_SEED : secondSeed);
    render(<LessonQuiz lessonId="lesson-1" audioSpeed={1} ready onFinish={onFinish} onBack={vi.fn()} />);
    finish('lesson-1', FIRST_SEED, 2);
    expect(screen.getByText(/Keep practising/)).toBeInTheDocument();
    expect(screen.getByText(/60%/)).toBeInTheDocument();
    const oldId = onFinish.mock.calls[0][0].attemptId;
    fireEvent.click(screen.getByRole('button', { name: 'Try a new version' }));
    finish('lesson-1', secondSeed);
    expect(onFinish.mock.calls[1][0].attemptId).not.toBe(oldId);
  });
  it('does not claim completion when local recording fails and can retry saving', () => {
    const onFinish = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    render(<LessonQuiz lessonId="lesson-1" audioSpeed={1} ready onFinish={onFinish} onBack={vi.fn()} />);
    finish('lesson-1', FIRST_SEED);
    expect(screen.getByText(/Save the result below/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry saving result' }));
    expect(onFinish.mock.calls[1][0].attemptId).toBe(onFinish.mock.calls[0][0].attemptId);
    expect(screen.getByText(/Passed! This lesson/)).toBeInTheDocument();
  });
});
