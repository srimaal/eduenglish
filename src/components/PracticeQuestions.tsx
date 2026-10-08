import React, { useRef, useState } from 'react';
import { PracticeQuestion } from '../types';
import { PRACTICE_QUESTIONS } from '../data/questionsData';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trophy,
  Lightbulb,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';
import { SpokenQuizAnswer } from './SpokenQuizAnswer';
import type { SpeechAssessment } from '../utils/speechAssessment';
import { aiErrorMessage, apiPost } from '../utils/apiClient';


interface PracticeQuestionsProps {
  audioSpeed: number;
  onQuizAnswerCorrect?: () => void;
}

export const PracticeQuestions: React.FC<PracticeQuestionsProps> = ({
  audioSpeed,
  onQuizAnswerCorrect,
}) => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>(PRACTICE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState<boolean>(false);

  // Reorder exercise state
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Voice question state
  const [voiceAssessment, setVoiceAssessment] = useState<SpeechAssessment | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const submittedRef = useRef(false);

  // Dynamic question generator state
  const [isGeneratingNewQuestions, setIsGeneratingNewQuestions] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleWordTap = (word: string) => {
    if (isAnswerSubmitted) return;
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmitAnswer = () => {
    if (submittedRef.current) return;
    let isCorrect = false;

    if (currentQ.type === 'choice' || currentQ.type === 'mistake-fix') {
      if (selectedOption === null) return;
      isCorrect = selectedOption === currentQ.correctAnswer;
    } else if (currentQ.type === 'reorder') {
      const userSentence = selectedWords.join(' ').trim();
      isCorrect = userSentence.toLowerCase() === currentQ.targetEnglish.toLowerCase();
    } else if (currentQ.type === 'voice') {
      if (!voiceAssessment) return;
      isCorrect = voiceAssessment.passed;
    }

    submittedRef.current = true;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      if (onQuizAnswerCorrect) {
        onQuizAnswerCorrect();
      }
    } else {
      setStreak(0);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    submittedRef.current = false;
    setVoiceAssessment(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSelectedWords([]);

      setIsAnswerSubmitted(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSelectedWords([]);
    setVoiceAssessment(null);
    setSkippedCount(0);
    submittedRef.current = false;
    setIsAnswerSubmitted(false);
    setScore(0);
    setStreak(0);
    setIsQuizFinished(false);
  };

  const handleGenerateFreshQuestions = async () => {
    setIsGeneratingNewQuestions(true);
    setGenerationError(null);
    try {
      const data = await apiPost<{ questions?: Array<{
        sinhalaPrompt: string;
        targetEnglish: string;
        singlishPronunciation: string;
        options: string[];
        correctOptionIndex: number;
        explanationSinhala: string;
      }> }>('/api/generate-lesson-questions', {
        topic: 'Beginner Daily Spoken English',
      });
      if (data.questions && data.questions.length > 0) {
          const formatted: PracticeQuestion[] = data.questions.map((q, i) => ({
            id: `gen-${i}`,
            type: 'choice',
            category: 'AI Generated Spoken Exercise',
            sinhalaPrompt: q.sinhalaPrompt,
            targetEnglish: q.targetEnglish,
            singlishPronunciation: q.singlishPronunciation,
            options: q.options,
            correctAnswer: q.correctOptionIndex,
            explanationSinhala: q.explanationSinhala,
          }));
          setQuestions([...formatted, ...PRACTICE_QUESTIONS]);
          handleRestartQuiz();
      }
    } catch (e) {
      console.error('Error generating fresh questions:', e);
      setGenerationError(aiErrorMessage(e));
    } finally {
      setIsGeneratingNewQuestions(false);
    }
  };

  if (isQuizFinished) {
    const gradedCount = questions.length - skippedCount;
    const percentage = gradedCount ? Math.round((score / gradedCount) * 100) : 0;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center mx-auto shadow-sm">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-bold text-[#1c1917]">
          ප්‍රශ්නාවලිය සාර්ථකව අවසන්!
        </h2>

        <p className="text-sm text-[#57534e]">
          Correct: {score} / {gradedCount} graded questions ({percentage}%). Skipped without a grade: {skippedCount}.
        </p>

        <div className="bg-[#1c2e26] text-[#e2f0d9] rounded-2xl p-6 text-left space-y-2 border border-[#2d4a3e]">
          <div className="font-bold text-[#86efac] text-sm">
            ඩේසි ගුරුතුමියගේ ඇගයීම (Teacher's Evaluation):
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {percentage >= 80
              ? 'විශිෂ්ටයි පුතා! ඔබ ඉංග්‍රීසි වාක්‍ය රටාව සහ උච්චාරණය ඉතා හොඳින් ග්‍රහණය කරගෙන තිබෙනවා. දිනපතා කතාබස් කිරීමට මෙම වාක්‍ය භාවිතා කරන්න.'
              : 'හොඳ උත්සාහයක්! නැවත වරක් පාඩම් මාලාව කියවා වැරදුණු තැන් හදාගෙන නැවත උත්සාහ කරමු. ඔබට අනිවාර්යයෙන්ම පුළුවන්!'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRestartQuiz}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b45309] text-white font-semibold text-sm hover:bg-[#92400e] transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>නැවත මුල සිට කරන්න</span>
          </button>

          <button
            onClick={handleGenerateFreshQuestions}
            disabled={isGeneratingNewQuestions}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#d6cfc4] text-[#1c1917] font-semibold text-sm hover:bg-[#f5f1e8] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#b45309]" />
            <span>{isGeneratingNewQuestions ? 'ප්‍රශ්න සකස් වෙමින් පවතී...' : 'අලුත් ප්‍රශ්න ලබාගන්න'}</span>
          </button>
        </div>
        {generationError && (
          <p role="alert" className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
            {generationError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Status Bar: Progress, Score & Streak */}
      <div className="bg-white rounded-2xl border border-[#e7e2d9] p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#78716c] mb-2 font-medium">
          <span>
            ප්‍රශ්නය {currentIndex + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[#b45309] font-bold">
              ලකුණු: {score}
            </span>
            {streak > 1 && (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                🔥 {streak} Streak!
              </span>
            )}
          </div>
        </div>

        {/* Progress line */}
        <div className="w-full bg-[#f5efe6] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#b45309] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-[#e7e2d9] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Category & Prompt */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#b45309] uppercase tracking-wider">
            <span>{currentQ.category}</span>
            <span aria-hidden="true">·</span>
            <span>
              {currentQ.type === 'voice'
                ? 'හඬින් පිළිතුරු දෙන්න'
                : currentQ.type === 'reorder'
                ? 'වචන පිළිවෙළට සකසන්න'
                : currentQ.type === 'mistake-fix'
                ? 'ලාංකික වැරදි නිවැරදි කරන්න'
                : 'නිවැරදි පිළිතුර තෝරන්න'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-[#1c1917] leading-snug">
            {currentQ.sinhalaPrompt}
          </h3>

          {currentQ.singlishPronunciation && (
            <div className="text-xs text-[#b45309] font-mono">
              උච්චාරණය: {currentQ.singlishPronunciation}
            </div>
          )}
        </div>

        {/* Question Type 1: Multiple Choice or Mistake Fix */}
        {(currentQ.type === 'choice' || currentQ.type === 'mistake-fix') && currentQ.options && (
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let optionStyle = 'bg-white border-[#e7e2d9] hover:bg-[#faf8f5] text-[#1c1917]';

              if (isAnswerSubmitted) {
                if (idx === currentQ.correctAnswer) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                } else if (isSelected && idx !== currentQ.correctAnswer) {
                  optionStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                }
              } else if (isSelected) {
                optionStyle = 'bg-[#fef3c7] border-[#b45309] text-[#78350f] font-semibold';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#f5efe6] text-xs font-bold text-[#78350f] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswerSubmitted && idx === currentQ.correctAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && idx !== currentQ.correctAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Question Type 2: Word Reordering (SVO practice) */}
        {currentQ.type === 'reorder' && currentQ.wordsForReorder && (
          <div className="space-y-4">
            {/* Display user assembled sentence */}
            <div className="min-h-16 p-4 rounded-xl border border-dashed border-[#b45309]/50 bg-[#faf8f5] flex flex-wrap items-center gap-2">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-[#78716c] italic">
                  පහත වචන මත ක්ලික් කර වාක්‍යය ගොඩනගන්න...
                </span>
              ) : (
                selectedWords.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordTap(word)}
                    disabled={isAnswerSubmitted}
                    className="px-3 py-1.5 rounded-lg bg-[#b45309] text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#92400e] cursor-pointer"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word bank pool */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentQ.wordsForReorder.map((word, i) => {
                const isUsed = selectedWords.includes(word);
                return (
                  <button
                    key={i}
                    onClick={() => handleWordTap(word)}
                    disabled={isUsed || isAnswerSubmitted}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
                      isUsed
                        ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        : 'bg-white text-[#1c1917] border-[#d6cfc4] hover:bg-[#f5f1e8] shadow-xs'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Spoken answers are graded only after a final recognition result. */}
        {currentQ.type === 'voice' && (
          <SpokenQuizAnswer key={currentQ.id} target={currentQ.targetEnglish} audioSpeed={audioSpeed}
            submitted={isAnswerSubmitted} onAssessment={setVoiceAssessment}
            onSkip={() => {
              if (submittedRef.current) return;
              setSkippedCount(count => count + 1);
              setStreak(0);
              handleNextQuestion();
            }} />
        )}

        {/* Feedback Explanation (Visible after submitting) */}
        {isAnswerSubmitted && (
          <div className="bg-[#faf8f5] border border-[#e7ded0] rounded-xl p-4 sm:p-5 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-sm font-bold text-[#b45309]">
              <Lightbulb className="w-4 h-4" />
              <span>ඩේසි ගුරුතුමියගේ ව්‍යාකරණ පැහැදිලි කිරීම:</span>
            </div>
            <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
              {currentQ.explanationSinhala}
            </p>
            <div className="pt-2 text-xs flex items-center gap-2 text-[#78350f]">
              <button
                onClick={() => speakEnglish(currentQ.targetEnglish, audioSpeed)}
                className="inline-flex items-center gap-1 font-semibold hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>නිවැරදි පිළිතුර ශ්‍රවණය කරන්න</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f5f1e8]">
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={
                (currentQ.type === 'choice' || currentQ.type === 'mistake-fix') && selectedOption === null
                  ? true
                  : currentQ.type === 'reorder' && selectedWords.length === 0
                  ? true
                  : currentQ.type === 'voice' && !voiceAssessment
                  ? true
                  : false
              }
              className="px-6 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
            >
              පිළිතුර තහවුරු කරන්න (Submit)
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>ඊළඟ ප්‍රශ්නය (Next)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
