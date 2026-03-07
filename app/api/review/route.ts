import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getUtcDayStart } from "../../../lib/learning-stats";
import { applySm2 } from "../../../lib/review";
import { getRequiredUserEmail } from "../../../lib/server-auth";

type ReviewAnswerBody = {
  cardId: string;
  quality: number;
};

export async function GET(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "15");

  const cards = await db.reviewCard.findMany({
    where: {
      userEmail,
      dueAt: { lte: new Date() },
    },
    orderBy: [{ dueAt: "asc" }, { updatedAt: "asc" }],
    take: Math.max(1, Math.min(50, limit)),
  });

  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ReviewAnswerBody;
  if (!body.cardId || Number.isNaN(body.quality)) {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }

  const card = await db.reviewCard.findFirst({
    where: { id: body.cardId, userEmail },
  });

  if (!card) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }

  const updatedSchedule = applySm2({
    repetitions: card.repetitions,
    intervalDays: card.intervalDays,
    easeFactor: card.easeFactor,
    quality: body.quality,
  });

  const updated = await db.reviewCard.update({
    where: { id: card.id },
    data: {
      repetitions: updatedSchedule.repetitions,
      intervalDays: updatedSchedule.intervalDays,
      easeFactor: updatedSchedule.easeFactor,
      dueAt: updatedSchedule.dueAt,
      lastReviewedAt: new Date(),
    },
  });

  const xp = Math.max(2, Math.round(Math.min(5, Math.max(0, body.quality)) * 3));
  await db.dailyActivity.upsert({
    where: {
      userEmail_activityDate: {
        userEmail,
        activityDate: getUtcDayStart(new Date()),
      },
    },
    update: {
      xpEarned: { increment: xp },
    },
    create: {
      userEmail,
      activityDate: getUtcDayStart(new Date()),
      xpEarned: xp,
    },
  });

  return NextResponse.json({ card: updated, xpAwarded: xp });
}
