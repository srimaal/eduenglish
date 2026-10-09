import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LessonProgressSection } from './LessonProgressSection';
import { GUEST_LESSONS_KEY } from '../utils/lessonProgress';

vi.mock('../utils/speechUtils', () => ({ speakEnglish: vi.fn() }));
const props = { audioSpeed: 1, onSelectPhraseForVoice: vi.fn(), onGoToQuiz: vi.fn() };
afterEach(() => vi.unstubAllGlobals());

describe('Lesson progress controls', () => {
  it('marks a guest lesson complete, shows the count and keeps it after remount', async () => {
    const first = render(<LessonProgressSection {...props} user={null} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark lesson complete' }));
    expect(screen.getByText('1 / 1,000 lessons completed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lesson completed/ })).toBeDisabled();
    expect(JSON.parse(localStorage.getItem(GUEST_LESSONS_KEY)!).completed).toEqual(['lesson-1']);
    first.unmount();
    render(<LessonProgressSection {...props} user={null} />);
    expect(screen.getByText('1 / 1,000 lessons completed')).toBeInTheDocument();
  });
  it('disables completion until the account is known', () => {
    render(<LessonProgressSection {...props} user={undefined} />);
    expect(screen.getByRole('button', { name: 'Mark lesson complete' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Checking your account');
  });
  it('offers guest import but does not silently upload it', async () => {
    localStorage.setItem(GUEST_LESSONS_KEY, JSON.stringify({ completed: ['lesson-1'], pending: [] }));
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ userId: 'alice', completedLessonIds: [] }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<LessonProgressSection {...props} user={{ id: 'alice', name: 'Alice', email: 'alice@example.com' }} />);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('synced'));
    expect(screen.getByRole('button', { name: 'Import guest lessons' })).toBeInTheDocument();
    expect(screen.getByText('0 / 1,000 lessons completed')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
    expect(fetchMock.mock.calls.some(([url, options]) => url === '/api/progress/lessons' && options?.method === 'POST')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(screen.queryByRole('button', { name: 'Import guest lessons' })).not.toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([url, options]) => url === '/api/progress/lessons' && options?.method === 'POST')).toBe(false);
  });
});
