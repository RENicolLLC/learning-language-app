"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type ReviewCard = {
  id: string;
  cardType: string;
  levelKey: string;
  lessonSlug: string;
  frontText: string;
  backText: string;
};

export default function ReviewPage() {
  const { status } = useSession();
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [notice, setNotice] = useState("Loading your review cards...");
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
      if (status === "unauthenticated") {
        setNotice("Sign in to review cards synced across your devices.");
      }
      return;
    }

    fetch("/api/review?limit=25")
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error("review")),
      )
      .then((data: { cards: ReviewCard[] }) => {
        setCards(data.cards ?? []);
        if ((data.cards ?? []).length === 0) {
          setNotice(
            "No cards due right now. Complete lessons to generate more review cards.",
          );
        } else {
          setNotice("Cards ready. Review a little every day to keep your streak.");
        }
      })
      .catch(() => {
        setNotice("Could not load review cards. Please try again.");
      });
  }, [status]);

  const currentCard = cards[index] ?? null;

  async function submitQuality(quality: number): Promise<void> {
    if (!currentCard) {
      return;
    }
    const response = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: currentCard.id, quality }),
    });

    if (!response.ok) {
      setNotice("Could not save this review result.");
      return;
    }

    const data = (await response.json()) as { xpAwarded: number };
    setXpEarned((value) => value + data.xpAwarded);
    setShowAnswer(false);
    if (index + 1 >= cards.length) {
      setCards([]);
      setNotice("Great session. You finished your due cards for now.");
      return;
    }
    setIndex((value) => value + 1);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
      <Link
        href="/learn"
        className="mb-5 inline-flex w-fit rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        Back to learning
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">
          Spaced Repetition Review
        </h1>
        <p className="mt-2 text-slate-700">
          Quick daily reviews improve long-term memory and speaking confidence.
        </p>
        <p className="mt-2 text-sm text-slate-600">{notice}</p>
        <p className="mt-2 text-sm font-medium text-emerald-700">
          Session XP earned: {xpEarned}
        </p>
      </section>

      {currentCard ? (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">
            Card {index + 1} of {cards.length} ({currentCard.levelKey} /{" "}
            {currentCard.lessonSlug})
          </p>
          <p className="mt-3 text-xl font-semibold text-slate-900">
            {currentCard.frontText}
          </p>

          {!showAnswer ? (
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Show answer
            </button>
          ) : (
            <>
              <p className="mt-4 rounded-lg bg-blue-50 p-3 text-blue-900">
                {currentCard.backText}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void submitQuality(2)}
                  className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  Hard
                </button>
                <button
                  type="button"
                  onClick={() => void submitQuality(4)}
                  className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700"
                >
                  Good
                </button>
                <button
                  type="button"
                  onClick={() => void submitQuality(5)}
                  className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800"
                >
                  Easy
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}

      {status !== "authenticated" ? (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-700">
            Sign in to use your cloud review deck on any device.
          </p>
          <Link
            href="/api/auth/signin"
            className="mt-3 inline-flex rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-black"
          >
            Sign in
          </Link>
        </section>
      ) : null}
    </main>
  );
}
