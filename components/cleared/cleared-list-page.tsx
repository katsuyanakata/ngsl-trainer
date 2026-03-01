"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { applyKeep, loadDoneMap, loadProgress, saveDoneMap, saveProgress, unmarkDone } from "@/lib/progress-store";
import { DoneMap, LearnProgressMap, WordItem } from "@/lib/types";

type DoneSort = "alpha" | "recent";

type DoneWord = {
  word: WordItem;
  doneAt: string;
};

function byAlpha(a: DoneWord, b: DoneWord): number {
  return a.word.lemma.localeCompare(b.word.lemma, "en", { sensitivity: "base" });
}

function byRecent(a: DoneWord, b: DoneWord): number {
  const diff = new Date(b.doneAt).getTime() - new Date(a.doneAt).getTime();
  if (diff !== 0) return diff;
  return byAlpha(a, b);
}

export function ClearedListPage({ words }: { words: WordItem[] }) {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<DoneSort>("alpha");
  const [doneMap, setDoneMap] = useState<DoneMap>({});
  const [, setProgressMap] = useState<LearnProgressMap>({});

  useEffect(() => {
    setDoneMap(loadDoneMap());
    setProgressMap(loadProgress());
  }, []);

  const doneWords = useMemo(() => {
    const list = words
      .map((word) => ({
        word,
        doneAt: doneMap[word.id]
      }))
      .filter((item): item is DoneWord => Boolean(item.doneAt));

    return list.sort(sortMode === "recent" ? byRecent : byAlpha);
  }, [doneMap, sortMode, words]);

  function handleRestoreToKeep(wordId: string) {
    setDoneMap((current) => {
      const next = unmarkDone(current, wordId);
      saveDoneMap(next);
      return next;
    });

    setProgressMap((current) => {
      if (current[wordId]) return current;
      const { nextProgress } = applyKeep(current, wordId);
      saveProgress(nextProgress);
      return nextProgress;
    });
  }

  return (
    <main className="cleared-shell">
      <header className="cleared-header" aria-label="Cleared list header">
        <button
          type="button"
          className="cleared-back"
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
        <h1>Cleared</h1>
      </header>

      <section className="cleared-toolbar" aria-label="Cleared list controls">
        <label htmlFor="done-sort">並び順</label>
        <select
          id="done-sort"
          className="cleared-select"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as DoneSort)}
        >
          <option value="alpha">アルファベット順</option>
          <option value="recent">最近Clearedした順</option>
        </select>
      </section>

      <section className="cleared-list-wrap" aria-label="Cleared words">
        {doneWords.length === 0 ? (
          <p className="cleared-empty">まだClearedした単語はありません。</p>
        ) : (
          <ul className="cleared-list">
            {doneWords.map((item) => (
              <li key={item.word.id} className="cleared-item">
                <button
                  type="button"
                  className="cleared-restore-button"
                  onClick={() => handleRestoreToKeep(item.word.id)}
                >
                  → to Keep
                </button>
                <p className="cleared-word">{item.word.lemma}</p>
                <p className="cleared-row cleared-definition">{item.word.definition_en}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
