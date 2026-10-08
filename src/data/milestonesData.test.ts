import { beforeEach, describe, expect, it } from 'vitest';
import {
  awardXp,
  getSavedStudentProgress,
  resetAllLearnerProgress,
  saveStudentProgress,
} from './milestonesData';

const progress = {
  spokenPracticesCount: 3,
  highScorePronunciationsCount: 2,
  completedQuizzesCount: 4,
  mistakesMasteredCount: 1,
  askedQuestionsCount: 5,
  lessonsExploredCount: 6,
  xpPoints: 125,
  xpDay: '2026-10-08',
  xpEarnedToday: 125,
  bonusAiTokens: 0,
  rewardAdsWatched: 0,
};

describe('student progress persistence', () => {
  beforeEach(() => localStorage.clear());

  it('starts a new learner at zero', () => {
    expect(getSavedStudentProgress()).toEqual(expect.objectContaining({
      spokenPracticesCount: 0,
      completedQuizzesCount: 0,
      xpPoints: 0,
    }));
  });

  it('saves and restores valid progress', () => {
    saveStudentProgress(progress);
    expect(getSavedStudentProgress()).toEqual(progress);
  });

  it('sanitizes invalid and negative stored values', () => {
    localStorage.setItem('singlish_guru_student_progress_v2', JSON.stringify({
      version: 2,
      progress: { ...progress, xpPoints: -50, completedQuizzesCount: Number.NaN },
    }));
    expect(getSavedStudentProgress()).toEqual(expect.objectContaining({ xpPoints: 0, completedQuizzesCount: 0 }));
  });

  it('clears progress and mastered flashcards', () => {
    saveStudentProgress(progress);
    localStorage.setItem('singlish_guru_mastered_flashcards', '["one"]');
    resetAllLearnerProgress();
    expect(localStorage.getItem('singlish_guru_student_progress_v2')).toBeNull();
    expect(localStorage.getItem('singlish_guru_mastered_flashcards')).toBeNull();
  });

  it('caps repeated XP rewards per local calendar day and resets tomorrow', () => {
    const base = { ...progress, xpDay: '2026-10-08', xpEarnedToday: 490 };
    const capped = awardXp(base, 30, new Date('2026-10-08T12:00:00'));
    expect(capped.xpPoints).toBe(135);
    expect(capped.xpEarnedToday).toBe(500);

    const tomorrow = awardXp(capped, 30, new Date('2026-10-09T12:00:00'));
    expect(tomorrow.xpPoints).toBe(165);
    expect(tomorrow.xpEarnedToday).toBe(30);
    expect(tomorrow.xpDay).toBe('2026-10-09');
  });
});
