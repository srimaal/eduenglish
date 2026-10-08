import { useEffect, useMemo } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechInput } from '../hooks/useSpeechInput';
import { assessSpokenAnswer, type SpeechAssessment } from '../utils/speechAssessment';
import { speakEnglish } from '../utils/speechUtils';

export function SpokenQuizAnswer({ target, audioSpeed, submitted, onAssessment, onSkip }: {
  target: string; audioSpeed: number; submitted: boolean;
  onAssessment: (assessment: SpeechAssessment | null) => void; onSkip: () => void;
}) {
  const speech = useSpeechInput(target);
  const assessment = useMemo(() => speech.finalTranscript ? assessSpokenAnswer(target, speech.finalTranscript) : null, [target, speech.finalTranscript]);
  useEffect(() => { onAssessment(assessment); }, [assessment, onAssessment]);
  return <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-center space-y-4">
    <p className="font-semibold text-stone-800">{target}</p>
    <button type="button" disabled={speech.busy} onClick={() => speakEnglish(target, audioSpeed)} className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900 disabled:opacity-50"><Volume2 className="h-4 w-4" />Listen to example</button>
    <div>
      <button type="button" aria-label={speech.busy ? 'Stop recording' : 'Start recording'} aria-pressed={speech.busy}
        disabled={submitted || speech.status === 'stopping'} onClick={() => { onAssessment(null); speech.busy ? speech.stop() : speech.start(); }}
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white disabled:opacity-50 ${speech.busy ? 'bg-rose-600' : 'bg-amber-800'}`}>
        {speech.busy ? <MicOff /> : <Mic />}
      </button>
      <p role="status" className="mt-2 text-sm">{speech.status === 'starting' ? 'Allow microphone access if prompted…' : speech.status === 'listening' ? 'Listening… say the complete sentence, then pause.' : speech.status === 'stopping' ? 'Finishing recording…' : speech.status === 'complete' ? 'Recording complete. Review the recognized words, then submit or record again.' : 'Press the microphone to speak.'}</p>
    </div>
    {speech.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{speech.error}</p>}
    {speech.transcript && <p className="rounded-lg bg-white p-3 text-sm"><strong>Recognized words: </strong>{speech.transcript}{!speech.finalTranscript && ' (listening—not graded yet)'}</p>}
    {assessment && <div className="space-y-2 text-left text-sm">
      <p className="font-bold">Recognized-word match: {assessment.score}% — {assessment.passed ? 'Sentence matched' : 'Needs another try'}</p>
      <ul className="flex flex-wrap gap-2" aria-label="Word-by-word correction">
        {assessment.corrections.map((item, index) => <li key={index} className={`rounded-lg border px-2 py-1 ${item.kind === 'match' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
          {item.kind === 'match' ? `✓ ${item.expected}` : item.kind === 'missing' ? `Missing: ${item.expected}` : item.kind === 'extra' ? `Extra: ${item.heard}` : `Heard “${item.heard}” → expected “${item.expected}”`}
        </li>)}
      </ul>
      {!submitted && <button type="button" onClick={() => { onAssessment(null); speech.start(); }} className="font-semibold underline">Record again</button>}
    </div>}
    <p className="text-xs text-stone-600">Say all the words in order to pass. Capitalization, punctuation and common contractions are ignored. This checks speech-to-text, not accent or individual sounds. If the browser heard you incorrectly, try again before submitting.</p>
    {!submitted && <button type="button" onClick={() => { speech.reset(); onAssessment(null); onSkip(); }} className="text-xs underline">Skip spoken question (not graded)</button>}
  </div>;
}
