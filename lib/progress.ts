import type { LevelKey } from "./curriculum";

export type LessonProgress = {
  levelKey: LevelKey;
  lessonSlug: string;
  quizScore: number;
  quizTotal: number;
  practiceScore: number;
  practiceTotal: number;
  completed: boolean;
  updatedAt: string;
};

export type ProgressMap = Record<string, LessonProgress>;

const PROGRESS_STORAGE_KEY = "american-english-progress-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function toLessonKey(levelKey: LevelKey, lessonSlug: string): string {
  return `${levelKey}/${lessonSlug}`;
}

export function getProgressMap(): ProgressMap {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as ProgressMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function getLessonProgress(
  levelKey: LevelKey,
  lessonSlug: string,
): LessonProgress | null {
  const progress = getProgressMap();
  return progress[toLessonKey(levelKey, lessonSlug)] ?? null;
}

export function saveLessonProgress(
  levelKey: LevelKey,
  lessonSlug: string,
  payload: Omit<LessonProgress, "levelKey" | "lessonSlug" | "updatedAt">,
): LessonProgress | null {
  if (!isBrowser()) {
    return null;
  }

  const nextValue: LessonProgress = {
    ...payload,
    levelKey,
    lessonSlug,
    updatedAt: new Date().toISOString(),
  };

  const current = getProgressMap();
  current[toLessonKey(levelKey, lessonSlug)] = nextValue;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(current));
  return nextValue;
}

export function countCompletedLessons(
  progress: ProgressMap,
  levelKey?: LevelKey,
): number {
  return Object.values(progress).filter((item) => {
    if (levelKey && item.levelKey !== levelKey) {
      return false;
    }
    return item.completed;
  }).length;
}
