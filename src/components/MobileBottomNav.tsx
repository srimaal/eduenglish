import React from 'react';
import { BookOpen, Layers, Calendar, HelpCircle, Mic, Award } from 'lucide-react';

export type AppTabType = 'lessons' | 'flashcards' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge';

interface MobileBottomNavProps {
  activeTab: AppTabType;
  onTabChange: (tab: AppTabType) => void;
  unlockedBadgesCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  unlockedBadgesCount = 0,
}) => {
  const tabs = [
    { id: 'lessons' as const, label: 'Lessons', sinhala: 'පාඩම්', icon: BookOpen },
    { id: 'flashcards' as const, label: 'Cards', sinhala: 'කාඩ්පත්', icon: Layers },
    { id: 'daily-challenge' as const, label: 'Daily', sinhala: 'අභියෝගය', icon: Calendar },
    { id: 'practice' as const, label: 'Q&A', sinhala: 'ප්‍රශ්න', icon: HelpCircle },
    { id: 'pronunciation' as const, label: 'Voice', sinhala: 'හඬ', icon: Mic },
    { id: 'ask-sir' as const, label: 'Daisy', sinhala: 'ඩේසි මිස්', isMascot: true },
    { id: 'milestones' as const, label: 'Badges', sinhala: 'පදක්කම්', icon: Award, badge: unlockedBadgesCount },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-t border-[#e7e2d9] shadow-xl pb-[env(safe-area-inset-bottom)] px-1.5 py-1.5"
    >
      <div className="grid grid-cols-7 items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 cursor-pointer select-none relative ${
                isActive
                  ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] shadow-md translate-y-[1px]'
                  : 'bg-white hover:bg-[#fffcf7] text-[#57534e] border border-[#e7e2d9] border-b-[2.5px] border-b-[#d6cfc4] active:border-b active:translate-y-[1.5px] shadow-2xs'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.isMascot ? (
                  <span className="text-base -my-0.5">🐮</span>
                ) : (
                  Icon && <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5] text-amber-200' : 'stroke-[1.8] text-[#78716c]'}`} />
                )}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-3.5 h-3.5 px-1 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black flex items-center justify-center border border-amber-500 shadow-2xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold mt-0.5 tracking-tight leading-none truncate max-w-full ${isActive ? 'text-white' : 'text-[#57534e]'}`}>
                {tab.sinhala}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
