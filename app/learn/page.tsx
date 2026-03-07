"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { curriculum, type LevelKey } from "../../lib/curriculum";
import {
  getPlacementResult,
  placementQuestions,
  recommendLevel,
  savePlacementResult,
  type PlacementResult,
} from "../../lib/placement";
import {
  countCompletedLessons,
  getProgressMap,
  type ProgressMap,
} from "../../lib/progress";

export default function LearnPage() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, number>>(
    {},
  );
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(
    null,
  );

  useEffect(() => {
    setProgress(getProgressMap());
    setPlacementResult(getPlacementResult());
  }, []);

  const totalLessons = useMemo(
    () => curriculum.reduce((sum, level) => sum + level.lessons.length, 0),
    [],
  );

  const completedTotal = useMemo(
    () => countCompletedLessons(progress),
    [progress],
  );

  const recommendedLevel: LevelKey | null = placementResult
    ? placementResult.recommendedLevel
    : null;

  function handlePlacementSubmit(): void {
    const score = placementQuestions.reduce((currentScore, question) => {
      return placementAnswers[question.id] === question.answerIndex
        ? currentScore + 1
        : currentScore;
    }, 0);

    const recommended = recommendLevel(score, placementQuestions.length);
    const resultPayload = {
      score,
      total: placementQuestions.length,
      recommendedLevel: recommended,
    };
    savePlacementResult(resultPayload);
    setPlacementResult({
      ...resultPayload,
      takenAt: new Date().toISOString(),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <div className="mb-8 rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Learn American English
        </h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Pick your level and start practical lessons based on real U.S.
          conversation, pronunciation, and daily communication.
        </p>
        <p className="mt-3 text-sm font-medium text-slate-700">
          Progress: {completedTotal}/{totalLessons} lessons completed
        </p>
      </div>

      <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900">
          Placement Test (Auto-Pick Level)
        </h2>
        <p className="mt-2 text-slate-700">
          Answer these quick questions and we will recommend your starting level.
        </p>
        {placementResult ? (
          <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-900">
            <p className="font-semibold">
              Recommended level: {placementResult.recommendedLevel}
            </p>
            <p className="text-sm">
              Score: {placementResult.score}/{placementResult.total}
            </p>
            <Link
              href={`/learn/${placementResult.recommendedLevel}`}
              className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Continue with recommended level
            </Link>
          </div>
        ) : null}

        <div className="mt-4 space-y-4">
          {placementQuestions.map((question, questionIndex) => (
            <article
              key={question.id}
              className="rounded-lg border border-slate-200 p-4"
            >
              <p className="font-medium text-slate-900">
                {questionIndex + 1}. {question.prompt}
              </p>
              <div className="mt-2 grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    className={`rounded-md border px-3 py-2 text-left transition ${
                      placementAnswers[question.id] === optionIndex
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    onClick={() =>
                      setPlacementAnswers((current) => ({
                        ...current,
                        [question.id]: optionIndex,
                      }))
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePlacementSubmit}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-black"
        >
          Get my level
        </button>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {curriculum.map((level) => {
          const completedForLevel = countCompletedLessons(progress, level.key);
          const isRecommended = recommendedLevel === level.key;

          return (
            <article
              key={level.key}
              className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ${
                isRecommended ? "ring-blue-500" : "ring-slate-200"
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-sm font-medium uppercase tracking-wide">
                <span className="text-blue-700">{level.cefrBand}</span>
                {isRecommended ? (
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    Recommended
                  </span>
                ) : null}
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {level.title}
              </h2>
              <p className="mt-2 text-slate-700">{level.description}</p>
              <p className="mt-2 text-sm text-slate-500">
                {completedForLevel}/{level.lessons.length} lessons complete
              </p>
              <Link
                href={`/learn/${level.key}`}
                className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
              >
                Start {level.title}
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
