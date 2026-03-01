export type WordItem = {
  id: string;
  lemma: string;
  rank: number;
  pos: string[];
  definition_en: string;
  example_en: string;
  level?: string;
};

export type Rating = "again" | "good";

export type LearnProgressEntry = {
  score: number;
  seenCount: number;
  lastRating: Rating;
  lastReviewedAt: string;
  nextDueAt: string;
};

export type LearnProgressMap = Record<string, LearnProgressEntry>;

export type RevealState = 0 | 1 | 2;
