export interface PhraseItem {
  id: string;
  english: string;
  sinhala: string;
  singlishPronunciation: string; // e.g. "[අයි ඈම් රෙඩි]"
  notesSinhala?: string;
  teacherAudioTip?: string;
  category?: string;
}

export interface CommonMistakeItem {
  incorrect: string;
  correct: string;
  explanationSinhala: string;
  contextExample?: string;
}

export interface Lesson {
  id: string;
  number: number;
  titleEnglish: string;
  titleSinhala: string;
  level: 'Beginner 1' | 'Beginner 2' | 'Intermediate';
  summarySinhala: string;
  grammarRule: {
    ruleTitleSinhala: string;
    explanationSinhala: string;
    sinhalaVsEnglishPattern: {
      sinhalaOrder: string;
      englishOrder: string;
      exampleSinhala: string;
      exampleEnglish: string;
    };
  };
  phrases: PhraseItem[];
  commonMistake: CommonMistakeItem;
  teacherVoiceAdviceSinhala: string;
}

export interface FlashcardItem {
  id: number;
  cardNumber: number;
  category: string;
  categorySinhala: string;
  frontPromptSinhala: string;
  frontHintEnglish?: string;
  backEnglish: string;
  backSinglishPronunciation: string;
  backSinhalaMeaning: string;
  exampleSentenceEnglish: string;
  exampleSentenceSinhala: string;
  teacherDaisyTip: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type QuestionType = 'choice' | 'voice' | 'reorder' | 'mistake-fix';

export interface PracticeQuestion {
  id: string;
  type: QuestionType;
  category: string;
  sinhalaPrompt: string;
  targetEnglish: string;
  singlishPronunciation?: string;
  options?: string[];
  correctAnswer: string | number;
  explanationSinhala: string;
  wordsForReorder?: string[];
  audioHint?: string;
}

export interface DailyMCQItem {
  id: number;
  questionNumber: number;
  category: string;
  topicSinhala: string;
  sinhalaPrompt: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanationSinhala: string;
  singlishPronunciation?: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
}

export interface WordAnalysis {
  word: string;
  status: 'perfect' | 'near' | 'missed';
  recognizedAs?: string;
}

export interface PronunciationResult {
  target: string;
  transcript: string;
  accuracyScore: number;
  words: WordAnalysis[];
  feedbackSinhala: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sir';
  text: string;
  timestamp: string;
}

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Master';

export interface MilestoneBadge {
  id: string;
  titleEnglish: string;
  titleSinhala: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  category: 'pronunciation' | 'grammar' | 'speaking' | 'consistency' | 'vocabulary' | 'community';
  tier: BadgeTier;
  iconType: 'mic' | 'book' | 'flame' | 'sparkles' | 'check' | 'message' | 'trophy';
  currentCount: number;
  targetCount: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  sirCommendationSinhala: string;
  actionTab: 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir';
}

export interface StudentProgress {
  spokenPracticesCount: number;
  highScorePronunciationsCount: number; // >= 80%
  completedQuizzesCount: number;
  mistakesMasteredCount: number;
  askedQuestionsCount: number;
  lessonsExploredCount: number;
  xpPoints: number;
  bonusAiTokens?: number;
  rewardAdsWatched?: number;
}
