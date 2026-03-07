import type { LevelKey } from "./curriculum";

export type PlacementQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
};

export type PlacementResult = {
  score: number;
  total: number;
  recommendedLevel: LevelKey;
  takenAt: string;
};

const PLACEMENT_STORAGE_KEY = "american-english-placement-v1";

export const placementQuestions: PlacementQuestion[] = [
  {
    id: "p1",
    prompt: 'Choose the best sentence: "Yesterday, I ___ to the store."',
    options: ["go", "goes", "went", "gone"],
    answerIndex: 2,
  },
  {
    id: "p2",
    prompt: 'What does "Could you please..." usually express?',
    options: ["A polite request", "A strong command", "A joke", "A past memory"],
    answerIndex: 0,
  },
  {
    id: "p3",
    prompt: 'In U.S. casual speech, "want to" often sounds like:',
    options: ["wanto", "wanna", "wentar", "wontoe"],
    answerIndex: 1,
  },
  {
    id: "p4",
    prompt: 'Best response in a meeting: "I disagree, but..."',
    options: [
      "you are wrong",
      "I see your point, but I have a concern",
      "no way ever",
      "end of discussion",
    ],
    answerIndex: 1,
  },
  {
    id: "p5",
    prompt: 'Choose the most natural U.S. phrase at a restaurant:',
    options: [
      "Give coffee now",
      "Can I get a coffee, please?",
      "Coffee for me immediate",
      "I command one coffee",
    ],
    answerIndex: 1,
  },
  {
    id: "p6",
    prompt: 'A "trade-off" means:',
    options: [
      "A perfect solution",
      "A balance between benefits and costs",
      "A grammar rule",
      "An idiom for weather",
    ],
    answerIndex: 1,
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function recommendLevel(score: number, total: number): LevelKey {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio < 0.45) {
    return "beginner";
  }
  if (ratio < 0.8) {
    return "intermediate";
  }
  return "advanced";
}

export function savePlacementResult(result: Omit<PlacementResult, "takenAt">): void {
  if (!isBrowser()) {
    return;
  }

  const payload: PlacementResult = {
    ...result,
    takenAt: new Date().toISOString(),
  };
  window.localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(payload));
}

export function getPlacementResult(): PlacementResult | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PlacementResult;
  } catch {
    return null;
  }
}
