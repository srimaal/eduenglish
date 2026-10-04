import React from 'react';
import { Volume2, Volume1, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge';
  setActiveTab: (tab: 'lessons' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge') => void;
  audioSpeed: number;
  setAudioSpeed: (speed: number) => void;
  unlockedBadgesCount?: number;
  onOpenAdSenseSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  audioSpeed,
  setAudioSpeed,
  unlockedBadgesCount = 0,
  onOpenAdSenseSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e7e2d9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab('lessons')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#b45309] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              සි
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#1c1917] block leading-tight">
                Singlish Guru
              </span>
              <span className="text-xs text-[#78350f] font-medium block leading-none">
                සිංහලෙන් ඉංග්‍රීසි පන්තිය
              </span>
            </div>
          </button>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-[#57534e]">
            <button
              onClick={() => setActiveTab('lessons')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer ${
                activeTab === 'lessons'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              Lessons <span className="text-xs text-[#78716c]">(පාඩම්)</span>
            </button>
            <button
              onClick={() => setActiveTab('pronunciation')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer ${
                activeTab === 'pronunciation'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              Pronunciation Lab <span className="text-xs text-[#78716c]">(උච්චාරණය)</span>
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer ${
                activeTab === 'practice'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              Practice Quiz <span className="text-xs text-[#78716c]">(ප්‍රශ්නාවලිය)</span>
            </button>
            <button
              onClick={() => setActiveTab('mistakes')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer ${
                activeTab === 'mistakes'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              Mistakes Guide <span className="text-xs text-[#78716c]">(වැරදි හදමු)</span>
            </button>
            <button
              onClick={() => setActiveTab('daily-challenge')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'daily-challenge'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              <span>Daily 100 MCQs</span>
              <span className="text-xs text-[#78716c]">(අභියෝගය)</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-200">
                100
              </span>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'milestones'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              <span>Milestones</span>
              <span className="text-xs text-[#78716c]">(බැජ්)</span>
              {unlockedBadgesCount > 0 && (
                <span className="text-[10px] font-bold bg-[#fef3c7] text-[#92400e] px-1.5 py-0.2 rounded-full border border-[#fde68a]">
                  {unlockedBadgesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ask-sir')}
              className={`hover:text-[#1c1917] transition-colors relative py-1 cursor-pointer ${
                activeTab === 'ask-sir'
                  ? 'text-[#b45309] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#b45309]'
                  : ''
              }`}
            >
              Ask Sir <span className="text-xs text-[#78716c]">(සර් සමඟ කතාබස්)</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions (Speed Control & Fast Tab Switch) */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center bg-[#ede8df] rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setAudioSpeed(0.75)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  audioSpeed === 0.75
                    ? 'bg-white text-[#b45309] shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Slow Audio (ආරම්භක සිසුන් සඳහා සෙමින් හඬ)"
              >
                <Volume1 className="w-3.5 h-3.5" />
                <span>0.75x Slow</span>
              </button>
              <button
                onClick={() => setAudioSpeed(1.0)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  audioSpeed === 1.0
                    ? 'bg-white text-[#b45309] shadow-xs'
                    : 'text-[#78716c] hover:text-[#1c1917]'
                }`}
                title="Normal Conversational Speed (සාමාන්‍ය කතාබහේ වේගය)"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>1.0x Normal</span>
              </button>
            </div>

            {onOpenAdSenseSettings && (
              <button
                onClick={onOpenAdSenseSettings}
                className="p-1.5 rounded-lg border border-[#d6cfc4] hover:border-[#b45309] hover:bg-[#faf8f5] text-[#78716c] hover:text-[#1c1917] transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Google AdSense Configuration"
              >
                <span className="font-bold text-[10px] text-[#b45309]">Ad</span>
              </button>
            )}

            <PWAInstallButton />

            <button
              onClick={() => setActiveTab('ask-sir')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#b45309] hover:bg-[#92400e] rounded-lg transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Sir Sri Maal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 gap-2 border-t border-[#e7e2d9] bg-[#f5f1e8] text-xs">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'lessons' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          Lessons
        </button>
        <button
          onClick={() => setActiveTab('pronunciation')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'pronunciation' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          Pronunciation Lab
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'practice' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          Practice Quiz
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'mistakes' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          Mistakes
        </button>
        <button
          onClick={() => setActiveTab('daily-challenge')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium flex items-center gap-1 ${
            activeTab === 'daily-challenge' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          <span>100 MCQs</span>
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'milestones' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          Milestones
        </button>
        <button
          onClick={() => setActiveTab('ask-sir')}
          className={`px-3 py-1 rounded-md whitespace-nowrap font-medium ${
            activeTab === 'ask-sir' ? 'bg-[#b45309] text-white' : 'bg-white text-[#57534e]'
          }`}
        >
          Ask Sir
        </button>
      </div>
    </header>
  );
};
