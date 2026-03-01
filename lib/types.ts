export type WordItem = {
  id: string;
  lemma: string;
  rank: number;
  definition_en: string;
  example_en: string;
  level?: string;
};

export type Rating = "keep" | "done";

export type LearnProgressEntry = {
  score: number;
  seenCount: number;
  lastRating: Rating;
  lastReviewedAt: string;
  nextDueAt: string;
};

export type LearnProgressMap = Record<string, LearnProgressEntry>;

export type DoneMap = Record<string, string>;

export type RevealState = 0 | 1 | 2;
