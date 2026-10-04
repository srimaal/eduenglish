import React, { useState } from 'react';
import { Volume2, Mic, BookOpen, Layers, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';
import { PWAInstallButton } from './PWAInstallButton';
import { CowTeacherAvatar } from './CowTeacherAvatar';

interface TeacherHeroProps {
  onStartLesson: () => void;
  onTryVoice: () => void;
  onOpenFlashcards?: () => void;
  audioSpeed: number;
}

export const TeacherHero: React.FC<TeacherHeroProps> = ({
  onStartLesson,
  onTryVoice,
  onOpenFlashcards,
  audioSpeed,
}) => {
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const handlePlayGreeting = () => {
    setIsPlayingGreeting(true);
    speakEnglish(
      'Hello dear students! Welcome to my Spoken English class. Moo! Do not be afraid to make mistakes. Let us learn spoken English together, step by step with joy!',
      audioSpeed,
      1.1,
      () => setIsPlayingGreeting(false)
    );
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fefce8] via-[#faf8f5] to-[#f5efe6] border-b border-[#e7e2d9] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Zone */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b45309] bg-[#fef3c7] px-3.5 py-1.5 rounded-full border border-[#fde68a] shadow-2xs">
              <span>🐮 ඩේසි ගුරුතුමියගේ පාඩම් 1,000 ක විෂය මාලාව</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-800">1,000 Lessons Full Deck</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1c1917] leading-tight">
              සිංහලෙන් ඉගෙන ගනිමු <br />
              <span className="text-[#b45309]">Spoken English පාඩම් 1,000</span>
            </h1>

            <p className="text-base sm:text-lg text-[#57534e] leading-relaxed max-w-2xl">
              "ඉංග්‍රීසි කතා කරන්න බැරි වචන නොදන්න නිසා නෙවෙයි පැටියෝ, බය නිසයි! 
              ආචාර කිරීම් සිට ප්‍රසිද්ධ කථනය දක්වා ක්‍රමානුකූලව සකසන ලද <strong>පාඩම් 1,000 ක්</strong> 
              සහ නිවැරදි උච්චාරණය ඩේසි මිස් එක්ක හඬ නගලා පුහුණු වෙන්න."
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartLesson}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gradient-to-b from-[#b45309] to-[#92400e] border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] active:border-b active:translate-y-[2px] rounded-xl shadow-md transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>පාඩම් 1,000 මාලාවට යන්න (Explore 1,000 Lessons)</span>
              </button>

              <button
                onClick={onTryVoice}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#1c1917] bg-white hover:bg-[#f5f1e8] border border-[#d6cfc4] rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#b45309]" />
                <span>හඬින් පුහුණු වන්න (Voice Lab)</span>
              </button>

              {onOpenFlashcards && (
                <button
                  onClick={onOpenFlashcards}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#b45309] bg-amber-50 hover:bg-amber-100 border border-amber-300 border-b-[3px] border-b-amber-400 active:border-b active:translate-y-[2px] rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#b45309]" />
                  <span>කාඩ්පත් 1,000 (Flashcards)</span>
                </button>
              )}

              <button
                onClick={handlePlayGreeting}
                disabled={isPlayingGreeting}
                className={`inline-flex items-center gap-2 px-4 py-3 text-xs font-medium rounded-xl border border-[#b45309]/30 transition-all cursor-pointer ${
                  isPlayingGreeting
                    ? 'bg-[#fef3c7] text-[#92400e] animate-pulse'
                    : 'bg-[#fffbeb] text-[#b45309] hover:bg-[#fef3c7]'
                }`}
                title="ඩේසි ගුරුතුමියගේ කටහඬින් සුබපැතුම අසන්න"
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPlayingGreeting ? 'ගුරුතුමිය කතා කරයි...' : 'ගුරුතුමියගේ සුබපැතුම අසන්න'}</span>
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

          {/* Right Educator Card: Daisy Cow 3D Mascot */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#fef08a]/60 rounded-full blur-3xl pointer-events-none" />

              {/* 3D Mascot Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-100 to-amber-200 border border-amber-300 px-3 py-1 rounded-full mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>නිල 3D සංකේතය · Official 3D Mascot</span>
              </div>

              {/* Interactive 3D Mascot Avatar */}
              <div className="w-full flex justify-center py-2">
                <CowTeacherAvatar size="3d-mascot" is3dInteractive showBadge />
              </div>

              <div className="mt-3 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">
                  Teacher Daisy (ඩේසි ගුරුතුමිය)
                </h2>
                <p className="text-xs font-medium text-[#b45309]">
                  Spoken English Mentor & Official App Mascot
                </p>
                <p className="text-[11px] text-[#78716c] italic">
                  "Moo! 3D රූපය උඩට Cursor එක ගෙනගොස් ත්‍රිමාණ බලපෑම අත්විඳින්න"
                </p>
              </div>

              {/* Classroom Blackboard mini card */}
              <div className="w-full mt-4 bg-[#1c2e26] text-[#e2f0d9] rounded-2xl p-4 font-mono text-xs shadow-inner space-y-2 border border-[#2d4a3e] text-left">
                <div className="flex items-center justify-between text-[#86efac] border-b border-[#2d4a3e] pb-1.5 font-sans font-semibold">
                  <span>ඩේසි ගුරුතුමියගේ රන් රීතිය (Golden Rule)</span>
                  <span className="text-[10px] bg-[#2d4a3e] px-1.5 py-0.5 rounded text-emerald-200">Rule #1</span>
                </div>
                <div className="space-y-1 font-sans text-xs">
                  <div className="text-amber-200 font-medium">සිංහල සිතුවිල්ල: "මම බත් කනවා" (S-O-V)</div>
                  <div className="text-emerald-300 font-semibold">ඉංග්‍රීසි කථනය: "I eat rice" (S-V-O)</div>
                </div>
                <div className="text-[11px] text-emerald-200/90 italic pt-1 border-t border-[#2d4a3e]">
                  "ක්‍රියා පදය (Action) මැදට ගෙන කතා කරන්න පැටියෝ!"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
