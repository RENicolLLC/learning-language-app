export function getUtcDayStart(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) {
    return 0;
  }

  const uniqueSorted = Array.from(new Set(dates.map((item) => dayKey(item))))
    .map((key) => getUtcDayStart(new Date(`${key}T00:00:00.000Z`)))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = getUtcDayStart(new Date());
  const yesterday = addDays(today, -1);
  const latest = uniqueSorted[0];

  if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueSorted.length; i += 1) {
    const prev = uniqueSorted[i - 1];
    const current = uniqueSorted[i];
    if (addDays(current, 1).getTime() === prev.getTime()) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

export function computeXpAward(params: {
  quizScore: number;
  quizTotal: number;
  practiceScore: number;
  practiceTotal: number;
  speakingScore?: number;
}): number {
  const quizRatio =
    params.quizTotal > 0 ? params.quizScore / Math.max(params.quizTotal, 1) : 0;
  const practiceRatio =
    params.practiceTotal > 0
      ? params.practiceScore / Math.max(params.practiceTotal, 1)
      : 0;
  const speakingRatio = (params.speakingScore ?? 0) / 100;
  const weighted = quizRatio * 0.45 + practiceRatio * 0.45 + speakingRatio * 0.1;
  return Math.max(5, Math.round(weighted * 100));
}
