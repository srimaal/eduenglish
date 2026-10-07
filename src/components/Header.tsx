import React from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  ChevronDown,
  HelpCircle,
  Layers,
  Menu,
  MessageSquare,
  Mic,
  Sparkles,
  Volume1,
  Volume2,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { GoogleAccount } from './GoogleAccount';
import type { AccountUser } from '../types/auth';

type AppTab = 'lessons' | 'flashcards' | 'pronunciation' | 'practice' | 'mistakes' | 'ask-sir' | 'milestones' | 'daily-challenge';

interface HeaderProps {
  onUserChange?: (user: AccountUser | null) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  audioSpeed: number;
  setAudioSpeed: (speed: number) => void;
  unlockedBadgesCount?: number;
}

interface MenuItem {
  id: AppTab;
  label: string;
  sinhala: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  audioSpeed,
  setAudioSpeed,
  unlockedBadgesCount = 0,
  onUserChange,
}) => {
  const primaryItems: MenuItem[] = [
    { id: 'lessons', label: 'Lessons', sinhala: 'පාඩම්', icon: BookOpen },
    { id: 'pronunciation', label: 'Voice Lab', sinhala: 'හඬ පුහුණුව', icon: Mic },
    { id: 'practice', label: 'Practice', sinhala: 'ප්‍රශ්න', icon: HelpCircle },
  ];
  const moreItems: MenuItem[] = [
    { id: 'flashcards', label: 'Flashcards', sinhala: 'කාඩ්පත්', icon: Layers, badge: '1,000' },
    { id: 'mistakes', label: 'Common Mistakes', sinhala: 'වැරදි', icon: AlertCircle },
    { id: 'daily-challenge', label: 'Daily Challenge', sinhala: 'අභියෝගය', icon: Sparkles, badge: '100' },
    {
      id: 'milestones',
      label: 'Badges & Progress',
      sinhala: 'පදක්කම්',
      icon: Award,
      badge: unlockedBadgesCount > 0 ? String(unlockedBadgesCount) : undefined,
    },
  ];
  const moreIsActive = moreItems.some((item) => item.id === activeTab);

  const selectFromMenu = (tab: AppTab, target: HTMLElement) => {
    setActiveTab(tab);
    target.closest('details')?.removeAttribute('open');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e7e2d9] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2 xl:flex xl:min-h-16 xl:flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className="group flex items-center gap-2 min-w-0 rounded-xl p-1 hover:bg-black/5 cursor-pointer"
            aria-label="Go to lessons"
          >
            <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-b from-[#d97706] to-[#b45309] border-b-[3px] border-b-[#78350f] text-white flex items-center justify-center text-lg shadow-sm">
              🐮
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-base sm:text-lg font-black tracking-tight text-[#1c1917] leading-tight truncate">
                Singlish Guru
              </span>
              <span className="hidden lg:block text-[11px] text-[#78350f] font-semibold leading-none whitespace-nowrap">
                ඩේසි ගුරුතුමියගේ පන්තිය
              </span>
            </span>
          </button>

          <div className="col-span-2 row-start-2 flex min-w-0 flex-wrap items-center gap-2 xl:contents">
          <nav className="hidden md:flex items-center gap-1 xl:ml-2" aria-label="Primary navigation">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`h-9 px-2.5 xl:px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#92400e] text-white shadow-sm'
                      : 'text-[#57534e] hover:bg-white hover:text-[#1c1917]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-200' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <details className="relative group">
            <summary
              className={`h-9 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer list-none select-none ${
                moreIsActive ? 'bg-[#92400e] text-white' : 'bg-white text-[#57534e] border border-[#e7e2d9]'
              }`}
              aria-label="More navigation"
            >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">More</span>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-11 w-64 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-2xl bg-white border border-[#e7e2d9] shadow-xl p-2 z-50">
              <div className="md:hidden px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">Navigate</div>
              <div className="md:hidden">
                {primaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={(event) => selectFromMenu(item.id, event.currentTarget)}
                      className="w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left hover:bg-[#faf8f5] cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-[#b45309]" />
                      <span className="flex-1"><strong className="block text-xs">{item.label}</strong><span className="text-[11px] text-stone-500">{item.sinhala}</span></span>
                    </button>
                  );
                })}
                <div className="my-1 border-t border-[#eee9e1]" />
              </div>
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={(event) => selectFromMenu(item.id, event.currentTarget)}
                    className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left cursor-pointer ${
                      activeTab === item.id ? 'bg-amber-50 text-amber-950' : 'hover:bg-[#faf8f5] text-[#1c1917]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#b45309]" />
                    <span className="flex-1 min-w-0"><strong className="block text-xs truncate">{item.label}</strong><span className="text-[11px] text-stone-500">{item.sinhala}</span></span>
                    {item.badge && <span className="text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full px-2 py-0.5">{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          </details>

          <div className="ml-auto xl:ml-0 flex items-center gap-1.5 shrink-0">
            <div className="hidden lg:flex items-center bg-[#ede8df] rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setAudioSpeed(0.75)}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${audioSpeed === 0.75 ? 'bg-white text-[#b45309] shadow-xs' : 'text-[#78716c]'}`}
                title="Slow audio"
              >
                <Volume1 className="w-3.5 h-3.5" /> <span className="hidden xl:inline">0.75x</span>
              </button>
              <button
                type="button"
                onClick={() => setAudioSpeed(1)}
                className={`px-2 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer ${audioSpeed === 1 ? 'bg-white text-[#b45309] shadow-xs' : 'text-[#78716c]'}`}
                title="Normal audio"
              >
                <Volume2 className="w-3.5 h-3.5" /> <span className="hidden xl:inline">1x</span>
              </button>
            </div>

            <div className="hidden xl:block"><PWAInstallButton /></div>

            <button
              type="button"
              onClick={() => setActiveTab('ask-sir')}
              aria-label="Chat with Daisy"
              className={`h-9 px-2.5 sm:px-3 rounded-xl inline-flex items-center gap-1.5 text-xs font-bold text-white cursor-pointer whitespace-nowrap ${
                activeTab === 'ask-sir' ? 'bg-[#78350f]' : 'bg-gradient-to-b from-amber-600 to-amber-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daisy</span>
            </button>
          </div>
          </div>
          <div className="col-start-2 row-start-1 min-w-0 xl:ml-auto">
            <GoogleAccount onUserChange={onUserChange} />
          </div>
        </div>
      </div>
    </header>
  );
};
