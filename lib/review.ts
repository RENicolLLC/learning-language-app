import { addDays } from "./learning-stats";

export type ReviewUpdateInput = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  quality: number;
};

export type ReviewUpdateOutput = {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  dueAt: Date;
};

export function applySm2(input: ReviewUpdateInput): ReviewUpdateOutput {
  const quality = Math.min(5, Math.max(0, input.quality));
  const easeDelta =
    0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const easeFactor = Math.max(1.3, input.easeFactor + easeDelta);

  if (quality < 3) {
    const intervalDays = 1;
    return {
      repetitions: 0,
      intervalDays,
      easeFactor,
      dueAt: addDays(new Date(), intervalDays),
    };
  }

  const repetitions = input.repetitions + 1;
  let intervalDays = 1;
  if (repetitions === 1) {
    intervalDays = 1;
  } else if (repetitions === 2) {
    intervalDays = 6;
  } else {
    intervalDays = Math.max(1, Math.round(input.intervalDays * easeFactor));
  }

  return {
    repetitions,
    intervalDays,
    easeFactor,
    dueAt: addDays(new Date(), intervalDays),
  };
}
