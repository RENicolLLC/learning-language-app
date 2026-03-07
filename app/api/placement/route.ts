import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import type { LevelKey } from "../../../lib/curriculum";
import { getRequiredUserEmail } from "../../../lib/server-auth";

type PlacementBody = {
  score: number;
  total: number;
  recommendedLevel: LevelKey;
};

export async function GET() {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const item = await db.placementResult.findUnique({
    where: { userEmail },
  });
  return NextResponse.json({ item });
}

export async function POST(request: Request) {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PlacementBody;
  if (!body.total || !body.recommendedLevel) {
    return NextResponse.json(
      { error: "Invalid placement payload." },
      { status: 400 },
    );
  }

  const item = await db.placementResult.upsert({
    where: { userEmail },
    update: {
      score: body.score,
      total: body.total,
      recommendedLevel: body.recommendedLevel,
      takenAt: new Date(),
    },
    create: {
      userEmail,
      score: body.score,
      total: body.total,
      recommendedLevel: body.recommendedLevel,
      takenAt: new Date(),
    },
  });

  return NextResponse.json({ item });
}
