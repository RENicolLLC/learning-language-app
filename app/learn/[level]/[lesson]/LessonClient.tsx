"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lesson } from "../../../../lib/curriculum";

type LessonClientProps = {
  lesson: Lesson;
  levelKey: string;
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
            <li key={`${line.speaker}-${index}`} className="rounded-lg bg-slate-50 p-3">
              <span className="font-semibold text-slate-900">{line.speaker}:</span>{" "}
              <span className="text-slate-800">{line.line}</span>
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
    </main>
  );
}
