import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { calculateStreak, getUtcDayStart } from "../../../lib/learning-stats";
import { getRequiredUserEmail } from "../../../lib/server-auth";

export async function GET() {
  const userEmail = await getRequiredUserEmail();
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [progress, placement, activities, dueReviews, speakingAggregate] =
    await Promise.all([
      db.userProgress.findMany({
        where: { userEmail },
        orderBy: { updatedAt: "desc" },
      }),
      db.placementResult.findUnique({
        where: { userEmail },
      }),
      db.dailyActivity.findMany({
        where: { userEmail },
        orderBy: { activityDate: "desc" },
      }),
      db.reviewCard.count({
        where: {
          userEmail,
          dueAt: { lte: new Date() },
        },
      }),
      db.speakingEvaluation.aggregate({
        where: { userEmail },
        _avg: { accuracyScore: true },
      }),
    ]);

  const today = getUtcDayStart(new Date());
  const todayActivity = activities.find(
    (item) => item.activityDate.getTime() === today.getTime(),
  );

  const totalXp = activities.reduce((sum, item) => sum + item.xpEarned, 0);
  const streakDays = calculateStreak(activities.map((item) => item.activityDate));
  const speakingAverage = Math.round(speakingAggregate._avg.accuracyScore ?? 0);

  return NextResponse.json({
    progress,
    placement,
    stats: {
      streakDays,
      totalXp,
      todayXp: todayActivity?.xpEarned ?? 0,
      dueReviews,
      speakingAverage,
    },
  });
}
