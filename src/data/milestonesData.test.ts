import { beforeEach, describe, expect, it } from 'vitest';
import {
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
});
