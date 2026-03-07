import Link from "next/link";
import { notFound } from "next/navigation";
import { getLevel } from "../../../lib/curriculum";

type LevelPageProps = {
  params: {
    level: string;
  };
};

export default function LevelPage({ params }: LevelPageProps) {
  const level = getLevel(params.level);
  if (!level) {
    notFound();
  }

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
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {level.lessons.map((lesson, index) => (
          <article
            key={lesson.slug}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm font-medium text-blue-700">
              Lesson {index + 1}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {lesson.title}
            </h2>
            <p className="mt-2 text-slate-700">{lesson.goal}</p>
            <Link
              href={`/learn/${level.key}/${lesson.slug}`}
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Open lesson
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
