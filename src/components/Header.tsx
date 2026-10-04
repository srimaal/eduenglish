import React from 'react';
import { Volume2, Volume1, Gift, BookOpen, Mic, HelpCircle, AlertCircle, Award, Sparkles, MessageSquare } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge';
  setActiveTab: (tab: 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge') => void;
  audioSpeed: number;
  setAudioSpeed: (speed: number) => void;
  unlockedBadgesCount?: number;
  onOpenRewardedAd?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  audioSpeed,
  setAudioSpeed,
  unlockedBadgesCount = 0,
  onOpenRewardedAd,
}) => {
  const menuItems = [
    {
      id: 'lessons' as const,
      label: 'Lessons',
      sinhala: 'පාඩම්',
      icon: BookOpen,
    },
    {
      id: 'pronunciation' as const,
      label: 'Voice Lab',
      sinhala: 'හඬ පුහුණුව',
      icon: Mic,
    },
    {
      id: 'practice' as const,
      label: 'Practice',
      sinhala: 'ප්‍රශ්න',
      icon: HelpCircle,
    },
    {
      id: 'mistakes' as const,
      label: 'Mistakes',
      sinhala: 'වැරදි',
      icon: AlertCircle,
    },
    {
      id: 'daily-challenge' as const,
      label: '100 MCQs',
      sinhala: 'අභියෝගය',
      icon: Sparkles,
      badge: '100',
    },
    {
      id: 'milestones' as const,
      label: 'Badges',
      sinhala: 'පදක්කම්',
      icon: Award,
      badge: unlockedBadgesCount > 0 ? String(unlockedBadgesCount) : undefined,
    },
    {
      id: 'ask-sir' as const,
      label: 'Teacher Daisy',
      sinhala: 'ඩේසි මිස්',
      icon: MessageSquare,
      isMascot: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e7e2d9] transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          {/* Zone 1: 3D Brand Logo Button */}
          <button
            onClick={() => setActiveTab('lessons')}
            className="group flex items-center gap-2.5 text-left focus-visible:outline-none cursor-pointer py-1 px-1.5 rounded-2xl hover:bg-black/5 active:translate-y-[2px] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#d97706] to-[#b45309] border-t border-amber-300 border-b-[3px] border-b-[#78350f] text-white flex items-center justify-center font-black text-xl shadow-md group-hover:shadow-lg group-active:border-b group-active:translate-y-[2px] transition-all">
              🐮
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-[#1c1917] block leading-tight">
                  Singlish Guru
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                  3D
                </span>
              </div>
              <span className="text-xs text-[#78350f] font-semibold block leading-none">
                ඩේසි ගුරුතුමියගේ පන්තිය
              </span>
            </div>
          </button>

          {/* Zone 2: 3D Menu Buttons Navigation (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1.5 py-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-x border-[#92400e] border-b-[3px] border-b-[#78350f] shadow-md translate-y-[1px]'
                      : 'bg-white hover:bg-[#fffcf7] text-[#57534e] hover:text-[#1c1917] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] hover:border-b-[#b8b0a2] active:border-b-[1px] active:translate-y-[2px] shadow-2xs'
                  }`}
                >
                  {item.isMascot ? (
                    <span className="text-sm -my-1">🐮</span>
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-[#78716c]'}`} />
                  )}
                  <span>{item.label}</span>
                  <span className={`text-[10px] font-normal ${isActive ? 'text-amber-100' : 'text-[#a8a29e]'}`}>
                    ({item.sinhala})
                  </span>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border shadow-2xs ${
                        isActive
                          ? 'bg-amber-300 text-amber-950 border-amber-200'
                          : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 3D Action Controls */}
          <div className="flex items-center gap-2">
            {/* 3D Mechanical Speed Toggle Switch */}
            <div className="hidden sm:flex items-center bg-[#ede8df] rounded-xl p-1 border border-[#ded7ca] border-b-2 border-b-[#c4bcad] shadow-inner text-xs">
              <button
                onClick={() => setAudioSpeed(0.75)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  audioSpeed === 0.75
                    ? 'bg-white text-[#b45309] border-t border-white border-b-2 border-b-[#b8b0a2] shadow-xs translate-y-[-1px]'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Slow Audio (සෙමින්)"
              >
                <Volume1 className="w-3.5 h-3.5" />
                <span>0.75x</span>
              </button>
              <button
                onClick={() => setAudioSpeed(1.0)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  audioSpeed === 1.0
                    ? 'bg-white text-[#b45309] border-t border-white border-b-2 border-b-[#b8b0a2] shadow-xs translate-y-[-1px]'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Normal Speed (සාමාන්‍ය)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>1.0x</span>
              </button>
            </div>

            {/* 3D Rewarded Ad Button */}
            {onOpenRewardedAd && (
              <button
                onClick={onOpenRewardedAd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#854d0e] bg-gradient-to-b from-[#fef08a] to-[#facc15] hover:from-[#fef9c3] hover:to-[#fde047] border border-[#eab308] border-b-[3px] border-b-[#ca8a04] active:border-b active:translate-y-[2px] rounded-xl shadow-xs transition-all cursor-pointer"
                title="නරඹා ත්‍යාග ලබාගන්න (Google Rewarded Ad)"
              >
                <Gift className="w-3.5 h-3.5 text-[#b45309]" />
                <span className="hidden sm:inline">ත්‍යාග</span>
                <span className="text-[10px] font-black bg-[#b45309] text-white px-1.5 py-0.2 rounded-md shadow-2xs">
                  +XP
                </span>
              </button>
            )}

            <PWAInstallButton />

            {/* 3D Primary Button: Teacher Daisy Chat */}
            <button
              onClick={() => setActiveTab('ask-sir')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] active:border-b active:translate-y-[2px] rounded-xl transition-all shadow-md cursor-pointer"
            >
              <span className="text-sm">🐮</span>
              <span className="hidden md:inline">Teacher Daisy</span>
              <span className="md:hidden">ගුරුතුමිය</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Mobile Tab Strip (Horizontal Scroll on Mobile/Tablet) */}
      <div className="xl:hidden flex overflow-x-auto py-2 px-3 gap-1.5 border-t border-[#e7e2d9] bg-[#f5f1e8] text-xs scrollbar-none">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold text-xs flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] shadow-sm translate-y-[1px]'
                  : 'bg-white text-[#57534e] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] shadow-2xs'
              }`}
            >
              {item.isMascot ? (
                <span className="text-sm">🐮</span>
              ) : (
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-[#78716c]'}`} />
              )}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                    isActive
                      ? 'bg-amber-300 text-amber-950 border-amber-200'
                      : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
