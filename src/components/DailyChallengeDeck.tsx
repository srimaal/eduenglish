import React, { useState, useMemo } from 'react';
import { DAILY_100_MCQS } from '../data/dailyChallengeData';
import { DailyMCQItem } from '../types/index.ts';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flame,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  BookOpen,
  Filter,
  Check,
  ChevronRight
} from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';

interface DailyChallengeDeckProps {
  audioSpeed: number;
  onAnswerCorrect?: () => void;
  onChallengeCompleted?: (finalScore: number) => void;
}

export const DailyChallengeDeck: React.FC<DailyChallengeDeckProps> = ({
  audioSpeed,
  onAnswerCorrect,
  onChallengeCompleted,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Store user answers: map of questionId -> selectedOptionIndex
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'unanswered' | 'incorrect'>('all');
  const [isChallengeFinished, setIsChallengeFinished] = useState<boolean>(false);

  const currentQ = DAILY_100_MCQS[currentIndex];
  const selectedAnswer = userAnswers[currentQ.id];
  const hasAnsweredCurrent = selectedAnswer !== undefined;
  const isCurrentCorrect = hasAnsweredCurrent && selectedAnswer === currentQ.correctAnswerIndex;

  // Calculation of statistics
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = useMemo(() => {
    return Object.entries(userAnswers).filter(([qId, ansIdx]) => {
      const q = DAILY_100_MCQS.find((item) => item.id === Number(qId));
      return q && q.correctAnswerIndex === ansIdx;
    }).length;
  }, [userAnswers]);

  const incorrectCount = answeredCount - correctCount;
  const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  // Filter questions for the quick grid navigator
  const filteredQuestionIndices = useMemo(() => {
    return DAILY_100_MCQS.map((q, idx) => ({ q, idx })).filter(({ q }) => {
      const ans = userAnswers[q.id];
      if (filterMode === 'unanswered') return ans === undefined;
      if (filterMode === 'incorrect') return ans !== undefined && ans !== q.correctAnswerIndex;
      return true;
    });
  }, [userAnswers, filterMode]);

  const handleSelectOption = (optionIndex: number) => {
    if (hasAnsweredCurrent) return; // Prevent changing after submit

    const newAnswers = { ...userAnswers, [currentQ.id]: optionIndex };
    setUserAnswers(newAnswers);

    const isCorrect = optionIndex === currentQ.correctAnswerIndex;
    if (isCorrect && onAnswerCorrect) {
      onAnswerCorrect();
    }

    // Auto check if all 100 answered
    if (Object.keys(newAnswers).length === 100) {
      const finalScore = Object.entries(newAnswers).filter(([qId, ansIdx]) => {
        const q = DAILY_100_MCQS.find((item) => item.id === Number(qId));
        return q && q.correctAnswerIndex === ansIdx;
      }).length;
      if (onChallengeCompleted) onChallengeCompleted(finalScore);
    }
  };

  const handlePlayQuestionAudio = () => {
    speakEnglish(currentQ.questionText, audioSpeed);
  };

  const handlePlayCorrectAnswerAudio = () => {
    speakEnglish(currentQ.options[currentQ.correctAnswerIndex], audioSpeed);
  };

  const handleNext = () => {
    if (currentIndex + 1 < DAILY_100_MCQS.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsChallengeFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleResetChallenge = () => {
    if (confirm('ඔබට දෛනික අභියෝගය මුල සිට නැවත ආරම්භ කිරීමට අවශ්‍යද?')) {
      setUserAnswers({});
      setCurrentIndex(0);
      setIsChallengeFinished(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Challenge Header Banner */}
      <div className="bg-gradient-to-r from-[#f5efe6] via-[#faf8f5] to-[#f5efe6] rounded-3xl border border-[#e7e2d9] p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#b45309] uppercase tracking-wider bg-[#fef3c7] px-3 py-1 rounded-full border border-[#fde68a]">
              <Flame className="w-3.5 h-3.5 fill-[#b45309]" />
              <span>දෛනික අභියෝගය (Daily 100 MCQs Challenge)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917] tracking-tight">
              Daily 100 Spoken English MCQs
            </h2>

            <p className="text-xs sm:text-sm text-[#57534e] max-w-2xl leading-relaxed">
              ලාංකික අපට නිතරම වරදින තැන්, S-V-O වාක්‍ය රටා, නිපාත පද (Prepositions) සහ වෘත්තීය ඉංග්‍රීසි 
              ප්‍රගුණ කිරීම සඳහා ශ්‍රී මාල් සර් විසින් සකස් කරන ලද දෛනික බහුවරණ ප්‍රශ්න 100.
            </p>
          </div>

          {/* Stats widget */}
          <div className="bg-white/95 rounded-2xl border border-[#e7e2d9] p-5 shadow-xs flex items-center gap-6 shrink-0">
            <div>
              <span className="text-[11px] font-bold text-[#78716c] uppercase block">පිළිතුරු දුන් ගණන</span>
              <span className="text-2xl font-bold text-[#1c1917] tabular-nums">
                {answeredCount} <span className="text-xs text-[#78716c] font-normal">/ 100</span>
              </span>
            </div>

            <div className="w-px h-10 bg-[#e7e2d9]" />

            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase block">නිවැරදි පිළිතුරු</span>
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">
                {correctCount}
              </span>
            </div>

            <div className="w-px h-10 bg-[#e7e2d9]" />

            <div>
              <span className="text-[11px] font-bold text-[#b45309] uppercase block">නිරවද්‍යතාවය</span>
              <span className="text-2xl font-bold text-[#b45309] tabular-nums">
                {scorePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Linear progress meter */}
        <div className="mt-6 pt-4 border-t border-[#e7e2d9]/60">
          <div className="flex justify-between text-xs font-semibold text-[#57534e] mb-1.5">
            <span>සමස්ත ප්‍රගතිය (Overall Progress)</span>
            <span>{answeredCount}% සම්පූර්ණයි</span>
          </div>
          <div className="w-full bg-[#ede8df] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-[#b45309] h-full transition-all duration-300"
              style={{ width: `${answeredCount}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace: Left Question Card, Right Question Grid Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Question Deck */}
        <div className="lg:col-span-8 space-y-6">
          {!isChallengeFinished ? (
            <div className="bg-white rounded-3xl border border-[#e7e2d9] p-6 sm:p-8 shadow-xs space-y-6 relative">
              {/* Question Header & Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-[#b45309] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {currentQ.questionNumber}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider block">
                      Question {currentQ.questionNumber} of 100 · {currentQ.difficulty}
                    </span>
                    <span className="text-xs font-medium text-[#78716c]">
                      {currentQ.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlayQuestionAudio}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] text-xs font-semibold transition-colors cursor-pointer"
                  title="ප්‍රශ්නය ශ්‍රවණය කරන්න"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>ප්‍රශ්නය අසන්න</span>
                </button>
              </div>

              {/* Sinhala Context Prompt */}
              <div className="bg-[#faf8f5] border border-[#e7ded0] rounded-2xl p-4 text-xs sm:text-sm space-y-1">
                <span className="font-bold text-[#b45309] block">
                  සිංහල අදහස / ගැටලුව:
                </span>
                <p className="text-[#1c1917] font-medium leading-relaxed">
                  {currentQ.sinhalaPrompt}
                </p>
                <div className="text-[11px] text-[#78716c] pt-1 italic">
                  මාතෘකාව: {currentQ.topicSinhala}
                </div>
              </div>

              {/* English Question Text */}
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#1c1917] leading-snug">
                  {currentQ.questionText}
                </h3>
              </div>

              {/* 4 Interactive Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = selectedAnswer === optIdx;
                  const isCorrectOpt = optIdx === currentQ.correctAnswerIndex;

                  let optionStyle = 'bg-white border-[#e7e2d9] text-[#1c1917] hover:border-[#b45309] hover:bg-[#faf8f5]';

                  if (hasAnsweredCurrent) {
                    if (isCorrectOpt) {
                      optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-2 ring-emerald-300';
                    } else if (isSelected && !isCorrectOpt) {
                      optionStyle = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                    } else {
                      optionStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={hasAnsweredCurrent}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-4 cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-[#ede8df] text-[#57534e] flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {hasAnsweredCurrent && (
                        <div>
                          {isCorrectOpt ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          ) : null}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Sri Maal's Sinhala Pedagogical Explanation Card */}
              {hasAnsweredCurrent && (
                <div className="bg-[#1c2e26] text-[#e2f0d9] rounded-2xl p-5 space-y-3 border border-[#2d4a3e] animate-in fade-in duration-300">
                  <div className="flex items-center justify-between text-xs text-[#86efac] font-bold border-b border-[#2d4a3e] pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ඩේසි ගුරුතුමියගේ පැහැදිලි කිරීම:</span>
                    </span>

                    <button
                      onClick={handlePlayCorrectAnswerAudio}
                      className="inline-flex items-center gap-1 text-[11px] text-[#86efac] hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>නිවැරදි පිළිතුර ශ්‍රවණය කරන්න</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-100">
                    {currentQ.explanationSinhala}
                  </p>

                  {currentQ.singlishPronunciation && (
                    <div className="text-xs text-amber-300 font-mono">
                      උච්චාරණය: {currentQ.singlishPronunciation}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#e7e2d9]">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#d6cfc4] hover:bg-[#faf8f5] disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>පෙර ප්‍රශ්නය</span>
                </button>

                <div className="text-xs text-[#78716c] font-medium">
                  ප්‍රශ්නය {currentIndex + 1} / 100
                </div>

                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>{currentIndex + 1 === 100 ? 'ප්‍රතිඵල බලන්න' : 'ඊළඟ ප්‍රශ්නය'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Complete Challenge Scorecard Screen */
            <div className="bg-white rounded-3xl border border-[#e7e2d9] p-8 sm:p-10 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-[#b45309] text-white flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#b45309] block mb-1">
                  Daily Challenge Finished
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#1c1917]">
                  දෛනික බහුවරණ අභියෝගය සම්පූර්ණයි!
                </h3>
                <p className="text-xs sm:text-sm text-[#57534e] mt-1">
                  ප්‍රශ්න 100 ම සාර්ථකව අධ්‍යයනය කර පිළිතුරු සපයා ඇත.
                </p>
              </div>

              <div className="bg-[#faf8f5] rounded-2xl border border-[#e7ded0] p-6 max-w-md mx-auto grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[11px] text-[#78716c] block">ලකුණු</span>
                  <span className="text-2xl font-bold text-[#1c1917]">{correctCount}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#78716c] block">වැරදුණු ගණන</span>
                  <span className="text-2xl font-bold text-rose-600">{incorrectCount}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#78716c] block">ප්‍රතිශතය</span>
                  <span className="text-2xl font-bold text-emerald-600">{scorePercent}%</span>
                </div>
              </div>

              {/* Teacher Daisy's Commendation */}
              <div className="bg-[#1c2e26] text-[#e2f0d9] rounded-2xl p-5 max-w-lg mx-auto text-left space-y-2 border border-[#2d4a3e]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#86efac]">
                  <Award className="w-4 h-4" />
                  <span>ඩේසි ගුරුතුමියගේ ඇගයීම:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  {scorePercent >= 80
                    ? '"ඉතාමත් විශිෂ්ටයි පැටියෝ! ඔබ ලාංකික ඉංග්‍රීසි ව්‍යාකරණ සහ ව්‍යවහාරයන් ඉතා හොඳින් ප්‍රගුණ කර ඇත. බය නැතුව ඉදිරියටම යන්න! Moo!"'
                    : scorePercent >= 60
                    ? '"හොඳ උත්සාහයක්! වැරදුණු ප්‍රශ්න නැවත බලා ඩේසි ගුරුතුමියගේ පැහැදිලි කිරීම් මතක තබාගන්න. වැරදීම් යනු ඉගෙනුමේ පියවරක් පමණි."'
                    : '"අත්හරින්න එපා පැටියෝ! සෑම දිනකම අභියෝගය පුරුදු වන්න. ඩේසි මිස් ඔබ සමඟ නිරතුරුවම සිටිනවා."'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setIsChallengeFinished(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#d6cfc4] text-[#57534e] hover:bg-[#faf8f5] text-xs font-semibold cursor-pointer"
                >
                  ප්‍රශ්න නැවත සමාලෝචනය කරන්න
                </button>
                <button
                  onClick={handleResetChallenge}
                  className="px-6 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>අභියෝගය නැවත අරඹන්න</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: 100 Questions Navigator & Status */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-3xl border border-[#e7e2d9] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#1c1917] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#b45309]" />
                <span>ප්‍රශ්න 100 පුවරුව (100 Questions Grid)</span>
              </h4>
              <button
                onClick={handleResetChallenge}
                className="text-[11px] text-[#78716c] hover:text-[#b45309] flex items-center gap-1 cursor-pointer"
                title="නැවත ආරම්භ කරන්න"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Filter segments */}
            <div className="flex items-center gap-1 p-1 bg-[#ede8df] rounded-xl text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === 'all' ? 'bg-white text-[#1c1917] shadow-xs font-semibold' : 'text-[#78716c]'
                }`}
              >
                All (100)
              </button>
              <button
                onClick={() => setFilterMode('unanswered')}
                className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === 'unanswered' ? 'bg-white text-[#1c1917] shadow-xs font-semibold' : 'text-[#78716c]'
                }`}
              >
                Left ({100 - answeredCount})
              </button>
              <button
                onClick={() => setFilterMode('incorrect')}
                className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterMode === 'incorrect' ? 'bg-white text-rose-800 shadow-xs font-semibold' : 'text-[#78716c]'
                }`}
              >
                Wrong ({incorrectCount})
              </button>
            </div>

            {/* Visual Grid of 100 buttons */}
            <div className="grid grid-cols-10 gap-1.5 max-h-72 overflow-y-auto p-1">
              {filteredQuestionIndices.map(({ q, idx }) => {
                const ans = userAnswers[q.id];
                const isAnswered = ans !== undefined;
                const isCorrect = isAnswered && ans === q.correctAnswerIndex;
                const isCurrent = idx === currentIndex;

                let btnStyle = 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100';

                if (isAnswered) {
                  btnStyle = isCorrect
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-rose-500 text-white border-rose-600';
                }

                if (isCurrent) {
                  btnStyle += ' ring-2 ring-[#b45309] font-bold scale-105';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsChallengeFinished(false);
                    }}
                    className={`h-7 rounded-lg text-[11px] font-medium border flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    title={`Question ${q.questionNumber}: ${q.topicSinhala}`}
                  >
                    {q.questionNumber}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] text-[#78716c] pt-2 border-t border-[#f5f1e8]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> නිවැරදියි
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> වැරදියි
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300" /> නොකළ
              </span>
            </div>
          </div>

          {/* Quick Teacher Tip Note */}
          <div className="bg-[#fef3c7]/60 border border-[#fde68a] rounded-2xl p-4 text-xs text-[#78350f] space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-[#92400e]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>දිනපතා පුහුණුවේ රහස:</span>
            </div>
            <p className="leading-relaxed">
              දිනකට ප්‍රශ්න 100 ම එකවර කළ නොහැකි වුවත්, දිනපතා ප්‍රශ්න 15 බැගින් පිළිතුරු සපයා 
              සර්ගේ පැහැදිලි කිරීම කියවීමෙන් ඔබේ ඉංග්‍රීසි කථන දැනුම විශ්මයජනක ලෙස වර්ධනය වේ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
