import React, { useState } from 'react';
import { MilestoneBadge, StudentProgress } from '../types';
import {
  Award,
  Mic,
  BookOpen,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  MessageSquare,
  ArrowRight,
  Volume2,
  Check,
  ChevronRight,
  Medal,
  GraduationCap
} from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';

interface MilestoneDashboardProps {
  badges: MilestoneBadge[];
  progress: StudentProgress;
  onNavigateTab: (tab: 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'daily-challenge' | 'milestones') => void;
  onResetProgress: () => void;
  audioSpeed: number;
}

export const MilestoneDashboard: React.FC<MilestoneDashboardProps> = ({
  badges,
  progress,
  onNavigateTab,
  onResetProgress,
  audioSpeed,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalBadges = badges.length;
  const completionPercentage = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = badges.filter((badge) => {
    if (filterCategory === 'unlocked') return badge.isUnlocked;
    if (filterCategory === 'locked') return !badge.isUnlocked;
    return true;
  });

  const handlePlayCommendation = (badge: MilestoneBadge) => {
    speakEnglish(
      `Congratulations! You have unlocked the ${badge.titleEnglish} milestone badge with Teacher Daisy. Keep speaking English with confidence!`,
      audioSpeed
    );
  };

  const renderBadgeIcon = (iconType: MilestoneBadge['iconType'], tier: MilestoneBadge['tier'], isUnlocked: boolean) => {
    const iconClass = isUnlocked ? 'w-6 h-6' : 'w-6 h-6 opacity-60';
    switch (iconType) {
      case 'mic':
        return <Mic className={iconClass} />;
      case 'book':
        return <BookOpen className={iconClass} />;
      case 'flame':
        return <Flame className={iconClass} />;
      case 'check':
        return <Check className={iconClass} />;
      case 'message':
        return <MessageSquare className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'trophy':
      default:
        return <Trophy className={iconClass} />;
    }
  };

  const getTierColorStyle = (tier: MilestoneBadge['tier'], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        cardBg: 'bg-white border-[#e7e2d9] text-stone-400',
        badgeBg: 'bg-stone-100 text-stone-400 border-stone-200',
        tagText: 'Locked',
      };
    }

    switch (tier) {
      case 'Master':
        return {
          cardBg: 'bg-gradient-to-br from-[#1c2e26] to-[#0f1d17] border-[#86efac]/50 text-white shadow-md',
          badgeBg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 border-amber-300 ring-2 ring-amber-400/40',
          tagText: 'Master Milestone',
        };
      case 'Gold':
        return {
          cardBg: 'bg-gradient-to-b from-[#fffbeb] to-white border-[#fde68a] text-[#1c1917] shadow-xs',
          badgeBg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white border-amber-300 ring-2 ring-amber-300/40',
          tagText: 'Gold Tier',
        };
      case 'Silver':
        return {
          cardBg: 'bg-gradient-to-b from-[#f8fafc] to-white border-slate-200 text-[#1c1917] shadow-xs',
          badgeBg: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white border-slate-300 ring-2 ring-slate-300/40',
          tagText: 'Silver Tier',
        };
      case 'Bronze':
      default:
        return {
          cardBg: 'bg-gradient-to-b from-[#fff7ed] to-white border-orange-200 text-[#1c1917] shadow-xs',
          badgeBg: 'bg-gradient-to-br from-orange-400 to-amber-700 text-white border-orange-300',
          tagText: 'Bronze Tier',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#f5efe6] via-[#faf8f5] to-[#f5efe6] rounded-3xl border border-[#e7e2d9] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-[#fef3c7]/60 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#b45309] uppercase tracking-wider bg-[#fef3c7] px-3 py-1 rounded-full border border-[#fde68a]">
              <Trophy className="w-3.5 h-3.5" />
              <span>ඩේසි ගුරුතුමියගේ Spoken English ඇගයීම් පුවරුව</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917] tracking-tight">
              Milestone Dashboard & Digital Badges
            </h2>

            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              ඔබ පාඩම් අධ්‍යයනය කරමින්, හඬ හඳුනාගැනීමෙන් කතා කරමින් සහ ප්‍රශ්නාවලිය ජයගන්නා විට 
              ඩිජිටල් කුසලතා බැජ් (Badges) අගුළු හැරේ. සෑම බැජ් එකක්ම ඔබේ කථන ප්‍රගතියේ සන්ධිස්ථානයකි.
            </p>
          </div>

          {/* Quick Level / XP Stats Box */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e7e2d9] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-[#78716c]">
              <span className="font-semibold">වත්මන් මට්ටම (Level)</span>
              <span className="font-bold text-[#b45309]">
                {unlockedCount >= 5 ? 'Confident Speaker' : unlockedCount >= 3 ? 'Active Learner' : 'Beginner Explorer'}
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#1c1917] mb-1">
                <span>{unlockedCount} of {totalBadges} Badges Unlocked</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-[#f5efe6] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-[#b45309] h-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f5f1e8] text-xs">
              <div>
                <span className="text-[#78716c] block text-[11px]">සමස්ත ලකුණු</span>
                <span className="font-bold text-[#1c1917] text-sm tabular-nums">{progress.xpPoints} XP</span>
              </div>
              <div>
                <span className="text-[#78716c] block text-[11px]">හඬ පුහුණු කිරීම්</span>
                <span className="font-bold text-[#1c1917] text-sm tabular-nums">{progress.spokenPracticesCount} වරක්</span>
              </div>
            </div>

            {unlockedCount >= 3 && (
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-[#1c2e26] hover:bg-[#2d4a3e] text-[#86efac] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                <span>ඩේසි ගුරුතුමියගේ ඇගයීම් සහතිකය බලන්න (Certificate)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs (Interactive Segmented Control compliant with Section 1.A) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] pb-4">
        <div className="flex items-center gap-1 p-1 bg-[#ede8df] rounded-xl text-xs">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterCategory === 'all'
                ? 'bg-white text-[#1c1917] shadow-xs font-semibold'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            onClick={() => setFilterCategory('unlocked')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterCategory === 'unlocked'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilterCategory('locked')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer ${
              filterCategory === 'locked'
                ? 'bg-white text-stone-800 shadow-xs font-semibold'
                : 'text-[#78716c] hover:text-[#1c1917]'
            }`}
          >
            In Progress ({totalBadges - unlockedCount})
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('ඔබේ සියලුම XP, badges සහ flashcard progress මකා දමන්නද?')) {
              onResetProgress();
            }
          }}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          Reset local XP, badges & flashcards
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBadges.map((badge) => {
          const isUnlocked = badge.isUnlocked;
          const tierStyles = getTierColorStyle(badge.tier, isUnlocked);
          const progressPercent = Math.min(100, Math.round((badge.currentCount / badge.targetCount) * 100));

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`rounded-2xl border p-5 transition-all cursor-pointer relative group flex flex-col justify-between ${tierStyles.cardBg} hover:shadow-md hover:-translate-y-0.5`}
            >
              <div>
                {/* Top Row: Insignia Icon & Status */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs border ${tierStyles.badgeBg}`}
                  >
                    {renderBadgeIcon(badge.iconType, badge.tier, isUnlocked)}
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider block ${
                        isUnlocked
                          ? badge.tier === 'Master'
                            ? 'text-emerald-400'
                            : 'text-[#b45309]'
                          : 'text-stone-400'
                      }`}
                    >
                      {isUnlocked ? '✓ Unlocked' : tierStyles.tagText}
                    </span>
                    <span className="text-[10px] text-[#78716c] block">
                      {badge.tier} Tier
                    </span>
                  </div>
                </div>

                {/* Badge Titles & Descriptions */}
                <div className="space-y-1 mb-4">
                  <h3
                    className={`text-lg font-bold tracking-tight ${
                      badge.tier === 'Master' && isUnlocked ? 'text-white' : 'text-[#1c1917]'
                    }`}
                  >
                    {badge.titleEnglish}
                  </h3>
                  <div
                    className={`text-xs font-semibold ${
                      badge.tier === 'Master' && isUnlocked ? 'text-[#86efac]' : 'text-[#78350f]'
                    }`}
                  >
                    {badge.titleSinhala}
                  </div>
                  <p
                    className={`text-xs leading-relaxed pt-1 line-clamp-2 ${
                      badge.tier === 'Master' && isUnlocked ? 'text-slate-300' : 'text-[#57534e]'
                    }`}
                  >
                    {badge.descriptionSinhala}
                  </p>
                </div>
              </div>

              {/* Bottom Progress or Commendation */}
              <div className="pt-3 border-t border-[#e7e2d9]/60 space-y-2">
                {!isUnlocked ? (
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-[#78716c] mb-1">
                      <span>ප්‍රගතිය: {badge.currentCount} / {badge.targetCount} {badge.unit}</span>
                      <span className="tabular-nums">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-[#ede8df] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>සම්පූර්ණයි (Unlocked)</span>
                    </span>
                    <span className="text-[11px] text-[#78716c] font-normal">විස්තර බලන්න →</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-[#e7e2d9] animate-in fade-in zoom-in-95 duration-200">
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                  selectedBadge.isUnlocked
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white ring-4 ring-amber-300/40'
                    : 'bg-stone-100 text-stone-400 border border-stone-200'
                }`}
              >
                {selectedBadge.isUnlocked ? (
                  renderBadgeIcon(selectedBadge.iconType, selectedBadge.tier, true)
                ) : (
                  <Lock className="w-7 h-7" />
                )}
              </div>

              <div className="flex-1">
                <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider block">
                  {selectedBadge.tier} Tier Milestone · {selectedBadge.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1c1917]">
                  {selectedBadge.titleEnglish}
                </h3>
                <div className="text-sm font-semibold text-[#78350f]">
                  {selectedBadge.titleSinhala}
                </div>
              </div>
            </div>

            {/* Criteria breakdown */}
            <div className="space-y-3 bg-[#faf8f5] rounded-2xl p-4 border border-[#e7ded0] text-xs">
              <div className="font-bold text-[#1c1917]">සුදුසුකම් සපුරාලීමේ අවශ්‍යතාවය:</div>
              <p className="text-[#57534e] leading-relaxed">
                {selectedBadge.descriptionSinhala}
              </p>
              <div className="text-[#78716c]">
                English: {selectedBadge.descriptionEnglish}
              </div>

              <div className="pt-2 border-t border-[#e7ded0]">
                <div className="flex justify-between font-semibold text-[#1c1917] mb-1">
                  <span>වත්මන් ලකුණු තත්වය:</span>
                  <span className="text-[#b45309]">
                    {selectedBadge.currentCount} / {selectedBadge.targetCount} {selectedBadge.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Teacher Daisy's commendation note */}
            <div className="bg-[#1c2e26] text-[#e2f0d9] rounded-2xl p-4 sm:p-5 space-y-2 border border-[#2d4a3e]">
              <div className="flex items-center justify-between text-xs text-[#86efac] font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ඩේසි ගුරුතුමියගේ පැසසුම් සටහන:</span>
                </span>
                {selectedBadge.isUnlocked && (
                  <button
                    onClick={() => handlePlayCommendation(selectedBadge)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#86efac] hover:underline cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>හඬ අසන්න</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{selectedBadge.sirCommendationSinhala}"
              </p>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2.5 rounded-xl border border-[#d6cfc4] text-[#57534e] hover:bg-[#faf8f5] text-xs font-semibold cursor-pointer"
              >
                වසන්න (Close)
              </button>

              <button
                onClick={() => {
                  const targetTab = selectedBadge.actionTab;
                  setSelectedBadge(null);
                  onNavigateTab(targetTab);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>පුහුණුවීම් වෙත යන්න (Go to Practice)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#fffefc] to-[#faf8f5] rounded-3xl max-w-2xl w-full p-8 sm:p-10 shadow-2xl border-4 border-[#b45309]/30 relative overflow-hidden">
            {/* Certificate Header border ornament */}
            <div className="border-2 border-[#b45309] rounded-2xl p-6 sm:p-8 text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-[#b45309] text-white flex items-center justify-center mx-auto shadow-md">
                <GraduationCap className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#b45309] block mb-1">
                  Singlish Guru · Sri Lanka
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1917]">
                  Certificate of Spoken English Milestone
                </h3>
                <div className="text-xs text-[#78716c] mt-0.5">
                  ඉංග්‍රීසි කථන කුසලතා ඇගයීම් සහතිකය
                </div>
              </div>

              <div className="w-24 h-0.5 bg-[#b45309]/40 mx-auto" />

              <p className="text-xs sm:text-sm text-[#57534e] max-w-lg mx-auto leading-relaxed">
                This honors your outstanding dedication in mastering spoken English grammar, 
                overcoming the Sinhala-to-English word order barrier (S-V-O), and perfecting 
                pronunciation with voice recognition technology.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#e7e2d9] text-left text-xs">
                <div>
                  <span className="text-[#78716c] block text-[11px]">Milestones Achieved:</span>
                  <span className="font-bold text-[#1c1917]">{unlockedCount} Digital Badges Unlocked</span>
                </div>
                <div className="text-right">
                  <span className="text-[#78716c] block text-[11px]">Educator & Mentor:</span>
                  <span className="font-bold text-[#b45309]">Teacher Daisy (ඩේසි ගුරුතුමිය)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-6 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                ස්තූතියි ඩේසි ගුරුතුමිය! (Close Certificate)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
