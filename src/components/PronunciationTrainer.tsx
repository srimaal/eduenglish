import React, { useState, useEffect, useRef } from 'react';
import { PhraseItem, PronunciationResult } from '../types';
import { LESSONS } from '../data/lessonsData';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  speakEnglish,
  comparePronunciation,
  isSpeechRecognitionSupported
} from '../utils/speechUtils';

interface PronunciationTrainerProps {
  initialPhrase?: PhraseItem | null;
  audioSpeed: number;
  onPronunciationEvaluated?: (score: number) => void;
}

export const PronunciationTrainer: React.FC<PronunciationTrainerProps> = ({
  initialPhrase,
  audioSpeed,
  onPronunciationEvaluated,
}) => {
  // Target phrase state
  const [targetText, setTargetText] = useState<string>(
    initialPhrase?.english || 'Good morning, how are you today?'
  );
  const [targetSinhala, setTargetSinhala] = useState<string>(
    initialPhrase?.sinhala || 'සුබ උදෑසනක්, අද ඔබට කොහොමද?'
  );
  const [targetSinglish, setTargetSinglish] = useState<string>(
    initialPhrase?.singlishPronunciation || '[ගුඩ් මෝනින්ග්, හවු ආර් යූ ටුඩේ?]'
  );

  // Recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [isLoadingAiFeedback, setIsLoadingAiFeedback] = useState<boolean>(false);
  const [aiCoachTips, setAiCoachTips] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState<boolean>(true);

  // Recognition instance ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setBrowserSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (initialPhrase) {
      setTargetText(initialPhrase.english);
      setTargetSinhala(initialPhrase.sinhala);
      setTargetSinglish(initialPhrase.singlishPronunciation);
      setTranscript('');
      setResult(null);
      setAiCoachTips(null);
    }
  }, [initialPhrase]);

  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('ඔබගේ බ්‍රවුසරය Web Speech Recognition සඳහා සහය නොදක්වයි. කරුණාකර Google Chrome හෝ Microsoft Edge භාවිතා කරන්න.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setResult(null);
        setAiCoachTips(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);

        if (event.results[0].isFinal) {
          evaluateSpokenText(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const evaluateSpokenText = async (spokenText: string) => {
    const analysis = comparePronunciation(targetText, spokenText);
    setResult(analysis);
    if (onPronunciationEvaluated) {
      onPronunciationEvaluated(analysis.accuracyScore);
    }

    // Call server AI Pronunciation Coach for deep phoneme analysis
    setIsLoadingAiFeedback(true);
    try {
      const response = await fetch('/api/pronunciation-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPhrase: targetText,
          spokenTranscript: spokenText,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.feedbackSinhala) {
          setAiCoachTips(data.feedbackSinhala);
        }
      }
    } catch (e) {
      console.error('Error fetching AI coach feedback:', e);
    } finally {
      setIsLoadingAiFeedback(false);
    }
  };

  const handleListenSir = () => {
    speakEnglish(targetText, audioSpeed);
  };

  const handleSelectPreset = (phrase: PhraseItem) => {
    setTargetText(phrase.english);
    setTargetSinhala(phrase.sinhala);
    setTargetSinglish(phrase.singlishPronunciation);
    setTranscript('');
    setResult(null);
    setAiCoachTips(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b45309] uppercase tracking-wider mb-1">
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Recognition Pronunciation Lab</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917]">
          හඬ හඳුනාගැනීමෙන් නිවැරදි උච්චාරණය පුරුදු වෙමු
        </h2>
        <p className="text-xs sm:text-sm text-[#78716c] max-w-2xl mt-1">
          මුලින්ම සර් කියන හඬට සවන් දෙන්න. ඉන්පසු මයික්‍රෆෝනය ඔබා එම වාක්‍යය ශබ්ද නගා පවසන්න. 
          ඔබේ උච්චාරණයෙහි නිරවද්‍යතාවය ක්ෂණිකව පරික්ෂා කර ලකුණු ලබා දෙනු ඇත.
        </p>
      </div>

      {!browserSupported && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <div className="font-semibold">බ්‍රවුසර සහය පිළිබඳ සටහන:</div>
            <div>
              හඬ හඳුනාගැනීම (Speech Recognition) සඳහා Google Chrome හෝ Microsoft Edge භාවිතා කිරීම වඩාත් යෝග්‍ය වේ. Safari හෝ Firefox වලදී මයික්‍රෆෝන අවසරය ලබා දී ඇති බව තහවුරු කරගන්න.
            </div>
          </div>
        </div>
      )}

      {/* Main Pronunciation Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Mic Stage */}
        <div className="lg:col-span-8 space-y-6">
          {/* Target Sentence Card */}
          <div className="bg-white rounded-2xl border border-[#e7e2d9] p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-[#78716c] border-b border-[#e7e2d9] pb-3 mb-4">
              <span className="font-bold text-[#b45309]">ඉලක්ක වාක්‍යය (Target Sentence)</span>
              <span>දැන් ඔබ කියවන්න</span>
            </div>

            <div className="space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-[#1c1917] tracking-tight">
                {targetText}
              </div>
              <div className="text-base text-[#78350f] font-medium">
                {targetSinhala}
              </div>
              <div className="text-xs text-[#b45309] font-mono">
                {targetSinglish}
              </div>
            </div>

            {/* Audio Listen Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t border-[#f5f1e8]">
              <button
                onClick={handleListenSir}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#fef3c7] hover:bg-[#fde68a] text-[#92400e] transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>සර්ගේ හඬට සවන් දෙන්න (Listen to Model)</span>
              </button>
            </div>
          </div>

          {/* Voice Recording Deck */}
          <div className="bg-[#fcfaf7] border border-[#e7ded0] rounded-2xl p-6 sm:p-8 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <div className="text-xs font-bold text-[#78716c] uppercase tracking-wider">
                {isListening ? 'අහගෙන ඉන්නවා... ශබ්ද නගා කියන්න!' : 'මයික්‍රෆෝනය ඔබා කතා කරන්න'}
              </div>

              {/* Big Mic Button */}
              <div className="relative inline-flex items-center justify-center my-4">
                {isListening && (
                  <>
                    <div className="absolute w-28 h-28 rounded-full bg-rose-400/20 animate-ping" />
                    <div className="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-pulse" />
                  </>
                )}

                <button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white hover:bg-rose-700 ring-4 ring-rose-200'
                      : 'bg-[#b45309] text-white hover:bg-[#92400e] hover:scale-105'
                  }`}
                  title={isListening ? 'නැවැත්වීමට ඔබන්න' : 'කතා කිරීමට ඔබන්න'}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
              </div>

              <div className="text-xs text-[#57534e]">
                {isListening
                  ? 'කතා කර අවසන් වූ පසු ස්වයංක්‍රීයව පරීක්ෂා කෙරේ...'
                  : 'බය නැතුව පැහැදිලිව වචනෙන් වචනය ශබ්ද නගන්න.'}
              </div>
            </div>

            {/* Live Transcript Display */}
            {transcript && (
              <div className="bg-white border border-[#e7e2d9] rounded-xl p-4 max-w-xl mx-auto text-left shadow-xs">
                <div className="text-[11px] font-bold text-[#78716c] uppercase mb-1">
                  ඔබ පැවසූ දෙය (What you said):
                </div>
                <div className="text-base font-medium text-[#1c1917]">
                  "{transcript}"
                </div>
              </div>
            )}

            {/* Pronunciation Evaluation Results */}
            {result && (
              <div className="bg-white border border-[#e7e2d9] rounded-xl p-5 max-w-xl mx-auto text-left space-y-4 shadow-sm animate-in fade-in duration-300">
                {/* Score bar */}
                <div className="flex items-center justify-between border-b border-[#f5f1e8] pb-3">
                  <div>
                    <span className="text-xs font-bold text-[#78716c]">උච්චාරණ නිරවද්‍යතාවය (Accuracy)</span>
                    <div className="text-2xl font-bold text-[#1c1917] flex items-center gap-2">
                      <span>{result.accuracyScore}%</span>
                      {result.accuracyScore >= 80 ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleStartListening}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f5efe6] text-[#b45309] hover:bg-[#ede5d8] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>නැවත උත්සාහ කරන්න</span>
                  </button>
                </div>

                {/* Word by word breakdown with color coding */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#78716c]">
                    වචනයෙන් වචනය විශ්ලේෂණය:
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.words.map((item, index) => {
                      let badgeStyle = '';
                      if (item.status === 'perfect') {
                        badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300';
                      } else if (item.status === 'near') {
                        badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300';
                      } else {
                        badgeStyle = 'bg-rose-50 text-rose-800 border-rose-300';
                      }

                      return (
                        <div
                          key={index}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${badgeStyle}`}
                        >
                          <span>{item.word}</span>
                          {item.status === 'perfect' && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                          {item.status === 'near' && (
                            <span className="text-[10px] text-amber-700">~</span>
                          )}
                          {item.status === 'missed' && (
                            <span className="text-[10px] text-rose-600">✕</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#78716c] pt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> නිවැරදියි (Perfect)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> ළඟින්ම ගියා (Near)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> නැවත පුරුදු වන්න (Missed)
                    </span>
                  </div>
                </div>

                {/* Teacher Daisy's Immediate Advice in Sinhala */}
                <div className="bg-[#fef3c7]/60 border border-[#fde68a] rounded-lg p-3 text-xs text-[#78350f] space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-[#92400e]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ඩේසි ගුරුතුමියගේ ප්‍රතිචාරය:</span>
                  </div>
                  <p className="leading-relaxed">
                    {result.feedbackSinhala}
                  </p>
                </div>

                {/* AI Deep Phonetic Coach Note */}
                {isLoadingAiFeedback && (
                  <div className="text-xs text-[#78716c] italic flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#b45309]" />
                    <span>ඩේසි ගුරුතුමිය ගැඹුරු උච්චාරණ උපදෙස් සකස් කරමින් සිටී...</span>
                  </div>
                )}

                {aiCoachTips && (
                  <div className="bg-[#1c2e26] text-[#e2f0d9] rounded-lg p-3.5 text-xs space-y-1 border border-[#2d4a3e]">
                    <div className="font-bold text-[#86efac] flex items-center gap-1.5">
                      <span>සර්ගේ ශබ්ද විද්‍යා උපදෙස (Phonetic Tip):</span>
                    </div>
                    <p className="leading-relaxed text-slate-200">
                      {aiCoachTips}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sentence Library & Sri Lankan Pronunciation Secrets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Sentence Picker from Lessons */}
          <div className="bg-white rounded-2xl border border-[#e7e2d9] p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#1c1917] flex items-center justify-between">
              <span>පුහුණු වීමට වාක්‍යයක් තෝරන්න</span>
              <span className="text-xs text-[#b45309] font-normal">Lessons Library</span>
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {LESSONS.flatMap((l) => l.phrases).slice(0, 10).map((phrase) => {
                const isSelected = phrase.english === targetText;
                return (
                  <button
                    key={phrase.id}
                    onClick={() => handleSelectPreset(phrase)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#fef3c7] border-[#b45309] text-[#78350f] font-semibold'
                        : 'bg-white hover:bg-[#faf8f5] border-[#e7e2d9] text-[#1c1917]'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-medium">{phrase.english}</div>
                      <div className="text-[11px] text-[#78716c] truncate">{phrase.sinhala}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#78716c] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sri Lankan Spoken English Pronunciation Traps Guide */}
          <div className="bg-white rounded-2xl border border-[#e7e2d9] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-[#b45309] font-bold text-sm">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>ලාංකික අපිට අමාරු ශබ්ද 3ක්</span>
            </div>

            <div className="space-y-3 text-xs text-[#57534e]">
              <div className="border-b border-[#f5f1e8] pb-2.5">
                <div className="font-bold text-[#1c1917]">1. 'TH' ශබ්දය (Think vs Sink):</div>
                <p className="mt-1 leading-relaxed">
                  දිව උඩු දත් පේළිය සහ යටි දත් පේළිය අතරට තබා මෘදුව සුළඟ පිට කරන්න. "Thank you" කියන්නේ "ටෑන්ක් යූ" නොව "තෑන්ක් යූ" කියාය.
                </p>
              </div>

              <div className="border-b border-[#f5f1e8] pb-2.5">
                <div className="font-bold text-[#1c1917]">2. 'W' සහ 'V' අතර වෙනස:</div>
                <p className="mt-1 leading-relaxed">
                  'W' (Water, Wonderful) කියන විට තොල් රවුම් කරන්න. 'V' (Very, Visit) කියන විට උඩු දත් යටි තොල මත තබා කම්පනය කරන්න.
                </p>
              </div>

              <div>
                <div className="font-bold text-[#1c1917]">3. නිහඬ අකුරු (Silent Letters):</div>
                <p className="mt-1 leading-relaxed">
                  <b>Could</b> (කුඩ් - L නිහඬයි), <b>Knife</b> (නයිෆ් - K නිහඬයි), <b>Doubt</b> (ඩවුට් - B නිහඬයි).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
