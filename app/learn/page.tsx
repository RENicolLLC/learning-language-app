import Link from "next/link";
import { curriculum } from "../../lib/curriculum";

export default function LearnPage() {
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
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {curriculum.map((level) => (
          <article
            key={level.key}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div className="mb-2 text-sm font-medium uppercase tracking-wide text-blue-700">
              {level.cefrBand}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {level.title}
            </h2>
            <p className="mt-2 text-slate-700">{level.description}</p>
            <p className="mt-2 text-sm text-slate-500">
              {level.lessons.length} lessons
            </p>
            <Link
              href={`/learn/${level.key}`}
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
            >
              Start {level.title}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
