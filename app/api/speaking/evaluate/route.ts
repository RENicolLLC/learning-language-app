import { NextResponse } from "next/server";
import type { LevelKey } from "../../../../lib/curriculum";
import { db } from "../../../../lib/db";
import { getUtcDayStart } from "../../../../lib/learning-stats";
import { getRequiredUserEmail } from "../../../../lib/server-auth";
import { evaluateSpeakingAccuracy } from "../../../../lib/speaking";

type SpeakingEvalBody = {
  levelKey: LevelKey;
  lessonSlug: string;
  targetText: string;
  transcriptText: string;
};

export async function GET(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const levelKey = searchParams.get("levelKey");
  const lessonSlug = searchParams.get("lessonSlug");
  const limit = Number(searchParams.get("limit") ?? "10");

  const items = await db.speakingEvaluation.findMany({
    where: {
      userEmail,
      ...(levelKey ? { levelKey } : {}),
      ...(lessonSlug ? { lessonSlug } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(25, limit)),
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SpeakingEvalBody;
  if (!body.targetText || !body.transcriptText || !body.levelKey || !body.lessonSlug) {
    return NextResponse.json(
      { error: "Missing speaking evaluation fields." },
      { status: 400 },
    );
  }

  const result = evaluateSpeakingAccuracy(body.targetText, body.transcriptText);

  const saved = await db.speakingEvaluation.create({
    data: {
      userEmail,
      levelKey: body.levelKey,
      lessonSlug: body.lessonSlug,
      targetText: body.targetText,
      transcriptText: body.transcriptText,
      accuracyScore: result.score,
      feedback: result.feedback,
    },
  });

  const xp = Math.max(4, Math.round(result.score / 10));
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

  return NextResponse.json({
    evaluation: saved,
    score: result.score,
    feedback: result.feedback,
    xpAwarded: xp,
  });
}
