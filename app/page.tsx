import Link from "next/link";

const highlights = [
  "Beginner to advanced pathways",
  "American pronunciation and natural expressions",
  "Interactive quiz and writing practice in every lesson",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-16">
      <section className="rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
        <p className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          U.S. English Learning
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
          Speak English like it is used in America.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-700">
          Practice real American English for everyday life, school, and work.
          Start with your level, complete guided lessons, and get instant feedback.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/learn"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Start Learning
          </Link>
          <Link
            href="/about"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-800 hover:bg-slate-50"
          >
            About the Program
          </Link>
          <Link
            href="/api/auth/signin"
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-800 hover:bg-slate-50"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <h2 className="font-semibold text-slate-900">{item}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}

