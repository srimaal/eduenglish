import React, { useState, useMemo, useEffect } from 'react';
import { LESSONS as BUNDLED_LESSONS, LESSON_VOLUMES as BUNDLED_VOLUMES } from '../data/lessonsData';
import { Lesson, PhraseItem } from '../types';
import {
  Volume2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Mic,
  BookOpen,
  Check,
  Search,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';
import { CowTeacherAvatar } from './CowTeacherAvatar';

interface LessonDeckProps {
  completedLessonIds: string[];
  progressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
  audioSpeed: number;
  onSelectPhraseForVoice: (phrase: PhraseItem) => void;
  onGoToQuiz: (lessonId: string) => void;
  initialLessonId?: string;
}

const PAGE_SIZE = 12;

export const LessonDeck: React.FC<LessonDeckProps> = ({
  audioSpeed,
  onSelectPhraseForVoice,
  onGoToQuiz,
  completedLessonIds,
  progressReady,
  onCompleteLesson,
  initialLessonId,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>(BUNDLED_LESSONS);
  const [volumes, setVolumes] = useState(BUNDLED_VOLUMES);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId || BUNDLED_LESSONS[0].id);
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);
  const [curriculumSource, setCurriculumSource] = useState<'database' | 'bundled'>('bundled');

  // A published course is read from its immutable database snapshot. The
  // bundled copy remains an offline/guest fallback and keeps quizzes usable.
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/curriculum', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Curriculum API unavailable');
        return response.json() as Promise<{ lessons?: Lesson[]; sections?: typeof BUNDLED_VOLUMES }>;
      })
      .then(snapshot => {
        if (!Array.isArray(snapshot.lessons) || snapshot.lessons.length !== 1000 ||
          !Array.isArray(snapshot.sections) || snapshot.sections.length !== BUNDLED_VOLUMES.length) return;
        // Keep the first A1 unit synchronized with the reviewed bundled
        // source while the remaining published lessons continue to come from
        // the immutable database snapshot.
        const reviewedFoundation = new Map(BUNDLED_LESSONS
          .filter(lesson => lesson.number <= 100)
          .map(lesson => [lesson.number, lesson]));
        setLessons(snapshot.lessons.map(lesson => reviewedFoundation.get(lesson.number) ?? lesson));
        setVolumes(snapshot.sections);
        setCurriculumSource('database');
      })
      .catch(() => { /* keep the local, already bundled course available */ });
    return () => controller.abort();
  }, []);

  // Search & Filter state for the 1,000-lesson course
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpToLessonNumber, setJumpToLessonNumber] = useState<string>('');

  const activeLesson = useMemo(() => {
    return lessons.find((l) => l.id === selectedLessonId) || lessons[0];
  }, [lessons, selectedLessonId]);

  // Filter lessons based on volume & search query
  const filteredLessons = useMemo(() => {
    let list = lessons;

    if (selectedVolumeId !== 'all') {
      const vol = volumes.find((v) => v.id === selectedVolumeId);
      if (vol) {
        list = list.filter((l) => l.number >= vol.range[0] && l.number <= vol.range[1]);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      // Check if user typed a specific number
      const numQuery = parseInt(q, 10);
      if (!isNaN(numQuery) && numQuery >= 1 && numQuery <= 1000) {
        list = list.filter((l) => l.number === numQuery || l.number.toString().includes(q));
      } else {
        list = list.filter(
          (l) =>
            l.titleEnglish.toLowerCase().includes(q) ||
            l.titleSinhala.includes(q) ||
            l.summarySinhala.includes(q) ||
            l.phrases.some((p) => p.english.toLowerCase().includes(q) || p.sinhala.includes(q))
        );
      }
    }

    return list;
  }, [lessons, volumes, selectedVolumeId, searchQuery]);

  // Paginated lessons slice
  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const paginatedLessons = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLessons.slice(start, start + PAGE_SIZE);
  }, [filteredLessons, currentPage]);

  const handlePlayPhrase = (phrase: PhraseItem) => {
    setPlayingPhraseId(phrase.id);
    speakEnglish(phrase.english, audioSpeed, 1.0, () => {
      setPlayingPhraseId(null);
    });
  };

  const handleJumpToLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpToLessonNumber, 10);
    if (!isNaN(num) && num >= 1 && num <= 1000) {
      const target = lessons.find((l) => l.number === num);
      if (target) {
        setSelectedLessonId(target.id);
        // Find which page it belongs to in current filtered list or reset filter
        setSearchQuery('');
        setSelectedVolumeId('all');
        const pageIdx = Math.floor((num - 1) / PAGE_SIZE) + 1;
        setCurrentPage(pageIdx);
        setJumpToLessonNumber('');
        // Smooth scroll to active lesson deck
        const el = document.getElementById('active-lesson-view');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNextLesson = () => {
    if (activeLesson.number < 1000) {
      const next = lessons.find((l) => l.number === activeLesson.number + 1);
      if (next) setSelectedLessonId(next.id);
    }
  };

  const handlePrevLesson = () => {
    if (activeLesson.number > 1) {
      const prev = lessons.find((l) => l.number === activeLesson.number - 1);
      if (prev) setSelectedLessonId(prev.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Guided practice directory header */}
      <div className="bg-gradient-to-r from-[#f5efe6] via-[#faf8f5] to-[#f5efe6] rounded-3xl border border-[#e7e2d9] p-6 sm:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#b45309] uppercase tracking-wider bg-[#fef3c7] px-3 py-1 rounded-full border border-[#fde68a] mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>1,000 English lessons · {curriculumSource === 'database' ? 'published course' : 'offline course copy'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917] tracking-tight">
              English for Sinhala Speakers
            </h2>
            <p className="text-xs sm:text-sm text-[#57534e] mt-1 max-w-2xl">
              Choose a level, search a skill, or jump to a lesson. The course moves from A1 foundations through A2 everyday English to B1 communication.
              හෝ මාතෘකාවක් සෙවීමෙන් ක්ෂණිකව ශ්‍රව්‍ය පාඩම් සහ උච්චාරණ පුහුණුවට පිවිසෙන්න.
            </p>
          </div>

          {/* Jump to specific lesson number form */}
          <form onSubmit={handleJumpToLesson} className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1000"
                value={jumpToLessonNumber}
                onChange={(e) => setJumpToLessonNumber(e.target.value)}
                placeholder="පාඩම් අංකය (1-1000)..."
                className="w-48 bg-white border border-[#d6cfc4] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309]"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              යන්න (Go)
            </button>
          </form>
        </div>

        {/* Volume Selector Tabs (3D tactile buttons) */}
        <div className="space-y-2.5 pt-2 border-t border-[#e7e2d9]/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-bold text-[#78716c] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#b45309]" />
              <span>පාඨමාලා මට්ටම (Choose a course stage):</span>
            </div>

            {/* Quick Milestone Chips */}
            <div className="flex items-center gap-1 text-[11px] text-stone-500">
              <span className="font-semibold text-amber-900">ක්ෂණිකව යන්න:</span>
              {[1, 100, 250, 500, 750, 1000].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    const target = lessons.find((l) => l.number === num);
                    if (target) {
                      setSelectedLessonId(target.id);
                      setSearchQuery('');
                      setSelectedVolumeId('all');
                      const pageIdx = Math.floor((num - 1) / PAGE_SIZE) + 1;
                      setCurrentPage(pageIdx);
                      const el = document.getElementById('active-lesson-view');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border border-amber-300 shadow-2xs cursor-pointer active:translate-y-[1px]"
                >
                  #{num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setSelectedVolumeId('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                selectedVolumeId === 'all'
                  ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] shadow-md translate-y-[1px]'
                  : 'bg-white hover:bg-[#fffcf7] text-[#57534e] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] shadow-2xs'
              }`}
            >
              All 1,000 Lessons
            </button>

            {volumes.map((vol) => (
              <button
                key={vol.id}
                onClick={() => {
                  setSelectedVolumeId(vol.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  selectedVolumeId === vol.id
                    ? 'bg-gradient-to-b from-[#b45309] to-[#92400e] text-white border-t border-amber-300/40 border-b-[3px] border-b-[#78350f] shadow-md translate-y-[1px]'
                    : 'bg-white hover:bg-[#fffcf7] text-[#57534e] border border-[#e7e2d9] border-b-[3px] border-b-[#d6cfc4] active:border-b active:translate-y-[2px] shadow-2xs'
                }`}
                title={vol.desc}
              >
                {vol.title}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-[#a8a29e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="පාඩම් මාතෘකාව හෝ වචනයක් සොයන්න (e.g. interview, hospital, bus, SVO, tea)..."
            className="w-full bg-white border border-[#d6cfc4] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309]"
          />
        </div>
      </div>

      {/* Lesson Navigation Grid & Browser */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#78716c]">
          <div>
            <span>ප්‍රතිඵල: </span>
            <span className="font-bold text-[#1c1917]">{filteredLessons.length}</span>
            <span> Lessons found</span>
          </div>

          <div className="flex items-center gap-2">
            <span>පිටුව {currentPage} / {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg border border-[#e7e2d9] bg-white disabled:opacity-40 hover:bg-[#faf8f5] cursor-pointer"
                title="පෙර පිටුව"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded-lg border border-[#e7e2d9] bg-white disabled:opacity-40 hover:bg-[#faf8f5] cursor-pointer"
                title="ඊළඟ පිටුව"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {paginatedLessons.map((lesson) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  const el = document.getElementById('active-lesson-view');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#b45309] text-white border-[#b45309] shadow-sm ring-2 ring-[#b45309]/30'
                    : 'bg-white hover:bg-[#faf8f5] text-[#1c1917] border-[#e7e2d9]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-amber-200' : 'text-[#b45309]'
                    }`}
                  >
                    Lesson {lesson.number}
                  {completedLessonIds.includes(lesson.id) && <span className="ml-1" aria-label="Completed">✓</span>}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                      isActive ? 'bg-amber-800 text-amber-200' : 'bg-stone-100 text-[#78716c]'
                    }`}
                  >
                    {lesson.level}
                  </span>
                </div>

                <div className="font-semibold text-xs line-clamp-1">
                  {lesson.titleEnglish}
                </div>

                <div
                  className={`text-[11px] mt-0.5 line-clamp-1 ${
                    isActive ? 'text-amber-100' : 'text-[#78716c]'
                  }`}
                >
                  {lesson.titleSinhala}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Lesson Layout */}
      <div id="active-lesson-view" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Column: Lesson Concepts & Phrases */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header of Active Lesson */}
          <div className="bg-white rounded-2xl border border-[#e7e2d9] p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e2d9] pb-4">
              <div>
                <span className="text-xs font-bold text-[#b45309] uppercase tracking-wider block mb-0.5">
                  Lesson {activeLesson.number} of 1,000 · {activeLesson.level}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1c1917]">
                  {activeLesson.titleEnglish}
                </h3>
                <p className="text-sm font-medium text-[#78350f] mt-0.5">
                  {activeLesson.titleSinhala}
                </p>
              </div>

              {/* Prev / Next Lesson quick arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevLesson}
                  disabled={activeLesson.number <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-[#d6cfc4] hover:bg-[#faf8f5] disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="පෙර පාඩම"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">පෙර පාඩම</span>
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={activeLesson.number >= 1000}
                  className="px-2.5 py-1.5 rounded-lg bg-[#b45309] hover:bg-[#92400e] text-white disabled:opacity-40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="ඊළඟ පාඩම"
                >
                  <span className="hidden sm:inline">ඊළඟ පාඩම</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-[#57534e] leading-relaxed">
              {activeLesson.summarySinhala}
            </p>

            {activeLesson.keyVocabulary && activeLesson.keyVocabulary.length > 0 && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5">
                <div className="mb-3 text-sm font-bold text-indigo-950">මෙම පාඩමට අවශ්‍ය වචන හා වාක්‍ය ඛණ්ඩ</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeLesson.keyVocabulary.map(item => (
                    <div key={item.english} className="rounded-lg border border-indigo-100 bg-white px-3 py-2 text-xs">
                      <span className="font-bold text-indigo-900">{item.english}</span>
                      <span className="mx-1.5 text-indigo-300">—</span>
                      <span className="text-slate-700">{item.sinhala}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Structure Rule Card */}
            <div className="bg-[#fcfaf7] border border-[#e7ded0] rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#b45309] font-bold text-sm">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>පාඩමේ මූලික කරුණ: {activeLesson.grammarRule.ruleTitleSinhala}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#57534e] leading-relaxed">
                {activeLesson.grammarRule.explanationSinhala}
              </p>

              {/* Comparative Sinhala vs English pattern visual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs">
                    <div className="font-semibold text-amber-900 mb-1">සිංහලෙන් අදහස:</div>
                  <div className="text-[11px] text-amber-700 mt-1 italic">
                      {activeLesson.grammarRule.sinhalaVsEnglishPattern.exampleSinhala}
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3 text-xs">
                    <div className="font-semibold text-emerald-900 mb-1">ඉංග්‍රීසි වාක්‍ය රටාව:</div>
                  <div className="text-emerald-800 font-mono font-semibold">
                    {activeLesson.grammarRule.sinhalaVsEnglishPattern.englishOrder}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1 italic">
                    Ex: {activeLesson.grammarRule.sinhalaVsEnglishPattern.exampleEnglish}
                  </div>
                </div>
              </div>
            </div>

            {activeLesson.guidedPracticeSinhala && (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-5 space-y-3">
                <div className="font-bold text-sm text-sky-900">දැන් ඔබ උත්සාහ කරන්න</div>
                <p className="text-sm text-sky-950 leading-relaxed">{activeLesson.guidedPracticeSinhala}</p>
                <p className="text-xs text-sky-800">
                  ඉහළ වාක්‍ය රටාව භාවිත කර ඔබ ගැන වාක්‍යයක් හදන්න. පසුව Spoken Audio Phrases සමඟ සසඳන්න.
                </p>
                <details className="rounded-lg border border-sky-200 bg-white/80 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-sky-900">උදාහරණ පිළිතුරක් බලන්න</summary>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{activeLesson.phrases[0]?.english}</p>
                  <p className="mt-1 text-xs text-slate-600">{activeLesson.phrases[0]?.sinhala}</p>
                </details>
              </div>
            )}
          </div>

          {/* Interactive Spoken Phrases List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#1c1917] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#b45309]" />
                <span>පාඩමේ ප්‍රායෝගික වාක්‍ය ඛණ්ඩ (Spoken Audio Phrases)</span>
              </h4>
              <span className="text-xs text-[#78716c]">
                ඩේසි ගුරුතුමිය සමඟ හඬ නගා කියවන්න
              </span>
            </div>

            <div className="space-y-3">
              {activeLesson.phrases.map((phrase, idx) => {
                const isPlaying = playingPhraseId === phrase.id;
                return (
                  <div
                    key={phrase.id}
                    className="bg-white rounded-xl border border-[#e7e2d9] p-4 sm:p-5 transition-all hover:border-[#b45309]/50 hover:shadow-xs group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#b45309] w-5">
                            {idx + 1}.
                          </span>
                          <span className="text-base sm:text-lg font-bold text-[#1c1917] tracking-tight">
                            {phrase.english}
                          </span>
                        </div>

                        <div className="text-sm font-medium text-[#78350f] pl-7">
                          {phrase.sinhala}
                        </div>

                        <div className="text-xs text-[#b45309] pl-7 font-mono">
                          {phrase.singlishPronunciation}
                        </div>

                        {phrase.teacherAudioTip && (
                          <div className="text-xs text-[#57534e] bg-[#fcfaf7] rounded-lg p-2 mt-2 border border-[#e7ded0] flex items-start gap-2">
                            <span className="font-semibold text-[#b45309] shrink-0">ඩේසි ගුරුතුමියගේ උපදෙස:</span>
                            <span>{phrase.teacherAudioTip}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 pl-7 sm:pl-0 border-t sm:border-t-0 border-[#f5f1e8]">
                        <button
                          onClick={() => handlePlayPhrase(phrase)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            isPlaying
                              ? 'bg-[#b45309] text-white animate-pulse'
                              : 'bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]'
                          }`}
                          title="හඬට සවන් දෙන්න"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isPlaying ? 'වාදනය වේ...' : 'සවන් දෙන්න'}</span>
                        </button>

                        <button
                          onClick={() => onSelectPhraseForVoice(phrase)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#d6cfc4] hover:bg-[#f5f1e8] text-[#1c1917] transition-all cursor-pointer"
                          title="මයික්‍රෆෝනයෙන් උච්චාරණය පරීක්ෂා කරන්න"
                        >
                          <Mic className="w-3.5 h-3.5 text-[#b45309]" />
                          <span>කතා කර බලන්න</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Sri Lankan Mistake Spotlight & Teacher Advice */}
        <div className="lg:col-span-4 space-y-6">
          {/* Sri Lankan Mistake Spotlight */}
          <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs relative overflow-hidden">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm mb-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>නිතරම වරදින තැනක් හදමු!</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <div className="font-semibold text-rose-900 flex items-center gap-1 mb-1">
                  <span>❌ වැරදි ව්‍යවහාරය:</span>
                </div>
                <div className="font-mono text-rose-800 line-through">
                  "{activeLesson.commonMistake.incorrect}"
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="font-semibold text-emerald-900 flex items-center gap-1 mb-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>✅ නිවැරදි ඉංග්‍රීසි ව්‍යවහාරය:</span>
                </div>
                <div className="font-mono text-emerald-800 font-bold">
                  "{activeLesson.commonMistake.correct}"
                </div>
              </div>

              <p className="text-xs text-[#57534e] leading-relaxed pt-1">
                {activeLesson.commonMistake.explanationSinhala}
              </p>
            </div>
          </div>

          {/* Teacher Daisy Advice Card */}
          <div className="bg-gradient-to-br from-[#1c2e26] to-[#0f1d17] text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <CowTeacherAvatar size="sm" />
              <div>
                <h5 className="font-bold text-sm text-white">ඩේසි ගුරුතුමියගේ උපදෙස</h5>
                <p className="text-[11px] text-emerald-300">Teacher Daisy's Advice</p>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed italic border-t border-[#2d4a3e] pt-3">
              "{activeLesson.teacherVoiceAdviceSinhala}"
            </p>

            <button
              onClick={() => {
                if (activeLesson.phrases[0]) {
                  speakEnglish(activeLesson.phrases[0].english, audioSpeed);
                }
              }}
              className="w-full mt-2 py-2 px-3 rounded-lg bg-[#2d4a3e] hover:bg-[#3d6354] text-xs font-semibold text-[#86efac] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>පාඩමේ මුල් වාක්‍යය ශ්‍රවණය කරන්න</span>
            </button>
          </div>

          {/* Quick Quiz CTA */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <button type="button" disabled={!progressReady || completedLessonIds.includes(activeLesson.id)}
              onClick={() => onCompleteLesson(activeLesson.id)}
              className="w-full rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {completedLessonIds.includes(activeLesson.id) ? 'Lesson completed ✓' : 'Mark lesson complete'}
            </button>
            <p className="mt-2 text-xs text-emerald-900">Optional self-reported completion. Pass this lesson’s quiz below to complete it automatically and save a quiz score.</p>
          </div>
          <div className="bg-[#fef3c7] border border-[#fde68a] rounded-2xl p-5 text-center space-y-2">
            <h5 className="font-bold text-sm text-[#92400e]">
              පාඩම {activeLesson.number} ප්‍රශ්නාවලිය
            </h5>
            <p className="text-xs text-[#78350f]">
              ඔබට තේරුණාදැයි පරීක්ෂා කර ලකුණු ලබා ගන්න.
            </p>
            <button
              onClick={() => onGoToQuiz(activeLesson.id)}
              className="w-full py-2 px-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              ප්‍රශ්නාවලිය අරඹන්න (Start Quiz)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
