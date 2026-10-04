import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TeacherHero } from './components/TeacherHero';
import { LessonDeck } from './components/LessonDeck';
import { PronunciationTrainer } from './components/PronunciationTrainer';
import { PracticeQuestions } from './components/PracticeQuestions';
import { CommonMistakesGuide } from './components/CommonMistakesGuide';
import { AskSirChat } from './components/AskSirChat';
import { MilestoneDashboard } from './components/MilestoneDashboard';
import { DailyChallengeDeck } from './components/DailyChallengeDeck';
import { AdSenseBanner } from './components/AdSenseBanner';
import { AdSenseConfigModal } from './components/AdSenseConfigModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PhraseItem, StudentProgress } from './types';
import {
  getSavedStudentProgress,
  saveStudentProgress,
  calculateMilestoneBadges,
} from './data/milestonesData';
import {
  getSavedAdSenseConfig,
  injectAdSenseScript,
} from './utils/adsenseManager';
import { Heart, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge'
  >('lessons');
  const [audioSpeed, setAudioSpeed] = useState<number>(0.85);
  const [selectedPhraseForVoice, setSelectedPhraseForVoice] = useState<PhraseItem | null>(null);

  // AdSense configuration modal state
  const [isAdSenseModalOpen, setIsAdSenseModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

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
    const config = getSavedAdSenseConfig();
    if (config.clientId && config.isEnabled) {
      injectAdSenseScript(config.clientId);
    }
  }, []);

  const handlePhraseSelectForVoice = (phrase: PhraseItem) => {
    setSelectedPhraseForVoice(phrase);
    setActiveTab('pronunciation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePronunciationEvaluated = (score: number) => {
    setStudentProgress((prev) => {
      const isHigh = score >= 80;
      return {
        ...prev,
        spokenPracticesCount: prev.spokenPracticesCount + 1,
        highScorePronunciationsCount: isHigh
          ? prev.highScorePronunciationsCount + 1
          : prev.highScorePronunciationsCount,
        xpPoints: prev.xpPoints + (isHigh ? 30 : 15),
      };
    });
  };

  const handleQuizAnswerCorrect = () => {
    setStudentProgress((prev) => ({
      ...prev,
      completedQuizzesCount: prev.completedQuizzesCount + 1,
      xpPoints: prev.xpPoints + 20,
    }));
  };

  const handleDailyMCQAnswerCorrect = () => {
    setStudentProgress((prev) => ({
      ...prev,
      completedQuizzesCount: prev.completedQuizzesCount + 1,
      xpPoints: prev.xpPoints + 15,
    }));
  };

  const handleChatSent = () => {
    setStudentProgress((prev) => ({
      ...prev,
      askedQuestionsCount: prev.askedQuestionsCount + 1,
      xpPoints: prev.xpPoints + 15,
    }));
  };

  const handleSimulateProgressAction = (type: 'pronunciation' | 'quiz' | 'mistake' | 'chat') => {
    setStudentProgress((prev) => {
      switch (type) {
        case 'pronunciation':
          return {
            ...prev,
            spokenPracticesCount: prev.spokenPracticesCount + 1,
            highScorePronunciationsCount: prev.highScorePronunciationsCount + 1,
            xpPoints: prev.xpPoints + 30,
          };
        case 'quiz':
          return {
            ...prev,
            completedQuizzesCount: prev.completedQuizzesCount + 1,
            xpPoints: prev.xpPoints + 20,
          };
        case 'mistake':
          return {
            ...prev,
            mistakesMasteredCount: prev.mistakesMasteredCount + 1,
            xpPoints: prev.xpPoints + 20,
          };
        case 'chat':
          return {
            ...prev,
            askedQuestionsCount: prev.askedQuestionsCount + 1,
            xpPoints: prev.xpPoints + 15,
          };
        default:
          return prev;
      }
    });
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
        onOpenAdSenseSettings={() => setIsAdSenseModalOpen(true)}
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
            audioSpeed={audioSpeed}
          />
        )}

        {/* Tab 1: Spoken English Lessons & Audio Phrases (1,000 Lessons) */}
        {activeTab === 'lessons' && (
          <section id="lesson-section">
            <LessonDeck
              audioSpeed={audioSpeed}
              onSelectPhraseForVoice={handlePhraseSelectForVoice}
              onGoToQuiz={() => setActiveTab('practice')}
            />
          </section>
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
            onSimulateProgressAction={handleSimulateProgressAction}
            audioSpeed={audioSpeed}
          />
        )}

        {/* Tab 7: Ask Sir Sri Maal AI Teacher Consultation Desk */}
        {activeTab === 'ask-sir' && (
          <AskSirChat
            audioSpeed={audioSpeed}
            onChatSent={handleChatSent}
          />
        )}

        {/* Responsive Google AdSense Banner Slot */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <AdSenseBanner onOpenSettings={() => setIsAdSenseModalOpen(true)} />
        </div>
      </main>

      {/* AdSense Configuration Modal */}
      <AdSenseConfigModal
        isOpen={isAdSenseModalOpen}
        onClose={() => setIsAdSenseModalOpen(false)}
      />

      {/* Privacy Policy & AdSense Disclosure Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Clean Footer without mechanical clutter */}
      <footer className="bg-white border-t border-[#e7e2d9] py-8 mt-16 text-xs text-[#78716c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#b45309] text-white flex items-center justify-center font-bold text-xs">
              සි
            </div>
            <span className="font-bold text-[#1c1917]">Singlish Guru</span>
            <span aria-hidden="true">·</span>
            <span>ශ්‍රී මාල් සර්ගේ Spoken English පන්තිය</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-xs text-[#78716c] hover:text-[#b45309] hover:underline cursor-pointer transition-colors"
            >
              Privacy Policy & AdSense Notice (රහස්‍යතා ප්‍රතිපත්තිය)
            </button>

            <button
              onClick={() => setIsAdSenseModalOpen(true)}
              className="text-xs text-[#78716c] hover:text-[#b45309] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>AdSense Settings</span>
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
    </div>
  );
}
