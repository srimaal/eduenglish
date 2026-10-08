import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Recognition } from '../hooks/useSpeechInput';
import { PracticeQuestions } from './PracticeQuestions';
import { PRIVACY_CHANGED_EVENT } from '../utils/privacyManager';

const { consent, hasConsent, stopSpeech } = vi.hoisted(() => ({ consent: vi.fn(), hasConsent: vi.fn(), stopSpeech: vi.fn() }));
vi.mock('../utils/privacyManager', () => ({ requireConsent: consent, hasConsent, PRIVACY_CHANGED_EVENT: 'singlish-guru:privacy-changed' }));
vi.mock('../utils/speechUtils', () => ({ speakEnglish: vi.fn(), stopSpeech }));
vi.mock('../data/questionsData', () => ({ PRACTICE_QUESTIONS: [
  { id: 'voice-1', type: 'voice', category: 'Spoken', targetEnglish: 'Hello world', sinhalaPrompt: 'Say hello world', explanationSinhala: 'First explanation' },
  { id: 'voice-2', type: 'voice', category: 'Spoken', targetEnglish: 'How are you', sinhalaPrompt: 'Say how are you', explanationSinhala: 'Second explanation' },
] }));

let instances: FakeRecognition[] = [];
class FakeRecognition implements Recognition {
  lang = ''; interimResults = false; continuous = false; maxAlternatives = 0;
  onstart: Recognition['onstart'] = null;
  onresult: Recognition['onresult'] = null;
  onerror: Recognition['onerror'] = null;
  onend: Recognition['onend'] = null;
  start = vi.fn(); stop = vi.fn(); abort = vi.fn();
  constructor() { instances.push(this); }
}
function result(text: string, isFinal = true) {
  act(() => instances.at(-1)!.onresult?.({ results: [{ isFinal, 0: { transcript: text } }] }));
}
function start() {
  fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
  act(() => instances.at(-1)?.onstart?.());
}
const submit = () => screen.getByRole('button', { name: /Submit/ });
beforeEach(() => {
  instances = []; consent.mockReturnValue(true); hasConsent.mockReturnValue(true);
  vi.stubGlobal('isSecureContext', true);
  vi.stubGlobal('SpeechRecognition', FakeRecognition);
  vi.stubGlobal('webkitSpeechRecognition', undefined);
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('Spoken quiz recording and grading', () => {
  it('grades only final speech and awards a correct answer once', () => {
    const reward = vi.fn(); render(<PracticeQuestions audioSpeed={1} onQuizAnswerCorrect={reward} />);
    expect(submit()).toBeDisabled();
    start();
    expect(stopSpeech).toHaveBeenCalled();
    result('Hello', false);
    expect(submit()).toBeDisabled();
    result('Hello world');
    expect(screen.getByText(/Recognized-word match: 100%/)).toBeInTheDocument();
    expect(instances[0].abort).toHaveBeenCalled();
    fireEvent.click(submit());
    expect(reward).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Start recording' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(submit()).toBeDisabled();
    expect(screen.queryByText(/Recognized-word match/)).not.toBeInTheDocument();
  });
  it('shows a correction and does not reward an incorrect spoken answer', () => {
    const reward = vi.fn(); render(<PracticeQuestions audioSpeed={1} onQuizAnswerCorrect={reward} />);
    start(); result('Hello bird');
    expect(screen.getByText('Heard “bird” → expected “world”')).toBeInTheDocument();
    fireEvent.click(submit()); expect(reward).not.toHaveBeenCalled();
  });
  it('clears the previous score immediately when rerecording', () => {
    render(<PracticeQuestions audioSpeed={1} />);
    start(); result('Hello world');
    expect(submit()).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Record again' }));
    expect(submit()).toBeDisabled();
    expect(screen.queryByText(/Recognized-word match/)).not.toBeInTheDocument();
    act(() => instances[1].onerror?.({ error: 'no-speech' }));
    expect(submit()).toBeDisabled();
  });
  it.each([
    ['not-allowed', /permission was blocked/], ['audio-capture', /No microphone/],
    ['network', /could not connect/], ['no-speech', /No speech was detected/],
  ])('shows actionable %s errors and allows retry', (error, message) => {
    render(<PracticeQuestions audioSpeed={1} />); start();
    act(() => instances[0].onerror?.({ error }));
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(submit()).toBeDisabled();
    start(); result('Hello world'); expect(submit()).toBeEnabled();
  });
  it('explains app consent and does not open the mic before consent', () => {
    consent.mockReturnValue(false); render(<PracticeQuestions audioSpeed={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Privacy Settings/);
    expect(instances).toHaveLength(0);
  });
  it('detects unsupported browsers and insecure pages', () => {
    vi.stubGlobal('SpeechRecognition', undefined);
    render(<PracticeQuestions audioSpeed={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/not supported/);
    vi.stubGlobal('isSecureContext', false);
    fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/HTTPS or localhost/);
  });
  it('handles a thrown startup failure', () => {
    vi.stubGlobal('SpeechRecognition', class extends FakeRecognition { start = vi.fn(() => { throw new DOMException('denied', 'NotAllowedError'); }); });
    render(<PracticeQuestions audioSpeed={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/permission was blocked/);
  });
  it('can stop recording and waits for a final result', () => {
    render(<PracticeQuestions audioSpeed={1} />); start();
    fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
    expect(instances[0].stop).toHaveBeenCalledTimes(1);
    expect(submit()).toBeDisabled();
    result('Hello world'); expect(submit()).toBeEnabled();
  });
  it('aborts on navigation and ignores late events', () => {
    render(<PracticeQuestions audioSpeed={1} />); start();
    const late = instances[0].onresult!;
    fireEvent.click(screen.getByRole('button', { name: /Skip spoken/ }));
    expect(instances[0].abort).toHaveBeenCalled();
    act(() => late({ results: [{ isFinal: true, 0: { transcript: 'Hello world' } }] }));
    expect(submit()).toBeDisabled();
    expect(screen.getByText('Say how are you')).toBeInTheDocument();
  });
  it('excludes skipped questions from grading and rewards', () => {
    const reward = vi.fn(); render(<PracticeQuestions audioSpeed={1} onQuizAnswerCorrect={reward} />);
    fireEvent.click(screen.getByRole('button', { name: /Skip spoken/ }));
    fireEvent.click(screen.getByRole('button', { name: /Skip spoken/ }));
    expect(screen.getByText(/Correct: 0 \/ 0 graded questions/)).toBeInTheDocument();
    expect(screen.getByText(/Skipped without a grade: 2/)).toBeInTheDocument();
    expect(reward).not.toHaveBeenCalled();
  });
  it('times out silent recordings rather than leaving the mic spinning', () => {
    vi.useFakeTimers(); render(<PracticeQuestions audioSpeed={1} />); start();
    act(() => vi.advanceTimersByTime(30_000));
    expect(screen.getByRole('alert')).toHaveTextContent(/timed out/);
    expect(instances[0].abort).toHaveBeenCalled();
  });
  it('cleans up when unmounted or consent is withdrawn', () => {
    const rendered = render(<PracticeQuestions audioSpeed={1} />); start();
    hasConsent.mockReturnValue(false);
    act(() => window.dispatchEvent(new Event(PRIVACY_CHANGED_EVENT)));
    expect(instances[0].abort).toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/consent is off/);
    hasConsent.mockReturnValue(true); start();
    rendered.unmount(); expect(instances[1].abort).toHaveBeenCalled();
  });
});
