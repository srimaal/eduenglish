import { MilestoneBadge, StudentProgress } from '../types';

export const INITIAL_STUDENT_PROGRESS: StudentProgress = {
  spokenPracticesCount: 0,
  highScorePronunciationsCount: 0,
  completedQuizzesCount: 0,
  mistakesMasteredCount: 0,
  askedQuestionsCount: 0,
  lessonsExploredCount: 0,
  xpPoints: 0,
  xpDay: undefined,
  xpEarnedToday: 0,
  bonusAiTokens: 0,
  rewardAdsWatched: 0,
};

export const MILESTONE_BADGES_CONFIG: Omit<MilestoneBadge, 'currentCount' | 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'pronunciation-expert',
    titleEnglish: 'Pronunciation Expert',
    titleSinhala: 'උච්චාරණ ප්‍රවීණයා',
    descriptionEnglish: 'Score 80%+ pronunciation accuracy on 3 spoken phrases in the Voice Lab.',
    descriptionSinhala: 'හඬ විද්‍යාගාරයේදී වාක්‍ය 3ක් සඳහා 80% ට වැඩි උච්චාරණ නිරවද්‍යතාවයක් ලබාගන්න.',
    category: 'pronunciation',
    tier: 'Gold',
    iconType: 'mic',
    targetCount: 3,
    unit: 'phrases',
    sirCommendationSinhala: 'විශිෂ්ටයි පුතා! ඔබ ශබ්ද උච්චාරණය (Pronunciation) ඉතාමත් පැහැදිලි ජාත්‍යන්තර මට්ටමකට ගෙනැවිත් තිබෙනවා. "Th", "W", "V" ශබ්ද දැන් හරිම ලස්සනයි!',
    actionTab: 'pronunciation',
  },
  {
    id: 'grammar-master',
    titleEnglish: 'Grammar Master',
    titleSinhala: 'ව්‍යාකරණ ශූරයා',
    descriptionEnglish: 'Master the Subject-Verb-Object (SVO) pattern and score 4+ in practice questions.',
    descriptionSinhala: 'සිංහල මානසිකත්වයෙන් මිදී S-V-O රටාවෙන් ප්‍රශ්න 4ක් නිවැරදිව සම්පූර්ණ කරන්න.',
    category: 'grammar',
    tier: 'Gold',
    iconType: 'book',
    targetCount: 4,
    unit: 'answers',
    sirCommendationSinhala: 'අපූරුයි! සිංහලෙන් හිතලා වචනෙන් වචනෙට පරිවර්තනය නොකර, ක්‍රියාව මැදට ගෙන (S-V-O) වාක්‍ය නිවැරදිව ගොඩනැගීමට ඔබ දැන් සමත්!',
    actionTab: 'practice',
  },
  {
    id: 'spoken-pioneer',
    titleEnglish: 'Spoken Pioneer',
    titleSinhala: 'කථික පෙරගමන්කරු',
    descriptionEnglish: 'Record your voice and practice speaking at least 5 everyday English sentences.',
    descriptionSinhala: 'මයික්‍රෆෝනය භාවිතයෙන් එදිනෙදා ඉංග්‍රීසි වාක්‍ය 5ක් ශබ්ද නගා කතා කර පුරුදු වන්න.',
    category: 'speaking',
    tier: 'Silver',
    iconType: 'flame',
    targetCount: 5,
    unit: 'spoken phrases',
    sirCommendationSinhala: 'බය නැතුව කතා කිරීම තමයි ඕනෑම භාෂාවක් කතා කිරීමේ පළමු රහස. ඔබ දැන් ඒ චකිතය සහ බිය සහමුලින්ම ජයගෙන ඇත!',
    actionTab: 'pronunciation',
  },
  {
    id: 'mistake-buster',
    titleEnglish: 'Mistake Buster',
    titleSinhala: 'ලාංකික වැරදි නිවැරදිකරු',
    descriptionEnglish: 'Conquer 3 common Sri Lankan colloquial traps (like "Turn on" vs "Open fan").',
    descriptionSinhala: 'ලංකාවේ අපිට නිතරම වරදින ඉංග්‍රීසි ව්‍යවහාර 3ක් නිවැරදි කර ජයගන්න.',
    category: 'vocabulary',
    tier: 'Silver',
    iconType: 'check',
    targetCount: 3,
    unit: 'mistakes fixed',
    sirCommendationSinhala: '"Open the fan" වෙනුවට "Turn on the fan" කියන්නත්, "Borrow" සහ "Lend" වෙනස හඳුනාගන්නත් ඔබ දැන් පරිපූර්ණයි!',
    actionTab: 'mistakes',
  },
  {
    id: 'active-inquirer',
    titleEnglish: 'Active Inquirer',
    titleSinhala: 'ඩේසි ගුරුතුමියගේ ක්‍රියාශීලී සිසුවා',
    descriptionEnglish: 'Ask Teacher Daisy a spoken English or grammar question at her consultation desk.',
    descriptionSinhala: 'ඩේසි ගුරුතුමියගේ උපදෙස් කුටියෙන් ඔබේ ඕනෑම ඉංග්‍රීසි ගැටලුවක් සෘජුවම විමසන්න.',
    category: 'community',
    tier: 'Bronze',
    iconType: 'message',
    targetCount: 1,
    unit: 'consultations',
    sirCommendationSinhala: 'ප්‍රශ්න අසන ශිෂ්‍යයා තමයි නිරතුරුවම ඉදිරියට යන්නේ. ඔබේ නොනැවතී ඉගෙනීමේ උනන්දුව මාධ්‍යවේදියෙකු සහ උපදේශකයෙකු ලෙස මම බෙහෙවින් අගය කරනවා!',
    actionTab: 'ask-sir',
  },
  {
    id: 'habit-champion',
    titleEnglish: 'Daily Habit Champion',
    titleSinhala: 'දෛනික චර්යා විජයග්‍රාහකයා',
    descriptionEnglish: 'Explore Lesson 4 on Daily Habits & routine actions in the Present Simple tense.',
    descriptionSinhala: 'දෛනික චර්යාවන් සහ සරල වර්තමාන කාලය (Present Simple) පිළිබඳ පාඩම අධ්‍යයනය කරන්න.',
    category: 'consistency',
    tier: 'Silver',
    iconType: 'sparkles',
    targetCount: 1,
    unit: 'lessons',
    sirCommendationSinhala: 'උදෑසන අවදි වීමේ සිට රාත්‍රී නින්ද දක්වා ඔබේ මුළු දවසම ඉංග්‍රීසියෙන් විස්තර කිරීමේ පූර්ණ ආත්ම විශ්වාසය ඔබට දැන් තියෙනවා.',
    actionTab: 'lessons',
  },
  {
    id: 'singlish-graduate',
    titleEnglish: 'Master Communicator',
    titleSinhala: 'විශිෂ්ට කථික සම්මානය',
    descriptionEnglish: 'Unlock at least 4 milestone badges and reach 250 XP total learning points.',
    descriptionSinhala: 'සමස්ත බැජ් 4ක් සම්පූර්ණ කර ලකුණු 250 ඉක්මවා යමින් උසස් කථික සාමාජිකත්වය දිනාගන්න.',
    category: 'speaking',
    tier: 'Master',
    iconType: 'trophy',
    targetCount: 4,
    unit: 'badges completed',
    sirCommendationSinhala: 'ඉතාමත්ම ආඩම්බරයි පැටියෝ! ඔබ දැන් ඩේසි ගුරුතුමියගේ Spoken English පාඨමාලාවේ ප්‍රමුඛතම විශිෂ්ට කථිකයෙක් ලෙස සහතික ලබයි!',
    actionTab: 'practice',
  },
];

const LOCAL_STORAGE_KEY = 'singlish_guru_student_progress_v2';
const LEGACY_STORAGE_KEY = 'singlish_guru_student_progress_v1';
const PROGRESS_VERSION = 2;

const LEGACY_DEMO_SEED: StudentProgress = {
  spokenPracticesCount: 1,
  highScorePronunciationsCount: 1,
  completedQuizzesCount: 2,
  mistakesMasteredCount: 2,
  askedQuestionsCount: 1,
  lessonsExploredCount: 3,
  xpPoints: 140,
};

function sanitizeProgress(value: unknown): StudentProgress {
  const input = value && typeof value === 'object' ? value as Partial<StudentProgress> : {};
  const safeNumber = (candidate: unknown) =>
    typeof candidate === 'number' && Number.isFinite(candidate) ? Math.max(0, Math.floor(candidate)) : 0;
  return {
    spokenPracticesCount: safeNumber(input.spokenPracticesCount),
    highScorePronunciationsCount: safeNumber(input.highScorePronunciationsCount),
    completedQuizzesCount: safeNumber(input.completedQuizzesCount),
    mistakesMasteredCount: safeNumber(input.mistakesMasteredCount),
    askedQuestionsCount: safeNumber(input.askedQuestionsCount),
    lessonsExploredCount: safeNumber(input.lessonsExploredCount),
    xpPoints: safeNumber(input.xpPoints),
    xpDay: typeof input.xpDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.xpDay) ? input.xpDay : undefined,
    xpEarnedToday: safeNumber(input.xpEarnedToday),
    bonusAiTokens: safeNumber(input.bonusAiTokens),
    rewardAdsWatched: safeNumber(input.rewardAdsWatched),
  };
}

export const DAILY_XP_CAP = 500;

export function getXpDay(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add local XP without allowing unlimited repeated clicks to inflate badges.
 * This is a UX safeguard only; cloud progress must never trust client XP.
 */
export function awardXp(progress: StudentProgress, requestedAmount: number, now = new Date()): StudentProgress {
  const day = getXpDay(now);
  const earned = progress.xpDay === day ? Math.min(DAILY_XP_CAP, progress.xpEarnedToday ?? 0) : 0;
  const amount = Number.isFinite(requestedAmount) ? Math.max(0, Math.floor(requestedAmount)) : 0;
  const granted = Math.min(amount, DAILY_XP_CAP - earned);
  return {
    ...progress,
    xpPoints: progress.xpPoints + granted,
    xpDay: day,
    xpEarnedToday: earned + granted,
  };
}

function migrateLegacyProgress(value: unknown): StudentProgress {
  const legacy = sanitizeProgress(value);
  return {
    ...legacy,
    spokenPracticesCount: Math.max(0, legacy.spokenPracticesCount - LEGACY_DEMO_SEED.spokenPracticesCount),
    highScorePronunciationsCount: Math.max(0, legacy.highScorePronunciationsCount - LEGACY_DEMO_SEED.highScorePronunciationsCount),
    completedQuizzesCount: Math.max(0, legacy.completedQuizzesCount - LEGACY_DEMO_SEED.completedQuizzesCount),
    mistakesMasteredCount: Math.max(0, legacy.mistakesMasteredCount - LEGACY_DEMO_SEED.mistakesMasteredCount),
    askedQuestionsCount: Math.max(0, legacy.askedQuestionsCount - LEGACY_DEMO_SEED.askedQuestionsCount),
    lessonsExploredCount: Math.max(0, legacy.lessonsExploredCount - LEGACY_DEMO_SEED.lessonsExploredCount),
    xpPoints: Math.max(0, legacy.xpPoints - LEGACY_DEMO_SEED.xpPoints),
  };
}

export function getSavedStudentProgress(): StudentProgress {
  if (typeof window === 'undefined') return INITIAL_STUDENT_PROGRESS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return sanitizeProgress(JSON.parse(raw).progress);

    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacyProgress(JSON.parse(legacyRaw));
      saveStudentProgress(migrated);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return migrated;
    }
  } catch (e) {
    console.warn('Failed to parse progress from localStorage', e);
  }
  return INITIAL_STUDENT_PROGRESS;
}

export function saveStudentProgress(progress: StudentProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ version: PROGRESS_VERSION, progress: sanitizeProgress(progress) }));
  } catch (e) {
    console.warn('Failed to save progress to localStorage', e);
  }
}

export function resetAllLearnerProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.removeItem('singlish_guru_mastered_flashcards');
}

export function calculateMilestoneBadges(progress: StudentProgress): MilestoneBadge[] {
  return MILESTONE_BADGES_CONFIG.map((config) => {
    let currentCount = 0;

    switch (config.id) {
      case 'pronunciation-expert':
        currentCount = progress.highScorePronunciationsCount;
        break;
      case 'grammar-master':
        currentCount = progress.completedQuizzesCount;
        break;
      case 'spoken-pioneer':
        currentCount = progress.spokenPracticesCount;
        break;
      case 'mistake-buster':
        currentCount = progress.mistakesMasteredCount;
        break;
      case 'active-inquirer':
        currentCount = progress.askedQuestionsCount;
        break;
      case 'habit-champion':
        currentCount = progress.lessonsExploredCount >= 4 ? 1 : 0;
        break;
      case 'singlish-graduate':
        // Count how many of the other 6 badges are unlocked
        currentCount = 0;
        break;
      default:
        currentCount = 0;
    }

    const isUnlocked = currentCount >= config.targetCount;

    return {
      ...config,
      currentCount: Math.min(currentCount, config.targetCount),
      isUnlocked,
      unlockedAt: isUnlocked ? 'Completed' : undefined,
    };
  }).map((badge, _, allBadges) => {
    // For master badge, count completed badges
    if (badge.id === 'singlish-graduate') {
      const otherUnlockedCount = allBadges.filter(
        (b) => b.id !== 'singlish-graduate' && b.isUnlocked
      ).length;
      const isMasterUnlocked = otherUnlockedCount >= badge.targetCount && progress.xpPoints >= 250;
      return {
        ...badge,
        currentCount: Math.min(otherUnlockedCount, badge.targetCount),
        isUnlocked: isMasterUnlocked,
        unlockedAt: isMasterUnlocked ? 'Awarded by Teacher Daisy' : undefined,
      };
    }
    return badge;
  });
}
