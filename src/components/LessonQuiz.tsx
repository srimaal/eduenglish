import { useRef, useState } from 'react';
import { getLessonQuizVariant, gradeLessonQuiz, answerIsCorrect, LESSON_QUIZ_PASS_PERCENT, type QuizAnswer, type QuizAttempt, type QuizGrade } from '../data/lessonQuizzes';
import { SpokenQuizAnswer } from './SpokenQuizAnswer';
import type { SpeechAssessment } from '../utils/speechAssessment';

const attemptId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function LessonQuiz({ lessonId, audioSpeed, ready, onFinish, onBack }: {
  lessonId: string; audioSpeed: number; ready: boolean;
  onFinish: (attempt: QuizAttempt) => boolean; onBack: () => void;
}) {
  const id = useRef<string | null>(null);
  if (!id.current) id.current = attemptId();
  const quiz = getLessonQuizVariant(lessonId, id.current)!;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizGrade | null>(null);
  const [saved, setSaved] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [, setSpeechResult] = useState<SpeechAssessment | null>(null);
  const finished = useRef(false);
  const q = quiz.questions[index];
  const answer = answers[q.id];
  const selected = Array.isArray(answer) ? answer : [];
  const canCheck = q.type === 'choice' ? typeof answer === 'number' : selected.length === q.tokens!.length;
  const save = () => setSaved(onFinish({ attemptId: id.current!, lessonId, version: quiz.version, seed: id.current!, answers }));
  const next = () => {
    if (!checked || finished.current) return;
    if (index < quiz.questions.length - 1) { setIndex(index + 1); setChecked(false); }
    else { finished.current = true; setResult(gradeLessonQuiz(quiz, answers)); save(); }
  };
  const retry = () => {
    id.current = attemptId(); finished.current = false;
    setIndex(0); setAnswers({}); setChecked(false); setResult(null); setSaved(false); setSpeaking(false);
  };

  return <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
    <button type="button" onClick={onBack} className="text-sm font-semibold text-amber-900 underline">← Back to this lesson</button>
    <h2 className="text-xl font-bold">Lesson {lessonId.replace('lesson-', '')} quiz</h2>
    <p className="text-sm text-stone-600">{quiz.title}</p>
    <p className="text-xs text-stone-600">Five questions with explanations. Pass with {LESSON_QUIZ_PASS_PERCENT}% (4 of 5) to complete this lesson automatically. Speaking practice is optional and ungraded.</p>
    {!result ? <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
      <p className="text-xs font-bold text-amber-900">Question {index + 1} of {quiz.questions.length} · {q.skill}</p>
      <h3 className="whitespace-pre-line text-lg font-semibold">{q.prompt}</h3>
      {q.type === 'choice' ? <div role="group" aria-label="Answer options" className="space-y-2">
        {q.options!.map((option, optionIndex) => <button type="button" key={optionIndex} disabled={checked} aria-pressed={answer === optionIndex}
          onClick={() => setAnswers({ ...answers, [q.id]: optionIndex })}
          className={`block w-full rounded-xl border p-3 text-left text-sm ${checked && optionIndex === q.correctIndex ? 'border-emerald-600 bg-emerald-50' : answer === optionIndex ? 'border-amber-700 bg-amber-50' : 'border-stone-200'}`}>
          {option}
        </button>)}
      </div> : <div className="space-y-3">
        <p className="text-xs text-stone-600">Tap words to build the model sentence. Tap a selected word to put it back. Repeated words are separate tiles.</p>
        <div role="group" aria-label="Your sentence" className="flex min-h-14 flex-wrap gap-2 rounded-xl border border-dashed border-amber-600 p-3">
          {selected.map((tokenIndex, position) => <button key={tokenIndex} type="button" disabled={checked}
            onClick={() => setAnswers({ ...answers, [q.id]: selected.filter((_, i) => i !== position) })}
            className="rounded-lg bg-amber-800 px-3 py-2 text-sm text-white">{q.tokens![tokenIndex]}</button>)}
        </div>
        <div role="group" aria-label="Word bank" className="flex flex-wrap gap-2">
          {q.tokens!.map((token, tokenIndex) => <button type="button" key={tokenIndex} disabled={checked || selected.includes(tokenIndex)}
            onClick={() => setAnswers({ ...answers, [q.id]: [...selected, tokenIndex] })}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm disabled:opacity-35">{token}</button>)}
        </div>
      </div>}
      {checked && <div role="status" className={`rounded-xl p-4 text-sm ${answerIsCorrect(q, answer) ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        <strong>{answerIsCorrect(q, answer) ? 'Correct — හරි!' : 'Let’s review — නැවත බලමු.'}</strong>
        <p className="mt-2 whitespace-pre-line">{q.explanation}</p>
      </div>}
      <div className="flex justify-end">
        {!checked ? <button type="button" disabled={!canCheck} onClick={() => setChecked(true)} className="rounded-xl bg-amber-800 px-5 py-2 font-semibold text-white disabled:opacity-40">Check answer</button>
          : <button type="button" disabled={!ready && index === quiz.questions.length - 1} onClick={next} className="rounded-xl bg-amber-800 px-5 py-2 font-semibold text-white disabled:opacity-40">{index === quiz.questions.length - 1 ? 'Finish quiz & save result' : 'Next question'}</button>}
      </div>
      {!ready && <p className="text-xs text-stone-600">Waiting for your account check before saving results.</p>}
    </section> : <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="text-2xl font-bold">{result.score}% · {result.correctCount} / {result.total}</h3>
      <p className="font-semibold">{result.passed ? saved ? 'Passed! This lesson is now complete on this device.' : 'Passed! Save the result below to record completion.' : 'Keep practising. Score at least 80% to complete this lesson.'}</p>
      <p className="text-sm text-stone-600">{saved ? 'Result recorded locally. If signed in, check the cloud saving status above.' : 'The result has not been saved. Please retry saving below.'}</p>
      {!saved && <button type="button" disabled={!ready} onClick={save} className="font-semibold underline">Retry saving result</button>}
      {quiz.questions.map((question, i) => <details key={question.id} className="rounded-lg border border-stone-200 p-3">
        <summary className="cursor-pointer text-sm font-semibold">{result.correct[i] ? '✓' : 'Review'} Question {i + 1}: {question.skill}</summary>
        <p className="mt-2 whitespace-pre-line text-sm">{question.explanation}</p>
      </details>)}
      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={retry} className="rounded-xl bg-amber-800 px-4 py-2 text-sm font-semibold text-white">Try a new version</button>
        <button type="button" onClick={onBack} className="text-sm font-semibold underline">Return to lesson</button>
        <button type="button" onClick={() => setSpeaking(value => !value)} className="text-sm underline">Optional speaking practice</button>
      </div>
      {speaking && <SpokenQuizAnswer target={quiz.speakingPhrase.english} audioSpeed={audioSpeed} submitted={false}
        onAssessment={setSpeechResult} onSkip={() => setSpeaking(false)} />}
    </section>}
  </div>;
}
