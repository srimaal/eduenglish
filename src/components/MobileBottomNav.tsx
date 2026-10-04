import React from 'react';
import { BookOpen, Calendar, HelpCircle, Mic, MessageSquare, Award } from 'lucide-react';

export type AppTabType = 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge';

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
    { id: 'daily-challenge' as const, label: 'Daily', sinhala: 'අභියෝගය', icon: Calendar },
    { id: 'practice' as const, label: 'Q&A', sinhala: 'ප්‍රශ්න', icon: HelpCircle },
    { id: 'pronunciation' as const, label: 'Voice', sinhala: 'හඬ පුහුණුව', icon: Mic },
    { id: 'ask-sir' as const, label: 'Ask Sir', sinhala: 'සර්ගෙන්', icon: MessageSquare },
    { id: 'milestones' as const, label: 'Badges', sinhala: 'පදක්කම්', icon: Award, badge: unlockedBadgesCount },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e7e2d9] shadow-lg pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-6 items-center px-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                isActive
                  ? 'text-[#b45309] font-bold'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 px-1 rounded-full bg-[#b45309] text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight leading-none truncate max-w-full">
                {tab.sinhala}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
