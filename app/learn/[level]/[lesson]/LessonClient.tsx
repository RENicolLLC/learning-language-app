"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import type { Lesson, LevelKey } from "../../../../lib/curriculum";
import {
  getLessonProgress,
  saveLessonProgress,
  type ProgressMap,
  type LessonProgress,
} from "../../../../lib/progress";

type LessonClientProps = {
  lesson: Lesson;
  levelKey: LevelKey;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
};

type SpeakingEvaluationItem = {
  id: string;
  targetText: string;
  transcriptText: string;
  accuracyScore: number;
  feedback: string;
  createdAt: string;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function localSpeakingScore(target: string, transcript: string): number {
  const targetWords = normalizeText(target).split(" ").filter(Boolean);
  const transcriptWords = normalizeText(transcript).split(" ").filter(Boolean);
  if (targetWords.length === 0) {
    return 0;
  }
  const targetSet = new Set(targetWords);
  const matched = transcriptWords.filter((word) => targetSet.has(word)).length;
  return Math.min(100, Math.round((matched / targetWords.length) * 100));
}

export function LessonClient({ lesson, levelKey }: LessonClientProps) {
  const { status } = useSession();
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [practiceResponses, setPracticeResponses] = useState<Record<string, string>>(
    {},
  );
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [savedProgress, setSavedProgress] = useState<LessonProgress | null>(null);
  const [saveNotice, setSaveNotice] = useState("");
  const [speechAvailable, setSpeechAvailable] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState("");
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(
    lesson.dialogue[0]?.line ?? lesson.americanTip,
  );
  const [transcriptText, setTranscriptText] = useState("");
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);
  const [speakingFeedback, setSpeakingFeedback] = useState("");
  const [speakingNotice, setSpeakingNotice] = useState("");
  const [speakingHistory, setSpeakingHistory] = useState<SpeakingEvaluationItem[]>(
    [],
  );
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const quizScore = useMemo(() => {
    return lesson.quiz.reduce((score, question) => {
      return quizSelections[question.id] === question.answerIndex
        ? score + 1
        : score;
    }, 0);
  }, [lesson.quiz, quizSelections]);

  const practiceScore = useMemo(() => {
    return lesson.practice.reduce((score, prompt) => {
      const current = practiceResponses[prompt.id] ?? "";
      return normalizeText(current) === normalizeText(prompt.answer)
        ? score + 1
        : score;
    }, 0);
  }, [lesson.practice, practiceResponses]);

  const lessonCompleted = quizSubmitted && practiceChecked;

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch(
          `/api/progress?levelKey=${levelKey}&lessonSlug=${lesson.slug}`,
        ).then((response) =>
          response.ok
            ? response.json()
            : Promise.reject(new Error("Failed progress load")),
        ),
        fetch(
          `/api/speaking/evaluate?levelKey=${levelKey}&lessonSlug=${lesson.slug}&limit=5`,
        ).then((response) =>
          response.ok
            ? response.json()
            : Promise.reject(new Error("Failed speaking load")),
        ),
      ])
        .then(
          ([progressData, speakingData]: [
            { item: LessonProgress | null },
            { items: SpeakingEvaluationItem[] },
          ]) => {
            if (progressData.item) {
              setSavedProgress(progressData.item);
            }
            setSpeakingHistory(speakingData.items ?? []);
            setSaveNotice("Cloud sync enabled.");
          },
        )
        .catch(() => {
          const initialProgress = getLessonProgress(levelKey, lesson.slug);
          if (initialProgress) {
            setSavedProgress(initialProgress);
          }
          setSaveNotice("Cloud sync unavailable. Using local device storage.");
        });
      return;
    }

    const initialProgress = getLessonProgress(levelKey, lesson.slug);
    if (initialProgress) {
      setSavedProgress(initialProgress);
    }
    if (status === "unauthenticated") {
      setSaveNotice("Sign in to sync lesson progress across devices.");
    }
  }, [levelKey, lesson.slug, status]);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window;
    setSpeechAvailable(supported);

    const recognitionWindow = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor =
      recognitionWindow.SpeechRecognition ??
      recognitionWindow.webkitSpeechRecognition;
    setRecognitionAvailable(Boolean(SpeechRecognitionCtor));
  }, []);

  async function saveProgressToCloud(payload: {
    completed: boolean;
    quizScore: number;
    quizTotal: number;
    practiceScore: number;
    practiceTotal: number;
  }): Promise<LessonProgress | null> {
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        levelKey,
        lessonSlug: lesson.slug,
        ...payload,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { item: LessonProgress };
    return data.item;
  }

  async function persistProgress(source: "auto" | "manual"): Promise<void> {
    const payload = {
      completed: lessonCompleted,
      quizScore,
      quizTotal: lesson.quiz.length,
      practiceScore,
      practiceTotal: lesson.practice.length,
    };

    if (status === "authenticated") {
      const cloud = await saveProgressToCloud(payload);
      if (cloud) {
        setSavedProgress(cloud);
        if (source === "manual") {
          setSaveNotice(
            "Progress saved to your account. Review cards were updated too.",
          );
        }
        return;
      }
    }

    const latest = saveLessonProgress(levelKey, lesson.slug, payload);
    if (latest) {
      setSavedProgress(latest);
      if (source === "manual") {
        setSaveNotice("Progress saved on this device.");
      }
    }
  }

  useEffect(() => {
    if (!quizSubmitted && !practiceChecked) {
      return;
    }
    void persistProgress("auto");
  }, [
    lesson.quiz.length,
    lesson.practice.length,
    levelKey,
    lesson.slug,
    lessonCompleted,
    practiceChecked,
    practiceScore,
    quizScore,
    quizSubmitted,
    status,
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  function saveCurrentProgress(): void {
    void persistProgress("manual");
  }

  function speak(text: string): void {
    if (!speechAvailable || typeof window === "undefined") {
      setSpeechNotice("Audio playback is not available in this browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.96;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeechNotice("");
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechNotice("Could not play audio. Please try again.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }

  function startRecording(): void {
    if (!recognitionAvailable || typeof window === "undefined") {
      setSpeakingNotice(
        "Speech recognition is not available in this browser. Type your transcript manually.",
      );
      return;
    }

    const recognitionWindow = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor =
      recognitionWindow.SpeechRecognition ??
      recognitionWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSpeakingNotice("Speech recognition is not supported.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: unknown) => {
      const resultEvent = event as {
        results: { 0: { transcript: string } }[];
      };
      const transcript = Array.from(resultEvent.results)
        .map((item) => item[0]?.transcript ?? "")
        .join(" ")
        .trim();
      setTranscriptText(transcript);
      setSpeakingNotice("");
    };

    recognition.onerror = () => {
      setSpeakingNotice("Could not capture speech. Please try again.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    setTranscriptText("");
    setIsRecording(true);
    recognition.start();
  }

  function stopRecording(): void {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  async function evaluateSpeaking(): Promise<void> {
    if (!selectedTarget.trim() || !transcriptText.trim()) {
      setSpeakingNotice("Please choose a target and provide a transcript.");
      return;
    }

    if (status === "authenticated") {
      const response = await fetch("/api/speaking/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelKey,
          lessonSlug: lesson.slug,
          targetText: selectedTarget,
          transcriptText,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          score: number;
          feedback: string;
          evaluation: SpeakingEvaluationItem;
          xpAwarded: number;
        };
        setSpeakingScore(data.score);
        setSpeakingFeedback(`${data.feedback} (+${data.xpAwarded} XP)`);
        setSpeakingHistory((current) => [data.evaluation, ...current].slice(0, 5));
        setSpeakingNotice("Speaking score saved to your account.");
        return;
      }
    }

    const localScore = localSpeakingScore(selectedTarget, transcriptText);
    setSpeakingScore(localScore);
    setSpeakingFeedback(
      localScore >= 75
        ? "Great clarity. Keep practicing natural rhythm."
        : "Good attempt. Slow down and repeat with clearer stress on key words.",
    );
    setSpeakingNotice("Sign in to store speaking scores across devices.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
      <Link
        href={`/learn/${levelKey}`}
        className="mb-5 inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        Back to lesson list
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">{lesson.title}</h1>
        <p className="mt-2 text-slate-700">{lesson.goal}</p>
        <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          <span className="font-semibold">American tip:</span> {lesson.americanTip}
        </p>
        {savedProgress ? (
          <p className="mt-3 text-sm text-slate-600">
            Saved status: {savedProgress.completed ? "Completed" : "In progress"}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Pronunciation Audio (American)
        </h2>
        <p className="mt-2 text-slate-700">
          Listen and repeat to practice natural U.S. rhythm and pronunciation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => speak(lesson.americanTip)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Play American tip
          </button>
          <button
            type="button"
            onClick={() =>
              speak(
                lesson.dialogue
                  .map((line) => `${line.speaker} says: ${line.line}`)
                  .join(" "),
              )
            }
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-900"
          >
            Play full dialogue
          </button>
          <button
            type="button"
            onClick={stopSpeaking}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
          >
            Stop audio
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {isSpeaking ? "Playing audio..." : "Audio is stopped."}
        </p>
        {speechNotice ? (
          <p className="mt-1 text-sm font-medium text-red-700">{speechNotice}</p>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Speaking Evaluation
        </h2>
        <p className="mt-2 text-slate-700">
          Practice a sentence, then get an instant speaking score and feedback.
        </p>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Target sentence
        </label>
        <select
          value={selectedTarget}
          onChange={(event) => setSelectedTarget(event.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300 focus:ring"
        >
          {lesson.dialogue.map((line, index) => (
            <option key={`${line.speaker}-${index}`} value={line.line}>
              {line.speaker}: {line.line}
            </option>
          ))}
          <option value={lesson.americanTip}>American tip</option>
        </select>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startRecording}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {isRecording ? "Recording..." : "Start recording"}
          </button>
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
          >
            Stop recording
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {recognitionAvailable
            ? "Speech recognition is available."
            : "Speech recognition not available; you can type transcript manually."}
        </p>

        <textarea
          value={transcriptText}
          onChange={(event) => setTranscriptText(event.target.value)}
          placeholder="Your spoken transcript appears here (or type manually)."
          className="mt-3 min-h-[110px] w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-300 focus:ring"
        />

        <button
          type="button"
          onClick={() => void evaluateSpeaking()}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-black"
        >
          Evaluate speaking
        </button>

        {speakingScore !== null ? (
          <div className="mt-3 rounded-lg bg-blue-50 p-3 text-blue-900">
            <p className="font-semibold">Speaking score: {speakingScore}%</p>
            <p className="text-sm">{speakingFeedback}</p>
          </div>
        ) : null}
        {speakingNotice ? (
          <p className="mt-2 text-sm text-slate-600">{speakingNotice}</p>
        ) : null}
        {speakingHistory.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-900">
              Recent speaking attempts
            </p>
            <ul className="mt-2 space-y-2">
              {speakingHistory.map((item) => (
                <li key={item.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-900">
                    {item.accuracyScore}% - {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="text-slate-700">Target: {item.targetText}</p>
                  <p className="text-slate-600">You said: {item.transcriptText}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Vocabulary</h2>
        <ul className="mt-3 space-y-3">
          {lesson.vocabulary.map((item) => (
            <li key={item.word} className="rounded-lg bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">{item.word}</p>
              <p className="text-slate-700">{item.meaning}</p>
              <p className="text-sm text-slate-500">Example: {item.example}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Dialogue</h2>
        <ul className="mt-3 space-y-2">
          {lesson.dialogue.map((line, index) => (
            <li
              key={`${line.speaker}-${index}`}
              className="rounded-lg bg-slate-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p>
                  <span className="font-semibold text-slate-900">
                    {line.speaker}:
                  </span>{" "}
                  <span className="text-slate-800">{line.line}</span>
                </p>
                <button
                  type="button"
                  onClick={() => speak(line.line)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Play
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Quiz</h2>
        <div className="mt-4 space-y-5">
          {lesson.quiz.map((question, questionIndex) => (
            <div key={question.id} className="rounded-lg border border-slate-200 p-4">
              <p className="font-medium text-slate-900">
                {questionIndex + 1}. {question.prompt}
              </p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = quizSelections[question.id] === optionIndex;
                  const isCorrect = optionIndex === question.answerIndex;
                  const showResult = quizSubmitted;
                  const resultClass = showResult
                    ? isCorrect
                      ? "border-green-500 bg-green-50 text-green-900"
                      : isSelected
                        ? "border-red-500 bg-red-50 text-red-900"
                        : "border-slate-200 bg-white text-slate-700"
                    : isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 bg-white text-slate-700";

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={quizSubmitted}
                      className={`rounded-md border px-3 py-2 text-left transition ${resultClass}`}
                      onClick={() =>
                        setQuizSelections((current) => ({
                          ...current,
                          [question.id]: optionIndex,
                        }))
                      }
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {quizSubmitted ? (
                <p className="mt-2 text-sm text-slate-600">{question.explanation}</p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuizSubmitted(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Check quiz
          </button>
          {quizSubmitted ? (
            <p className="text-sm font-medium text-slate-700">
              Score: {quizScore}/{lesson.quiz.length}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Practice Writing</h2>
        <div className="mt-4 space-y-4">
          {lesson.practice.map((prompt, promptIndex) => {
            const isCorrect =
              normalizeText(practiceResponses[prompt.id] ?? "") ===
              normalizeText(prompt.answer);
            return (
              <div key={prompt.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium text-slate-900">
                  {promptIndex + 1}. {prompt.sentence}
                </p>
                <p className="mt-1 text-sm text-slate-500">Hint: {prompt.hint}</p>
                <input
                  value={practiceResponses[prompt.id] ?? ""}
                  onChange={(event) =>
                    setPracticeResponses((current) => ({
                      ...current,
                      [prompt.id]: event.target.value,
                    }))
                  }
                  placeholder="Type your answer"
                  className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-300 focus:ring"
                />
                {practiceChecked ? (
                  <p
                    className={`mt-2 text-sm font-medium ${
                      isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {isCorrect
                      ? "Correct"
                      : `Try again. Expected answer: ${prompt.answer}`}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPracticeChecked(true)}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-900"
          >
            Check writing
          </button>
          {practiceChecked ? (
            <p className="text-sm font-medium text-slate-700">
              Score: {practiceScore}/{lesson.practice.length}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">Save Progress</h2>
        <p className="mt-2 text-slate-700">
          Progress auto-saves after checking quiz or writing. You can also save
          manually anytime.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveCurrentProgress}
            className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
          >
            Save progress now
          </button>
          <span
            className={`rounded px-2 py-1 text-xs font-medium ${
              lessonCompleted
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {lessonCompleted ? "Lesson marked complete" : "Lesson in progress"}
          </span>
        </div>
        {saveNotice ? (
          <p className="mt-2 text-sm font-medium text-green-700">{saveNotice}</p>
        ) : null}
        {savedProgress ? (
          <p className="mt-1 text-sm text-slate-600">
            Last saved: {new Date(savedProgress.updatedAt).toLocaleString()}
          </p>
        ) : null}
        {lessonCompleted ? (
          <p className="mt-2 text-xs text-slate-500">
            Completed lessons automatically generate spaced-repetition review cards.
          </p>
        ) : null}
      </section>
    </main>
  );
}
