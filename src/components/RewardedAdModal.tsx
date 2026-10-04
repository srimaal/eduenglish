import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Gift,
  Sparkles,
  Trophy,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Volume2,
  Clock,
  Star,
  Settings,
} from 'lucide-react';
import { getSavedAdSenseConfig } from '../utils/adsenseManager';

export type RewardType = 'xp' | 'chat_tokens' | 'streak_shield';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (reward: { type: RewardType; value: number; label: string }) => void;
  onOpenAdSenseSettings?: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  onOpenAdSenseSettings,
}) => {
  const [selectedReward, setSelectedReward] = useState<RewardType>('xp');
  const [adState, setAdState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  const adInsRef = useRef<HTMLDivElement>(null);
  const config = getSavedAdSenseConfig();

  // Reset when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAdState('idle');
      setSecondsRemaining(10);
      setCanSkip(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Audio chime effect on reward completion
  const playRewardSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Arpeggio notes: C5, E5, G5, C6
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.5, now + 0.3);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  };

  const startAd = () => {
    setAdState('playing');
    setSecondsRemaining(10);
    setCanSkip(false);

    // If Google AdSense is loaded and has a slot, try to push adsbygoogle
    if (config.isEnabled && config.clientId && config.rewardedSlotId) {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (e) {
        console.warn('AdSense Rewarded push error:', e);
      }
    }

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setAdState('completed');
          playRewardSound();

          // Claim reward automatically
          if (selectedReward === 'xp') {
            onRewardClaimed({ type: 'xp', value: 150, label: '+150 Spoken Mastery XP' });
          } else if (selectedReward === 'chat_tokens') {
            onRewardClaimed({ type: 'chat_tokens', value: 5, label: '+5 Teacher Daisy Chat Energy' });
          } else {
            onRewardClaimed({ type: 'streak_shield', value: 1, label: '1x Daily Streak Shield' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e7e2d9] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button (disabled while ad is actively playing to protect reward flow) */}
        {adState !== 'playing' ? (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#faf8f5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full text-xs font-mono">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{secondsRemaining}s</span>
          </div>
        )}

        {/* ================= STATE 1: REWARD SELECTION ================= */}
        {adState === 'idle' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#b45309]">
                  Google Rewarded Ads • ත්‍යාග දැන්වීම්
                </span>
                <h3 className="text-xl font-bold text-[#1c1917]">
                  නරඹා ත්‍යාග ලබාගන්න!
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
              තත්පර 10ක කෙටි දැන්වීමක් නරඹා ඔබ කැමති වටිනා ඉගෙනුම් ත්‍යාගය නොමිලේ ලබාගන්න:
            </p>

            {/* Reward Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: XP */}
              <button
                type="button"
                onClick={() => setSelectedReward('xp')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedReward === 'xp'
                    ? 'border-[#b45309] bg-[#fffbeb] shadow-sm'
                    : 'border-[#e7e2d9] bg-[#faf8f5] hover:border-stone-400'
                }`}
              >
                {selectedReward === 'xp' && (
                  <CheckCircle2 className="w-4 h-4 text-[#b45309] absolute top-3 right-3" />
                )}
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#b45309] flex items-center justify-center mb-2">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#1c1917]">+150 XP</div>
                <div className="text-[11px] text-[#78716c] mt-0.5">
                  ඉගෙනුම් ලකුණු
                </div>
              </button>

              {/* Option 2: AI Chat Tokens */}
              <button
                type="button"
                onClick={() => setSelectedReward('chat_tokens')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedReward === 'chat_tokens'
                    ? 'border-[#b45309] bg-[#fffbeb] shadow-sm'
                    : 'border-[#e7e2d9] bg-[#faf8f5] hover:border-stone-400'
                }`}
              >
                {selectedReward === 'chat_tokens' && (
                  <CheckCircle2 className="w-4 h-4 text-[#b45309] absolute top-3 right-3" />
                )}
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#1c1917]">+5 Chat</div>
                <div className="text-[11px] text-[#78716c] mt-0.5">
                  ඩේසි මිස්ගෙන් ඇසීමට
                </div>
              </button>

              {/* Option 3: Streak Shield */}
              <button
                type="button"
                onClick={() => setSelectedReward('streak_shield')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                  selectedReward === 'streak_shield'
                    ? 'border-[#b45309] bg-[#fffbeb] shadow-sm'
                    : 'border-[#e7e2d9] bg-[#faf8f5] hover:border-stone-400'
                }`}
              >
                {selectedReward === 'streak_shield' && (
                  <CheckCircle2 className="w-4 h-4 text-[#b45309] absolute top-3 right-3" />
                )}
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-sm font-bold text-[#1c1917]">1x Shield</div>
                <div className="text-[11px] text-[#78716c] mt-0.5">
                  දිනපතා ආරක්‍ෂාව
                </div>
              </button>
            </div>

            {/* AdSense Slot Config Notice */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] border border-[#e7ded0] text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#57534e]">
                  {config.isEnabled && config.rewardedSlotId
                    ? `AdSense Slot: ${config.rewardedSlotId}`
                    : 'Google AdSense Rewarded Engine සූදානම්'}
                </span>
              </div>
              {onOpenAdSenseSettings && (
                <button
                  type="button"
                  onClick={onOpenAdSenseSettings}
                  className="text-[#b45309] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Slot ID සකසන්න</span>
                </button>
              )}
            </div>

            {/* Launch Button */}
            <button
              onClick={startAd}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#92400e] hover:to-[#b45309] shadow-lg shadow-[#b45309]/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>දැන්වීම නරඹා ත්‍යාගය ලබාගන්න (Start Ad)</span>
            </button>
          </div>
        )}

        {/* ================= STATE 2: AD PLAYING (10s TIMER) ================= */}
        {adState === 'playing' && (
          <div className="space-y-5 text-center py-4">
            <div className="relative w-full aspect-video bg-[#1c1917] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white p-6 shadow-inner border border-stone-800">
              
              {/* Real Google AdSense Placement Container */}
              {config.isEnabled && config.clientId && config.rewardedSlotId && (
                <div ref={adInsRef} className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 p-2">
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%', minHeight: '180px' }}
                    data-ad-client={config.clientId}
                    data-ad-slot={config.rewardedSlotId}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                    data-adtest={config.testMode ? 'on' : undefined}
                  />
                </div>
              )}

              {/* Animated Ad Experience Graphic */}
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mb-3 animate-pulse">
                <Gift className="w-8 h-8 text-amber-400" />
              </div>

              <div className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
                Google Rewarded Ad • අනුග්‍රාහක පණිවිඩය
              </div>
              <h4 className="text-base sm:text-lg font-bold">
                Learn English with Sri Lankan Confidence
              </h4>
              <p className="text-xs text-stone-300 max-w-xs mt-1">
                දැන්වීම සම්පූර්ණ වනතුරු රැඳී සිටින්න. තත්පර 10 කින් ත්‍යාගය සක්‍රිය වේ.
              </p>

              {/* Countdown badge */}
              <div className="mt-4 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-mono text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>ඉතිරි කාලය: {secondsRemaining} තත්පර</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#e7e2d9] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((10 - secondsRemaining) / 10) * 100}%` }}
              />
            </div>

            <p className="text-xs text-[#78716c] italic">
              "ඉවසීමෙන් ඉගෙනීම සාර්ථකත්වයේ පදනමයි! Moo!" — ඩේසි ගුරුතුමිය
            </p>
          </div>
        )}

        {/* ================= STATE 3: REWARD COMPLETED & CLAIMED ================= */}
        {adState === 'completed' && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border border-emerald-200 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                සාර්ථකයි! (Reward Unlocked)
              </span>
              <h3 className="text-2xl font-bold text-[#1c1917] mt-1">
                ඔබට ත්‍යාගය හිමිවිය!
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold max-w-sm mx-auto shadow-xs">
              {selectedReward === 'xp' && (
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <span>+150 Spoken Mastery XP ඔබේ ගිණුමට එක්විය!</span>
                </div>
              )}
              {selectedReward === 'chat_tokens' && (
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>+5 AI Chat ප්‍රශ්න ඩේසි ගුරුතුමිය වෙතින් සක්‍රිය විය!</span>
                </div>
              )}
              {selectedReward === 'streak_shield' && (
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>1x Daily Streak Shield සක්‍රිය විය!</span>
                </div>
              )}
            </div>

            <div className="bg-[#faf8f5] p-3.5 rounded-2xl border border-[#e7ded0] text-xs text-[#57534e] text-left">
              <span className="font-bold text-[#b45309] block mb-1">
                ඩේසි ගුරුතුමියගේ ප්‍රශංසාව:
              </span>
              "විශිෂ්ටයි! ඔබ දිනපතාම උනන්දුවෙන් ඉංග්‍රීසි පුහුණු වීම මට මහත් සතුටක්. දැන් අපි ඊළඟ පාඩම හෝ ප්‍රශ්නාවලිය ජය ගනිමු! Moo!"
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setAdState('idle')}
                className="flex-1 py-3 px-4 rounded-xl border border-[#d6cfc4] hover:bg-[#faf8f5] font-semibold text-xs text-[#57534e] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>තවත් ත්‍යාගයක් ලබාගන්න</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white bg-[#b45309] hover:bg-[#92400e] transition-colors shadow-sm cursor-pointer"
              >
                ඉගෙනුම දිගටම කරගෙන යන්න
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
