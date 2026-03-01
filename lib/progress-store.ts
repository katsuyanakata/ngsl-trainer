import { DoneMap, LearnProgressEntry, LearnProgressMap, WordItem } from "@/lib/types";

export const LEARN_STORAGE_KEY = "ngsl_learn_progress_v1";
export const DONE_STORAGE_KEY = "ngsl_done_words_v1";

const KEEP_INTERVAL_HOURS = [6, 12, 24, 72, 168, 336];

export type UndoAction = {
  wordId: string;
  prevProgress: LearnProgressEntry | null;
  prevDoneAt: string | null;
  prevQueueIndex: number;
  actionType: "keep" | "done";
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function addHours(base: Date, hours: number): string {
  const copy = new Date(base);
  copy.setHours(copy.getHours() + hours);
  return copy.toISOString();
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function coerceRating(value: unknown): "keep" | "done" {
  if (value === "done") return "done";
  if (value === "keep") return "keep";
  if (value === "again" || value === "good" || value === "know" || value === "uncertain" || value === "dontKnow") {
    return "keep";
  }
  return "keep";
}

function coerceEntry(value: unknown): LearnProgressEntry | null {
  if (!isObjectLike(value)) return null;

  const score = typeof value.score === "number" ? clamp(value.score, 0, KEEP_INTERVAL_HOURS.length - 1) : 0;
  const seenCount = typeof value.seenCount === "number" ? Math.max(0, value.seenCount) : 0;
  const lastReviewedAt = typeof value.lastReviewedAt === "string" ? value.lastReviewedAt : new Date(0).toISOString();

  const nextDueSource = typeof value.nextDueAt === "string" ? value.nextDueAt : undefined;
  const nextDueAt = toDate(nextDueSource)?.toISOString() ?? new Date(0).toISOString();

  return {
    score,
    seenCount,
    lastRating: coerceRating(value.lastRating ?? value.lastConfidence),
    lastReviewedAt,
    nextDueAt
  };
}

function shuffleIds(ids: string[]): string[] {
  const copy = ids.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toDoneMap(rawValue: unknown): DoneMap {
  if (!isObjectLike(rawValue)) return {};

  const doneMap: DoneMap = {};
  for (const [wordId, doneAt] of Object.entries(rawValue)) {
    if (typeof doneAt !== "string") continue;
    const parsed = toDate(doneAt);
    if (!parsed) continue;
    doneMap[wordId] = parsed.toISOString();
  }

  return doneMap;
}

export function loadProgress(): LearnProgressMap {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(LEARN_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isObjectLike(parsed) && isObjectLike(parsed.progress)) {
      const migrated: LearnProgressMap = {};
      for (const [wordId, entry] of Object.entries(parsed.progress)) {
        const normalized = coerceEntry(entry);
        if (normalized) migrated[wordId] = normalized;
      }
      return migrated;
    }

    if (isObjectLike(parsed)) {
      const normalizedMap: LearnProgressMap = {};
      for (const [wordId, entry] of Object.entries(parsed)) {
        const normalized = coerceEntry(entry);
        if (normalized) normalizedMap[wordId] = normalized;
      }
      return normalizedMap;
    }

    return {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: LearnProgressMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify({ progress }));
}

export function loadDoneMap(): DoneMap {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(DONE_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (isObjectLike(parsed) && isObjectLike(parsed.done)) {
      return toDoneMap(parsed.done);
    }

    return toDoneMap(parsed);
  } catch {
    return {};
  }
}

export function saveDoneMap(doneMap: DoneMap): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DONE_STORAGE_KEY, JSON.stringify({ done: doneMap }));
}

export function applyKeep(
  progress: LearnProgressMap,
  wordId: string,
  now: Date = new Date()
): { nextProgress: LearnProgressMap; prevProgress: LearnProgressEntry | null } {
  const current = progress[wordId];

  const nextScore = clamp((current?.score ?? 0) + 1, 0, KEEP_INTERVAL_HOURS.length - 1);
  const nextDueAt = addHours(now, KEEP_INTERVAL_HOURS[nextScore] ?? 24);

  const nextEntry: LearnProgressEntry = {
    score: nextScore,
    seenCount: (current?.seenCount ?? 0) + 1,
    lastRating: "keep",
    lastReviewedAt: now.toISOString(),
    nextDueAt
  };

  return {
    nextProgress: {
      ...progress,
      [wordId]: nextEntry
    },
    prevProgress: current ? { ...current } : null
  };
}

export function markDone(doneMap: DoneMap, wordId: string, now: Date = new Date()): DoneMap {
  return {
    ...doneMap,
    [wordId]: now.toISOString()
  };
}

export function unmarkDone(doneMap: DoneMap, wordId: string): DoneMap {
  const next = { ...doneMap };
  delete next[wordId];
  return next;
}

export function undoLastAction(progress: LearnProgressMap, action: UndoAction): LearnProgressMap {
  const next = { ...progress };

  if (!action.prevProgress) {
    delete next[action.wordId];
    return next;
  }

  next[action.wordId] = action.prevProgress;
  return next;
}

export function restoreDoneState(doneMap: DoneMap, action: UndoAction): DoneMap {
  const next = { ...doneMap };

  if (!action.prevDoneAt) {
    delete next[action.wordId];
    return next;
  }

  next[action.wordId] = action.prevDoneAt;
  return next;
}

export function buildSessionQueue(
  words: WordItem[],
  progress: LearnProgressMap,
  doneMap: DoneMap,
  now: Date = new Date()
): string[] {
  if (!words.length) return [];

  const dueWords: Array<{ wordId: string; dueAt: number }> = [];
  const unseenIds: string[] = [];

  for (const word of words) {
    if (doneMap[word.id]) continue;

    const entry = progress[word.id];
    if (!entry) {
      unseenIds.push(word.id);
      continue;
    }

    const dueAt = toDate(entry.nextDueAt);
    if (!dueAt || dueAt <= now) {
      dueWords.push({
        wordId: word.id,
        dueAt: dueAt?.getTime() ?? Number.NEGATIVE_INFINITY
      });
    }
  }

  const dueIds = dueWords.sort((a, b) => a.dueAt - b.dueAt).map((item) => item.wordId);
  const randomUnseen = shuffleIds(unseenIds);
  const queue = [...dueIds, ...randomUnseen];

  if (queue.length) return queue;

  const nonDoneWords = words.filter((word) => !doneMap[word.id]);
  if (!nonDoneWords.length) return [];

  const fallback = nonDoneWords
    .map((word) => ({
      wordId: word.id,
      nextDueAt: toDate(progress[word.id]?.nextDueAt)?.getTime() ?? Number.POSITIVE_INFINITY
    }))
    .sort((a, b) => a.nextDueAt - b.nextDueAt)[0];

  return fallback ? [fallback.wordId] : [nonDoneWords[Math.floor(Math.random() * nonDoneWords.length)].id];
}
