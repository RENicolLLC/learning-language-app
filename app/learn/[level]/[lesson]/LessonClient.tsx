"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Lesson, LevelKey } from "../../../../lib/curriculum";
import {
  getLessonProgress,
  saveLessonProgress,
  type LessonProgress,
} from "../../../../lib/progress";

type LessonClientProps = {
  lesson: Lesson;
  levelKey: LevelKey;
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function LessonClient({ lesson, levelKey }: LessonClientProps) {
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
    const initialProgress = getLessonProgress(levelKey, lesson.slug);
    if (initialProgress) {
      setSavedProgress(initialProgress);
    }
  }, [levelKey, lesson.slug]);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      "SpeechSynthesisUtterance" in window;
    setSpeechAvailable(supported);
  }, []);

  useEffect(() => {
    if (!quizSubmitted && !practiceChecked) {
      return;
    }

    const latest = saveLessonProgress(levelKey, lesson.slug, {
      completed: lessonCompleted,
      quizScore,
      quizTotal: lesson.quiz.length,
      practiceScore,
      practiceTotal: lesson.practice.length,
    });
    if (latest) {
      setSavedProgress(latest);
    }
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
  ]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function saveCurrentProgress(): void {
    const latest = saveLessonProgress(levelKey, lesson.slug, {
      completed: lessonCompleted,
      quizScore,
      quizTotal: lesson.quiz.length,
      practiceScore,
      practiceTotal: lesson.practice.length,
    });
    if (latest) {
      setSavedProgress(latest);
      setSaveNotice("Progress saved.");
    }
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
      </section>
    </main>
  );
}
