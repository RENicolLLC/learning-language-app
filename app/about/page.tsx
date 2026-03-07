import Link from "next/link";

const points = [
  "Focused on practical American English used in daily U.S. life",
  "Structured by level: Beginner, Intermediate, and Advanced",
  "Built with short lessons, dialogue, vocabulary, and instant checks",
];

export default function About() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
      <h1 className="text-4xl font-bold text-slate-900">
        About the Language Learning App
      </h1>
      <p className="mt-4 text-slate-700">
        This app helps international learners speak naturally in American English.
        The content focuses on useful vocabulary, real-world conversations, and
        common U.S. pronunciation patterns.
      </p>

      <ul className="mt-6 space-y-3">
        {points.map((point) => (
          <li
            key={point}
            className="rounded-lg bg-white p-4 text-slate-800 shadow-sm ring-1 ring-slate-200"
          >
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-black"
        >
          Back to Home
        </Link>
        <Link
          href="/learn"
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Go to Lessons
        </Link>
      </div>
    </main>
  );
}

