import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TeacherHero } from './components/TeacherHero';
import { LessonProgressSection } from './components/LessonProgressSection';
import type { AccountUser } from './types/auth';
import { FlashcardDeck } from './components/FlashcardDeck';
import { PronunciationTrainer } from './components/PronunciationTrainer';
import { PracticeQuestions } from './components/PracticeQuestions';
import { CommonMistakesGuide } from './components/CommonMistakesGuide';
import { TeacherDaisyChat } from './components/TeacherDaisyChat';
import { MilestoneDashboard } from './components/MilestoneDashboard';
import { DailyChallengeDeck } from './components/DailyChallengeDeck';
import { AdSenseConfigModal } from './components/AdSenseConfigModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { KokoroLoadIndicator } from './components/KokoroLoadIndicator';
import { PhraseItem, StudentProgress } from './types';
import {
  getSavedStudentProgress,
  saveStudentProgress,
  calculateMilestoneBadges,
  resetAllLearnerProgress,
  awardXp,
} from './data/milestonesData';
import {
  getSavedAdSenseConfig,
  injectAdSenseScript,
} from './utils/adsenseManager';
import { Heart } from 'lucide-react';
import {
  OPEN_PRIVACY_EVENT,
  PRIVACY_CHANGED_EVENT,
  clearSinglishGuruLocalData,
  hasConsent,
} from './utils/privacyManager';

export default function App() {
  const [accountUser, setAccountUser] = useState<AccountUser | null | undefined>(undefined);
  const showDeveloperTools = import.meta.env.DEV && import.meta.env.VITE_ENABLE_ADMIN_TOOLS === 'true';
  const [activeTab, setActiveTab] = useState<
    'lessons' | 'flashcards' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge'
  >('lessons');
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [selectedPhraseForVoice, setSelectedPhraseForVoice] = useState<PhraseItem | null>(null);

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isAdSenseModalOpen, setIsAdSenseModalOpen] = useState<boolean>(false);

  // Student progress & badges state
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(() =>
    getSavedStudentProgress()
  );

  // Calculate badges dynamically based on progress
  const badges = calculateMilestoneBadges(studentProgress);
  const unlockedBadgesCount = badges.filter((b) => b.isUnlocked).length;

  useEffect(() => {
    saveStudentProgress(studentProgress);
  }, [studentProgress]);

  // Inject AdSense script on mount if clientId exists
  useEffect(() => {
    const loadAdsWhenAllowed = () => {
      const config = getSavedAdSenseConfig();
      if (hasConsent('advertising') && config.clientId && config.isEnabled) {
        injectAdSenseScript(config.clientId);
      }
    };
    const openPrivacy = () => setIsPrivacyModalOpen(true);
    loadAdsWhenAllowed();
    window.addEventListener(OPEN_PRIVACY_EVENT, openPrivacy);
    window.addEventListener(PRIVACY_CHANGED_EVENT, loadAdsWhenAllowed);
    return () => {
      window.removeEventListener(OPEN_PRIVACY_EVENT, openPrivacy);
      window.removeEventListener(PRIVACY_CHANGED_EVENT, loadAdsWhenAllowed);
    };
  }, []);

  const handlePhraseSelectForVoice = (phrase: PhraseItem) => {
    setSelectedPhraseForVoice(phrase);
    setActiveTab('pronunciation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePronunciationEvaluated = (score: number) => {
    setStudentProgress((prev) => {
      const isHigh = score >= 80;
      return awardXp({
        ...prev,
        spokenPracticesCount: prev.spokenPracticesCount + 1,
        highScorePronunciationsCount: isHigh
          ? prev.highScorePronunciationsCount + 1
          : prev.highScorePronunciationsCount,
      }, isHigh ? 30 : 15);
    });
  };

  const handleQuizAnswerCorrect = () => {
    setStudentProgress((prev) => awardXp({
      ...prev,
      completedQuizzesCount: prev.completedQuizzesCount + 1,
    }, 20));
  };

  const handleDailyMCQAnswerCorrect = () => {
    setStudentProgress((prev) => awardXp({
      ...prev,
      completedQuizzesCount: prev.completedQuizzesCount + 1,
    }, 15));
  };

  const handleChatSent = () => {
    setStudentProgress((prev) => awardXp({
      ...prev,
      askedQuestionsCount: prev.askedQuestionsCount + 1,
    }, 15));
  };

  const handleResetProgress = () => {
    resetAllLearnerProgress();
    setStudentProgress({
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
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1c1917] selection:bg-[#fde68a] selection:text-[#78350f] pb-16 md:pb-0">
      <OfflineIndicator />

      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioSpeed={audioSpeed}
        setAudioSpeed={setAudioSpeed}
        unlockedBadgesCount={unlockedBadgesCount}
        onUserChange={setAccountUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero banner shown on main lessons tab */}
        {activeTab === 'lessons' && (
          <TeacherHero
            onStartLesson={() => {
              const el = document.getElementById('lesson-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onTryVoice={() => setActiveTab('pronunciation')}
            onOpenFlashcards={() => setActiveTab('flashcards')}
            audioSpeed={audioSpeed}
          />
        )}

        {/* Tab 1: Spoken English guided practice steps */}
        {activeTab === 'lessons' && (
          <section id="lesson-section">
            <LessonProgressSection
              key={accountUser?.id ?? (accountUser === undefined ? 'checking' : 'guest')}
              user={accountUser}
              audioSpeed={audioSpeed}
              onSelectPhraseForVoice={handlePhraseSelectForVoice}
            />
          </section>
        )}

        {/* Tab: Spoken English Flashcards Deck (1,000 Cards) */}
        {activeTab === 'flashcards' && (
          <FlashcardDeck
            audioSpeed={audioSpeed}
            onMasterCard={() => {
              setStudentProgress((prev) => {
                const updated = awardXp({
                  ...prev,
                }, 20);
                saveStudentProgress(updated);
                return updated;
              });
            }}
          />
        )}

        {/* Tab 2: Voice Recognition Pronunciation Lab */}
        {activeTab === 'pronunciation' && (
          <PronunciationTrainer
            initialPhrase={selectedPhraseForVoice}
            audioSpeed={audioSpeed}
            onPronunciationEvaluated={handlePronunciationEvaluated}
          />
        )}

        {/* Tab 3: Interactive Practice Exercises & Questions */}
        {activeTab === 'practice' && (
          <PracticeQuestions
            audioSpeed={audioSpeed}
            onQuizAnswerCorrect={handleQuizAnswerCorrect}
          />
        )}

        {/* Tab 4: Common Sri Lankan English Mistakes Guide */}
        {activeTab === 'mistakes' && (
          <CommonMistakesGuide audioSpeed={audioSpeed} />
        )}

        {/* Tab 5: Daily Challenge 100 MCQs */}
        {activeTab === 'daily-challenge' && (
          <DailyChallengeDeck
            audioSpeed={audioSpeed}
            onAnswerCorrect={handleDailyMCQAnswerCorrect}
          />
        )}

        {/* Tab 6: Milestone Visual Dashboard & Digital Badges */}
        {activeTab === 'milestones' && (
          <MilestoneDashboard
            badges={badges}
            progress={studentProgress}
            onNavigateTab={setActiveTab}
            onResetProgress={handleResetProgress}
            audioSpeed={audioSpeed}
          />
        )}

        {/* Tab 7: Teacher Daisy AI consultation desk */}
        {activeTab === 'ask-sir' && (
          <TeacherDaisyChat
            audioSpeed={audioSpeed}
            onChatSent={handleChatSent}
          />
        )}
      </main>

      {/* Privacy Policy & AdSense Disclosure Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearLearningData={handleResetProgress}
        onClearAllLocalData={() => {
          clearSinglishGuruLocalData();
          window.location.reload();
        }}
      />

      {showDeveloperTools && (
        <AdSenseConfigModal
          isOpen={isAdSenseModalOpen}
          onClose={() => setIsAdSenseModalOpen(false)}
        />
      )}

      {/* Clean Footer without mechanical clutter */}
      <footer className="bg-white border-t border-[#e7e2d9] py-8 mt-16 text-xs text-[#78716c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#b45309] text-white flex items-center justify-center font-bold text-xs">
              🐮
            </div>
            <span className="font-bold text-[#1c1917]">Singlish Guru</span>
            <span aria-hidden="true">·</span>
            <span>ඩේසි ගුරුතුමියගේ Spoken English පන්තිය</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {showDeveloperTools && (
              <button
                type="button"
                onClick={() => setIsAdSenseModalOpen(true)}
                className="text-xs text-amber-700 hover:underline cursor-pointer"
              >
                Developer: AdSense settings
              </button>
            )}
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-xs text-[#78716c] hover:text-[#b45309] hover:underline cursor-pointer transition-colors"
            >
              Privacy Policy & AdSense Notice (රහස්‍යතා ප්‍රතිපත්තිය)
            </button>

            <div className="flex items-center gap-1.5 text-[#57534e]">
              <span>බය නැතුව ඉංග්‍රීසි කතා කරමු</span>
              <Heart className="w-3.5 h-3.5 text-[#b45309] fill-[#b45309]" />
              <span>Speak without fear!</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile App Native Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unlockedBadgesCount={unlockedBadgesCount}
      />
      <KokoroLoadIndicator />
    </div>
  );
}
