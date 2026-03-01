"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadDoneMap } from "@/lib/progress-store";
import { DoneMap, WordItem } from "@/lib/types";

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

export function DoneListPage({ words }: { words: WordItem[] }) {
  const router = useRouter();
  const [sortMode, setSortMode] = useState<DoneSort>("alpha");
  const [doneMap, setDoneMap] = useState<DoneMap>({});

  useEffect(() => {
    setDoneMap(loadDoneMap());
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

  return (
    <main className="done-shell">
      <header className="done-header" aria-label="Done list header">
        <button
          type="button"
          className="done-back"
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
        <h1>Done一覧</h1>
      </header>

      <section className="done-toolbar" aria-label="Done list controls">
        <label htmlFor="done-sort">並び順</label>
        <select
          id="done-sort"
          className="done-select"
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as DoneSort)}
        >
          <option value="alpha">アルファベット順</option>
          <option value="recent">最近Doneした順</option>
        </select>
      </section>

      <section className="done-list-wrap" aria-label="Done words">
        {doneWords.length === 0 ? (
          <p className="done-empty">まだDoneした単語はありません。</p>
        ) : (
          <ul className="done-list">
            {doneWords.map((item) => (
              <li key={item.word.id} className="done-item">
                <p className="done-word">{item.word.lemma}</p>
                <p className="done-row">
                  <span className="done-label">品詞</span>
                  <span>{item.word.pos.join(" / ")}</span>
                </p>
                <p className="done-row done-definition">{item.word.definition_en}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
