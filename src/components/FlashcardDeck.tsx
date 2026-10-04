import React, { useState, useMemo, useEffect } from 'react';
import {
  FLASHCARDS,
  FLASHCARD_DECKS,
  getSavedMasteredCardIds,
  saveMasteredCardIds
} from '../data/flashcardsData';
import { FlashcardItem } from '../types';
import { speakEnglish } from '../utils/speechUtils';
import { CowTeacherAvatar } from './CowTeacherAvatar';
import {
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  BookmarkCheck,
  Search,
  Filter,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface FlashcardDeckProps {
  audioSpeed: number;
  onMasterCard?: (count: number) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  audioSpeed,
  onMasterCard
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'mastered' | 'learning'>('all');
  const [masteredIds, setMasteredIds] = useState<number[]>(() => getSavedMasteredCardIds());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [jumpCardNumber, setJumpCardNumber] = useState<string>('');

  // Filtered flashcard list
  const filteredCards = useMemo(() => {
    let list = FLASHCARDS;

    // Filter by Deck range
    if (selectedDeckId !== 'all') {
      const deck = FLASHCARD_DECKS.find((d) => d.id === selectedDeckId);
      if (deck) {
        list = list.filter((c) => c.cardNumber >= deck.range[0] && c.cardNumber <= deck.range[1]);
      }
    }

    // Filter by mastery status
    if (statusFilter === 'mastered') {
      const set = new Set(masteredIds);
      list = list.filter((c) => set.has(c.cardNumber));
    } else if (statusFilter === 'learning') {
      const set = new Set(masteredIds);
      list = list.filter((c) => !set.has(c.cardNumber));
    }

    // Filter by search query or card number
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const num = parseInt(q, 10);
      if (!isNaN(num) && num >= 1 && num <= 1000) {
        list = list.filter((c) => c.cardNumber === num);
      } else {
        list = list.filter(
          (c) =>
            c.frontPromptSinhala.toLowerCase().includes(q) ||
            c.backEnglish.toLowerCase().includes(q) ||
            c.backSinhalaMeaning.includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.categorySinhala.includes(q)
        );
      }
    }

    return list;
  }, [selectedDeckId, statusFilter, searchQuery, masteredIds]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filteredCards.length]);

  const currentCard: FlashcardItem | undefined = filteredCards[currentIndex] || FLASHCARDS[0];

  const isCurrentCardMastered = currentCard ? masteredIds.includes(currentCard.cardNumber) : false;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (filteredCards.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }
  };

  const handleShuffle = () => {
    if (filteredCards.length > 1) {
      const randomIndex = Math.floor(Math.random() * filteredCards.length);
      setIsFlipped(false);
      setCurrentIndex(randomIndex);
    }
  };

  const handlePlayAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentCard || isPlayingAudio) return;

    setIsPlayingAudio(true);
    speakEnglish(currentCard.backEnglish, audioSpeed, 1.18, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleToggleMastered = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;

    let updated: number[];
    if (isCurrentCardMastered) {
      updated = masteredIds.filter((id) => id !== currentCard.cardNumber);
    } else {
      updated = [...masteredIds, currentCard.cardNumber];
      if (onMasterCard) onMasterCard(updated.length);
    }
    setMasteredIds(updated);
    saveMasteredCardIds(updated);
  };

  const handleJumpToCard = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpCardNumber, 10);
    if (!isNaN(num) && num >= 1 && num <= 1000) {
      setSelectedDeckId('all');
      setStatusFilter('all');
      setSearchQuery('');
      const targetIdx = FLASHCARDS.findIndex((c) => c.cardNumber === num);
      if (targetIdx !== -1) {
        setCurrentIndex(targetIdx);
        setIsFlipped(false);
        setJumpCardNumber('');
      }
    }
  };

  const masteryPercent = Math.round((masteredIds.length / 1000) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#fef3c7] via-[#faf8f5] to-[#fef3c7] rounded-3xl border border-amber-300/70 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#b45309] uppercase tracking-wider bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-300 mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>ස්වයං මතක පුහුණු කාඩ්පත් 1,000 (1,000 Flip Flashcards)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] tracking-tight">
              Spoken English Flashcards Deck
            </h2>
            <p className="text-xs sm:text-sm text-[#57534e] mt-1 max-w-xl">
              කථන ඉංග්‍රීසි වාක්‍ය සහ රටා 1,000 ක් මතකයේ තබාගැනීමට කාඩ්පත ක්ලික් කර පෙරළන්න (Flip). 
              ඩේසි ගුරුතුමියගේ හඬින් උච්චාරණය අසන්න.
            </p>
          </div>

          {/* Jump to specific card form */}
          <form onSubmit={handleJumpToCard} className="flex items-center gap-2 shrink-0">
            <input
              type="number"
              min="1"
              max="1000"
              value={jumpCardNumber}
              onChange={(e) => setJumpCardNumber(e.target.value)}
              placeholder="කාඩ්පත් අංකය (1-1000)..."
              className="w-44 bg-white border border-[#d6cfc4] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309]"
            />
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white border-b-2 border-[#78350f] active:border-b active:translate-y-[1px] transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              යන්න (Go)
            </button>
          </form>
        </div>

        {/* Overall Progress Bar */}
        <div className="bg-white/80 rounded-2xl p-4 border border-[#e7e2d9] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1c1917] flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-[#15803d]" />
              <span>ප්‍රගතිය (Flashcards Mastered):</span>
              <span className="text-[#b45309] font-black">{masteredIds.length} / 1,000</span>
            </span>
            <span className="font-bold text-[#b45309]">{masteryPercent}% Complete</span>
          </div>
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#15803d] transition-all duration-500 rounded-full"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>
        </div>

        {/* 10 Deck Volume Selector Buttons (3D tactile style) */}
        <div className="space-y-2 pt-2 border-t border-amber-200/60">
          <div className="text-xs font-bold text-[#78716c] uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#b45309]" />
            <span>Deck තෝරන්න (Select from 10 Decks):</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setSelectedDeckId('all');
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                selectedDeckId === 'all'
                  ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] shadow-md translate-y-[1px]'
                  : 'bg-white hover:bg-[#fffcf7] text-[#57534e] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] shadow-2xs'
              }`}
            >
              All 1,000 Cards
            </button>

            {FLASHCARD_DECKS.map((deck) => (
              <button
                key={deck.id}
                onClick={() => {
                  setSelectedDeckId(deck.id);
                  setCurrentIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  selectedDeckId === deck.id
                    ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] shadow-md translate-y-[1px]'
                    : 'bg-white hover:bg-[#fffcf7] text-[#57534e] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] shadow-2xs'
                }`}
                title={deck.topic}
              >
                {deck.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a8a29e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              placeholder="කාඩ්පත් අංකය හෝ මාතෘකාවක් සොයන්න (e.g. greeting, restaurant, hospital, 50)..."
              className="w-full bg-white border border-[#d6cfc4] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#ede8df] p-1 rounded-xl border border-[#ded7ca]">
            <button
              onClick={() => {
                setStatusFilter('all');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#b45309] shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              සියල්ල ({filteredCards.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('learning');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'learning'
                  ? 'bg-white text-[#b45309] shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              පුහුණු විය යුතු
            </button>
            <button
              onClick={() => {
                setStatusFilter('mastered');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'mastered'
                  ? 'bg-white text-[#15803d] shadow-2xs'
                  : 'text-[#78716c] hover:text-[#1c1917]'
              }`}
            >
              දන්නවා ({masteredIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      {filteredCards.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e7e2d9] p-12 text-center space-y-4">
          <p className="text-sm text-[#57534e]">
            සොයන ලද නිර්ණායක අනුව කාඩ්පත් හමු නොවීය.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDeckId('all');
              setStatusFilter('all');
            }}
            className="px-4 py-2 bg-[#b45309] text-white rounded-xl text-xs font-bold"
          >
            සියලු කාඩ්පත් 1,000 පෙන්වන්න
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card Meta Indicator */}
          <div className="flex items-center justify-between text-xs text-[#78716c] px-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1c1917] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                Card #{currentCard.cardNumber} / 1,000
              </span>
              <span className="font-medium text-[#78716c]">
                {currentCard.category} ({currentCard.categorySinhala})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  currentCard.difficulty === 'Beginner'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : currentCard.difficulty === 'Intermediate'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-purple-50 text-purple-800 border-purple-300'
                }`}
              >
                {currentCard.difficulty}
              </span>

              {isCurrentCardMastered && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Mastered</span>
                </span>
              )}
            </div>
          </div>

          {/* Interactive 3D Flip Card Container */}
          <div
            onClick={handleFlip}
            className="relative w-full min-h-[380px] sm:min-h-[420px] cursor-pointer group select-none transition-transform active:scale-[0.99]"
            style={{ perspective: '1200px' }}
          >
            <div
              className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl transition-transform duration-500 border-2 shadow-xl ${
                isFlipped
                  ? 'border-amber-400 bg-gradient-to-b from-white to-[#fffcf7]'
                  : 'border-[#e7e2d9] bg-gradient-to-b from-[#faf8f5] to-white hover:border-[#b45309]/50'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT SIDE (Question / Prompt in Sinhala) */}
              <div
                className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐮</span>
                    <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider">
                      Teacher Daisy's Spoken Challenge
                    </span>
                  </div>
                  <span className="text-xs text-amber-800 font-semibold bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                    කාඩ්පත ක්ලික් කර පෙරළන්න (Click to Flip)
                  </span>
                </div>

                <div className="my-auto text-center space-y-4 py-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716c] block">
                    සිංහල අදහස (Sinhala Prompt):
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1c1917] leading-relaxed max-w-2xl mx-auto">
                    {currentCard.frontPromptSinhala}
                  </h3>

                  {currentCard.frontHintEnglish && (
                    <div className="inline-block bg-[#f5efe6] text-[#78350f] text-xs font-semibold px-3 py-1 rounded-xl border border-[#ded7ca]">
                      💡 Clue / Hint: {currentCard.frontHintEnglish}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-[#e7e2d9] pt-4 text-xs text-[#78716c]">
                  <span>ඉංග්‍රීසි වාක්‍යය සහ නිවැරදි උච්චාරණය බැලීමට ක්ලික් කරන්න</span>
                  <span className="flex items-center gap-1 font-bold text-[#b45309]">
                    <span>පෙරළන්න</span>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* BACK SIDE (English Answer & Phonetics) */}
              <div
                className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-b from-[#fffefc] to-[#fcfaf7] rounded-3xl"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="flex items-center justify-between border-b border-[#e7e2d9] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🐮</span>
                    <span className="text-xs font-bold text-[#15803d] uppercase tracking-wider">
                      Spoken English Target & Phonetics
                    </span>
                  </div>

                  {/* Audio Listen Button */}
                  <button
                    type="button"
                    onClick={handlePlayAudio}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border-t border-amber-300/40 border-b-2 border-b-[#78350f] ${
                      isPlayingAudio
                        ? 'bg-amber-200 text-amber-950 animate-pulse'
                        : 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white hover:from-[#92400e] hover:to-[#78350f]'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingAudio ? 'කතා කරයි...' : 'ඩේසි මිස්ගෙන් අසන්න'}</span>
                  </button>
                </div>

                <div className="my-auto space-y-4 py-4 text-center">
                  {/* English Target Phrase */}
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c1917] tracking-tight">
                      {currentCard.backEnglish}
                    </h3>

                    {/* Singlish Phonetic Pronunciation Guide */}
                    <div className="text-base sm:text-lg font-bold text-[#b45309] font-mono tracking-wide">
                      {currentCard.backSinglishPronunciation}
                    </div>
                  </div>

                  {/* Sinhala Meaning */}
                  <p className="text-sm sm:text-base font-semibold text-[#57534e]">
                    {currentCard.backSinhalaMeaning}
                  </p>

                  {/* Real Life Example */}
                  <div className="bg-[#fcfaf7] border border-[#e7ded0] rounded-2xl p-3 sm:p-4 text-left max-w-xl mx-auto space-y-1">
                    <div className="text-[11px] font-bold text-[#b45309] uppercase tracking-wider">
                      ප්‍රායෝගික උදාහරණය (Real Example):
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#1c1917]">
                      "{currentCard.exampleSentenceEnglish}"
                    </div>
                    <div className="text-xs text-[#78716c] italic">
                      "{currentCard.exampleSentenceSinhala}"
                    </div>
                  </div>

                  {/* Teacher Daisy Advice Tip */}
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 max-w-lg mx-auto">
                    <span>💡 ඩේසි ගුරුතුමිය: {currentCard.teacherDaisyTip}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#e7e2d9] pt-3 text-xs text-[#78716c]">
                  <span>නැවත ප්‍රශ්නය බැලීමට ක්ලික් කරන්න (Click to Flip back)</span>
                  <span className="flex items-center gap-1 font-bold text-[#b45309]">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>පෙරළන්න</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Controls (3D Buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            {/* Prev / Shuffle / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#fffcf7] text-[#1c1917] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] text-xs font-bold transition-all shadow-2xs cursor-pointer select-none"
                title="පෙර කාඩ්පත"
              >
                <ChevronLeft className="w-4 h-4 text-[#b45309]" />
                <span>පෙර කාඩ්පත (Prev)</span>
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#fffcf7] text-[#57534e] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] text-xs font-bold transition-all shadow-2xs cursor-pointer select-none"
                title="කලවම් කරන්න (Shuffle)"
              >
                <Shuffle className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">කලවම් (Shuffle)</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#fffcf7] text-[#1c1917] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] text-xs font-bold transition-all shadow-2xs cursor-pointer select-none"
                title="ඊළඟ කාඩ්පත"
              >
                <span>ඊළඟ කාඩ්පත (Next)</span>
                <ChevronRight className="w-4 h-4 text-[#b45309]" />
              </button>
            </div>

            {/* Mastery Toggle Button (I know this vs Need Review) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMastered}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none shadow-sm ${
                  isCurrentCardMastered
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-t border-emerald-300 border-b-[3px] border-b-emerald-800 active:border-b active:translate-y-[2px]'
                    : 'bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-t border-amber-200 border-b-[3px] border-b-amber-800 active:border-b active:translate-y-[2px]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isCurrentCardMastered ? 'මතකයි (Mastered) ✓' : 'මම මේක දන්නවා (Mark as Mastered)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
