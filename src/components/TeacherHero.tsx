import React, { useState } from 'react';
import { Volume2, Mic, BookOpen, CheckCircle2, Award } from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';
import { PWAInstallButton } from './PWAInstallButton';

interface TeacherHeroProps {
  onStartLesson: () => void;
  onTryVoice: () => void;
  audioSpeed: number;
}

export const TeacherHero: React.FC<TeacherHeroProps> = ({
  onStartLesson,
  onTryVoice,
  audioSpeed,
}) => {
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const handlePlayGreeting = () => {
    setIsPlayingGreeting(true);
    speakEnglish(
      'Ayubowan! Welcome to our English class. Do not be afraid to make mistakes. Let us learn spoken English together, step by step!',
      audioSpeed,
      1.0,
      () => setIsPlayingGreeting(false)
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f5efe6] to-[#faf8f5] border-b border-[#e7e2d9] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Zone */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#b45309] bg-[#fef3c7] px-3 py-1 rounded-full border border-[#fde68a]">
              <span>ශ්‍රී ලාංකික සිසුන් සඳහා විශේෂිතයි</span>
              <span aria-hidden="true">·</span>
              <span>Sinhala to Spoken English</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1c1917] leading-tight">
              සිංහලෙන් ඉගෙන ගනිමු <br />
              <span className="text-[#b45309]">පැහැදිලි Spoken English</span>
            </h1>

            <p className="text-base sm:text-lg text-[#57534e] leading-relaxed max-w-2xl">
              "ඉංග්‍රීසි කතා කරන්න බැරි වචන නොදන්න නිසා නෙවෙයි පුතා, බය නිසයි! 
              සිංහල මානසිකත්වයෙන් මිදිලා, හරිම වාක්‍ය රටාව (SVO) සහ නිවැරදි උච්චාරණය 
              මගෙත් එක්ක හඬ නගලා පුහුණු වෙන්න."
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartLesson}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#b45309] hover:bg-[#92400e] rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>පාඩම් මාලාව ආරම්භ කරන්න (Lessons)</span>
              </button>

              <button
                onClick={onTryVoice}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#1c1917] bg-white hover:bg-[#f5f1e8] border border-[#d6cfc4] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#b45309]" />
                <span>හඬින් පුහුණු වන්න (Voice Lab)</span>
              </button>

              <button
                onClick={handlePlayGreeting}
                disabled={isPlayingGreeting}
                className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium rounded-xl border border-[#b45309]/30 transition-all ${
                  isPlayingGreeting
                    ? 'bg-[#fef3c7] text-[#92400e] animate-pulse'
                    : 'bg-[#fffbeb] text-[#b45309] hover:bg-[#fef3c7]'
                }`}
                title="සර්ගේ කටහඬින් සුබපැතුම අසන්න"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingGreeting ? 'සර් කතා කරයි...' : 'සර්ගේ සුබපැතුම අසන්න'}</span>
              </button>

              <PWAInstallButton variant="hero" />
            </div>

            {/* Feature highlights without pills */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#e7e2d9]/80 text-xs sm:text-sm text-[#57534e]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>සම්පූර්ණ සිංහල පැහැදිලි කිරීම්</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>හඬ හඳුනාගැනීම (Pronunciation)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803d] shrink-0" />
                <span>ලාංකික වැරදි නිවැරදි කිරීම</span>
              </div>
            </div>
          </div>

          {/* Right Educator Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-[#e7e2d9] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#fef3c7]/60 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#b45309] to-[#78350f] text-white flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 relative">
                  <span>ශ්‍රී</span>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#1c1917]">Sir Sri Maal (ශ්‍රී මාල් සර්)</h2>
                  <p className="text-xs text-[#78716c]">English Mentor & Journalist</p>
                  <p className="text-xs text-[#b45309] font-medium mt-0.5">ඉංග්‍රීසි උපදේශක සහ මාධ්‍යවේදී</p>
                </div>
              </div>

              {/* Classroom Blackboard mini card */}
              <div className="bg-[#1c2e26] text-[#e2f0d9] rounded-xl p-4 font-mono text-xs shadow-inner space-y-2.5 border border-[#2d4a3e]">
                <div className="flex items-center justify-between text-[#86efac] border-b border-[#2d4a3e] pb-1.5 font-sans font-semibold">
                  <span>සර්ගේ අද දවසේ රීතිය (Sir's Golden Rule)</span>
                  <span className="text-[10px] bg-[#2d4a3e] px-1.5 py-0.5 rounded text-emerald-200">Tip #1</span>
                </div>
                <div className="space-y-1 font-sans text-xs">
                  <div className="text-amber-200 font-medium">සිංහල සිතුවිල්ල:</div>
                  <div className="text-slate-300">"මම [1] + බත් [2] + කනවා [3]" (S - O - V)</div>
                  <div className="text-emerald-300 font-medium pt-1">ඉංග්‍රීසි කථනය:</div>
                  <div className="text-white font-semibold">"I [1] + eat [3] + rice [2]" (S - V - O)</div>
                </div>
                <div className="text-[11px] text-emerald-200/90 italic pt-1 border-t border-[#2d4a3e]">
                  "ක්‍රියා පදය (Action) මැදට ගෙන කතා කරන්න පුතා!"
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-[#78716c]">
                <span>අද දින පුහුණුව: ආරම්භක මට්ටම</span>
                <span className="text-[#b45309] font-semibold">නොමිලේ ඉගෙන ගන්න</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
