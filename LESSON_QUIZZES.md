# Lesson quiz curriculum

Every curriculum lesson (`lesson-1` through `lesson-1000`) now has a
lesson-specific quiz. The quiz is generated from that lesson's phrases and
explanations, so it works offline and does not depend on an AI call at quiz
time.

Each quiz contains five graded activities:

1. Sinhala meaning → English sentence
2. English sentence → Sinhala meaning
3. Sentence-building word tiles
4. Context vocabulary gap-fill
5. The usage/correction choice taught by the lesson

Four out of five answers (80%) passes the quiz and automatically completes that
lesson. The optional speaking prompt uses another lesson phrase and is feedback
only; microphone or SpeechRecognition support is never required to pass.

The generator is versioned in `src/data/lessonQuizzes.ts`. Review feedback keeps
the current attempt, while **Try a new version** uses the attempt ID as a seed
to select a different phrase arrangement and presentation order. This gives
repeated assessments fresh distractors, gaps and word tiles while preserving
the same five learning objectives. The seed is sent with the attempt, allowing
the server to recreate and grade the exact variant.

The server receives an attempt, recomputes the grade from the lesson source,
and writes the attempt and a passed lesson completion in one Turso transaction.
Failed attempts are kept without completing the lesson. Offline signed-in
attempts stay in the browser queue and retry safely by attempt ID. Guest quiz
attempts remain local; the guest lesson-import action imports lesson IDs only.

Important content note: the current 1,000-item catalogue is built from 21
underlying phrase sets repeated across the progression. This implementation
provides complete quiz coverage and consistent scaffolding for all IDs, but it
does not claim 1,000 independently authored topics. Before a public launch,
review the phrase sets with an English teacher, add more varied examples and
expand the quiz generator as the curriculum becomes more distinct.

Run `npm run curriculum:audit` before each content release. It verifies the
1,000-step numbering and IDs, and reports title, grammar-rule and phrase-set
uniqueness so content expansion is measurable instead of assumed.

The quiz answer key is present in the client because this is a learning aid,
not a secure examination. Do not use these results as a high-stakes language
certificate without a separate assessment service.
