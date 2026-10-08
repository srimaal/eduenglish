import { describe, expect, it } from 'vitest';
import { assessSpokenAnswer } from './speechAssessment';

describe('Spoken quiz correction', () => {
  it('accepts the whole sentence ignoring case and punctuation', () => {
    expect(assessSpokenAnswer('Good morning, how are you today?', 'good morning how are you today')).toMatchObject({ score: 100, passed: true });
  });
  it('accepts supported contraction equivalents', () => {
    expect(assessSpokenAnswer('I am ready. You are ready.', 'I’m ready, you’re ready')).toMatchObject({ passed: true });
    expect(assessSpokenAnswer('I cannot go', 'I can not go')).toMatchObject({ passed: true });
  });
  it('does not pass partial answers or miss a negation', () => {
    const partial = assessSpokenAnswer('Good morning how are you today', 'Good morning are you');
    expect(partial.passed).toBe(false);
    expect(partial.corrections).toContainEqual({ expected: 'how', kind: 'missing' });
    expect(assessSpokenAnswer('I do not want a cup of tea today', 'I do want a cup of tea today').passed).toBe(false);
  });
  it('penalizes changed order, extra words and repeated words', () => {
    for (const spoken of ['world hello', 'hello strange world', 'hello hello world']) {
      expect(assessSpokenAnswer('hello world', spoken).passed).toBe(false);
      expect(assessSpokenAnswer('hello world', spoken).score).toBeLessThan(100);
    }
    expect(assessSpokenAnswer('hello world', 'hello world again').corrections).toContainEqual({ heard: 'again', kind: 'extra' });
  });
  it('does not give phonetic credit for similarly spelled but different words', () => {
    expect(assessSpokenAnswer('I like tea', 'I like sea')).toMatchObject({ passed: false });
    expect(assessSpokenAnswer('I like tea', 'I like sea').corrections).toContainEqual({ expected: 'tea', heard: 'sea', kind: 'different' });
  });
  it('never passes empty speech and keeps percentages in range', () => {
    expect(assessSpokenAnswer('hello', '').score).toBe(0);
    expect(assessSpokenAnswer('', '').passed).toBe(false);
    expect(assessSpokenAnswer('hello', 'one two three four').score).toBe(0);
  });
});
