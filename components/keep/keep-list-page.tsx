"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadDoneMap, loadProgress, markDone, saveDoneMap } from "@/lib/progress-store";
import { DoneMap, LearnProgressMap, WordItem } from "@/lib/types";

type KeepSort = "alpha" | "recent";

type KeepWord = {
  word: WordItem;
  lastReviewedAt: string;
};

function byAlpha(a: KeepWord, b: KeepWord): number {
  return a.word.lemma.localeCompare(b.word.lemma, "en", { sensitivity: "base" });
}

function byRecent(a: KeepWord, b: KeepWord): number {
  const diff = new Date(b.lastReviewedAt).getTime() - new Date(a.lastReviewedAt).getTime();
  if (diff !== 0) return diff;
  return byAlpha(a, b);
}

export function KeepListPage({ words }: { words: WordItem[] }) {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<KeepSort>("alpha");
  const [progressMap, setProgressMap] = useState<LearnProgressMap>({});
  const [doneMap, setDoneMap] = useState<DoneMap>({});

  useEffect(() => {
    setProgressMap(loadProgress());
    setDoneMap(loadDoneMap());
  }, []);

  const keepWords = useMemo(() => {
    const list = words
      .map((word) => ({
        word,
        entry: progressMap[word.id]
      }))
      .filter((item): item is { word: WordItem; entry: LearnProgressMap[string] } => {
        return Boolean(item.entry) && !doneMap[item.word.id];
      })
      .map((item) => ({
        word: item.word,
        lastReviewedAt: item.entry.lastReviewedAt
      }));

    return list.sort(sortMode === "recent" ? byRecent : byAlpha);
  }, [doneMap, progressMap, sortMode, words]);

  function handleMoveToCleared(wordId: string) {
    setDoneMap((current) => {
      const next = markDone(current, wordId);
      saveDoneMap(next);
      return next;
    });
  }

  return (
    <main className="keep-shell">
      <header className="keep-header" aria-label="Keep list header">
        <button
          type="button"
          className="keep-back"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length <= 1) {
              router.push("/");
              return;
            }
            router.back();
          }}
          aria-label="Back"
        >
          <span aria-hidden="true">←</span> Back
        </button>
        <h1>Keep</h1>
      </header>

      <section className="keep-toolbar" aria-label="Keep list controls">
        <label htmlFor="keep-sort">並び順</label>
        <select
          id="keep-sort"
          className="keep-select"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as KeepSort)}
        >
          <option value="alpha">アルファベット順</option>
          <option value="recent">最近Keepした順</option>
        </select>
      </section>

      <section className="keep-list-wrap" aria-label="Keep words">
        {keepWords.length === 0 ? (
          <p className="keep-empty">まだKeepの単語はありません。</p>
        ) : (
          <ul className="keep-list">
            {keepWords.map((item) => (
              <li key={item.word.id} className="keep-item">
                <button
                  type="button"
                  className="keep-to-cleared-button"
                  onClick={() => handleMoveToCleared(item.word.id)}
                >
                  → to Cleared
                </button>
                <p className="keep-word">{item.word.lemma}</p>
                <p className="keep-row keep-definition">{item.word.definition_en}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
