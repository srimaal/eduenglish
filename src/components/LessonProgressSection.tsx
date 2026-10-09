import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { LessonProgressController } from '../utils/lessonProgress';
import { LessonDeck } from './LessonDeck';
import { LessonQuiz } from './LessonQuiz';
import type { AccountUser } from '../types/auth';
import type { PhraseItem } from '../types';

export function LessonProgressSection({ user, audioSpeed, onSelectPhraseForVoice }: {
  user: AccountUser | null | undefined;
  audioSpeed: number;
  onSelectPhraseForVoice: (phrase: PhraseItem) => void;
}) {
  const uid = user === undefined ? undefined : user?.id ?? null;
  const controller = useMemo(() => new LessonProgressController(uid), [uid]);
  const progress = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const [dismissedImport, setDismissedImport] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [lastLessonId, setLastLessonId] = useState('lesson-1');
  useEffect(() => { setDismissedImport(false); return controller.start(); }, [controller]);
  const importCount = progress.guestIds.filter(id => !progress.completed.includes(id)).length;
  const status = progress.status === 'checking' ? 'Checking your account…'
    : progress.status === 'guest' ? 'Guest progress · saved only on this browser'
    : progress.status === 'synced' ? 'Lesson completions synced to your account'
    : progress.status === 'error' ? 'Lesson sync needs attention'
    : 'Syncing lesson completions…';
  return <>
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong>{progress.completed.length} / 1,000 lessons completed</strong>
          <span role="status" className="text-xs text-stone-600">{status}</span>
        </div>
        <p className="mt-1 text-xs text-stone-500">Lesson completions and lesson-quiz results sync when signed in. General practice scores, XP, badges and flashcards remain on this browser.</p>
        {user && progress.pendingQuizzes.length > 0 && <p className="mt-1 text-xs text-amber-800">{progress.pendingQuizzes.length} quiz result(s) waiting to save to your account.</p>}
        {progress.storageWarning && <p role="alert" className="mt-2 text-amber-800">{progress.storageWarning}</p>}
        {progress.error && <div className="mt-2 flex flex-wrap items-center gap-3 text-xs"><p role="alert" className="text-red-700">{progress.error}</p><button type="button" onClick={() => void controller.sync()} className="font-semibold underline">Retry sync</button></div>}
        {user && importCount > 0 && !dismissedImport && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs">
          <p>Import {importCount} completed guest lessons from this browser into {user.email}? Only import them if they are yours.</p>
          <div className="mt-2 flex gap-4"><button type="button" onClick={controller.importGuest} className="font-bold underline">Import guest lessons</button><button type="button" onClick={() => setDismissedImport(true)} className="underline">Not now</button></div>
        </div>}
      </div>
    </div>
    {quizLessonId ? <LessonQuiz key={quizLessonId} lessonId={quizLessonId} audioSpeed={audioSpeed} ready={uid !== undefined}
      onFinish={controller.recordQuiz} onBack={() => setQuizLessonId(null)} />
      : <LessonDeck audioSpeed={audioSpeed} onSelectPhraseForVoice={onSelectPhraseForVoice}
        initialLessonId={lastLessonId} onGoToQuiz={id => { setLastLessonId(id); setQuizLessonId(id); }}
        completedLessonIds={progress.completed} progressReady={uid !== undefined} onCompleteLesson={id => controller.complete([id])} />}
  </>;
}
