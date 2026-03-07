"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Level } from "../../../lib/curriculum";
import { getPlacementResult, type PlacementResult } from "../../../lib/placement";
import { getProgressMap, type ProgressMap } from "../../../lib/progress";

type LevelLessonsClientProps = {
  level: Level;
};

export default function LevelLessonsClient({ level }: LevelLessonsClientProps) {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [placementResult, setPlacementResult] = useState<PlacementResult | null>(
    null,
  );

  useEffect(() => {
    setProgress(getProgressMap());
    setPlacementResult(getPlacementResult());
  }, []);

  const isRecommended = placementResult?.recommendedLevel === level.key;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
      <Link
        href="/learn"
        className="mb-5 inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        Back to levels
      </Link>

      <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">{level.title}</h1>
        <p className="mt-2 text-slate-700">{level.description}</p>
        <p className="mt-1 text-sm text-slate-500">CEFR: {level.cefrBand}</p>
        {isRecommended ? (
          <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-900">
            This level was recommended by your placement test.
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {level.lessons.map((lesson, index) => {
          const lessonKey = `${level.key}/${lesson.slug}`;
          const lessonProgress = progress[lessonKey];
          const completed = lessonProgress?.completed ?? false;

          return (
            <article
              key={lesson.slug}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-700">
                  Lesson {index + 1}
                </p>
                {completed ? (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Completed
                  </span>
                ) : (
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                    In progress
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                {lesson.title}
              </h2>
              <p className="mt-2 text-slate-700">{lesson.goal}</p>
              {lessonProgress ? (
                <p className="mt-2 text-sm text-slate-600">
                  Last score: quiz {lessonProgress.quizScore}/{lessonProgress.quizTotal}
                  , writing {lessonProgress.practiceScore}/
                  {lessonProgress.practiceTotal}
                </p>
              ) : null}
              <Link
                href={`/learn/${level.key}/${lesson.slug}`}
                className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Open lesson
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
