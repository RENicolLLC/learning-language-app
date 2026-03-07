import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getLesson, type LevelKey } from "../../../lib/curriculum";
import { computeXpAward, getUtcDayStart } from "../../../lib/learning-stats";
import { getRequiredUserEmail } from "../../../lib/server-auth";

type ProgressBody = {
  levelKey: LevelKey;
  lessonSlug: string;
  quizScore: number;
  quizTotal: number;
  practiceScore: number;
  practiceTotal: number;
  completed: boolean;
};

async function seedReviewCardsForLesson(params: {
  userEmail: string;
  levelKey: LevelKey;
  lessonSlug: string;
}) {
  const lesson = getLesson(params.levelKey, params.lessonSlug);
  if (!lesson) {
    return;
  }

  const now = new Date();

  await Promise.all(
    lesson.vocabulary.map((item, index) =>
      db.reviewCard.upsert({
        where: {
          userEmail_levelKey_lessonSlug_promptId_cardType: {
            userEmail: params.userEmail,
            levelKey: params.levelKey,
            lessonSlug: params.lessonSlug,
            promptId: `vocab-${index}`,
            cardType: "vocabulary",
          },
        },
        update: {
          backText: `${item.word}: ${item.meaning}`,
        },
        create: {
          userEmail: params.userEmail,
          levelKey: params.levelKey,
          lessonSlug: params.lessonSlug,
          promptId: `vocab-${index}`,
          cardType: "vocabulary",
          frontText: item.example,
          backText: `${item.word}: ${item.meaning}`,
          dueAt: now,
        },
      }),
    ),
  );

  await Promise.all(
    lesson.practice.map((item, index) =>
      db.reviewCard.upsert({
        where: {
          userEmail_levelKey_lessonSlug_promptId_cardType: {
            userEmail: params.userEmail,
            levelKey: params.levelKey,
            lessonSlug: params.lessonSlug,
            promptId: `practice-${index}`,
            cardType: "practice",
          },
        },
        update: {
          backText: item.answer,
        },
        create: {
          userEmail: params.userEmail,
          levelKey: params.levelKey,
          lessonSlug: params.lessonSlug,
          promptId: `practice-${index}`,
          cardType: "practice",
          frontText: item.sentence,
          backText: item.answer,
          dueAt: now,
        },
      }),
    ),
  );
}

export async function GET(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const levelKey = searchParams.get("levelKey");
  const lessonSlug = searchParams.get("lessonSlug");

  if (levelKey && lessonSlug) {
    const item = await db.userProgress.findUnique({
      where: {
        userEmail_levelKey_lessonSlug: {
          userEmail,
          levelKey,
          lessonSlug,
        },
      },
    });
    return NextResponse.json({ item });
  }

  const items = await db.userProgress.findMany({
    where: {
      userEmail,
      ...(levelKey ? { levelKey } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ProgressBody;
  if (!body.levelKey || !body.lessonSlug) {
    return NextResponse.json({ error: "Missing level or lesson." }, { status: 400 });
  }

  const saved = await db.userProgress.upsert({
    where: {
      userEmail_levelKey_lessonSlug: {
        userEmail,
        levelKey: body.levelKey,
        lessonSlug: body.lessonSlug,
      },
    },
    update: {
      quizScore: body.quizScore,
      quizTotal: body.quizTotal,
      practiceScore: body.practiceScore,
      practiceTotal: body.practiceTotal,
      completed: body.completed,
    },
    create: {
      userEmail,
      levelKey: body.levelKey,
      lessonSlug: body.lessonSlug,
      quizScore: body.quizScore,
      quizTotal: body.quizTotal,
      practiceScore: body.practiceScore,
      practiceTotal: body.practiceTotal,
      completed: body.completed,
    },
  });

  const xp = computeXpAward({
    quizScore: body.quizScore,
    quizTotal: body.quizTotal,
    practiceScore: body.practiceScore,
    practiceTotal: body.practiceTotal,
  });

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

  if (body.completed) {
    await seedReviewCardsForLesson({
      userEmail,
      levelKey: body.levelKey,
      lessonSlug: body.lessonSlug,
    });
  }

  return NextResponse.json({ item: saved });
}
