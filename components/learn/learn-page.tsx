"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LearnHeader } from "@/components/learn/learn-header";
import { SwipeCard } from "@/components/learn/swipe-card";
import { WordCardContent } from "@/components/learn/word-card-content";
import { useStudySession } from "@/hooks/use-study-session";
import { WordItem } from "@/lib/types";

const SWIPE_HINT_SEEN_KEY = "ngsl_swipe_hint_seen_v1";

export function LearnPage({ words }: { words: WordItem[] }) {
  const router = useRouter();
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShowSwipeHint(window.localStorage.getItem(SWIPE_HINT_SEEN_KEY) !== "1");
  }, []);

  const {
    currentWord,
    isLoaded,
    isFinished,
    reveal,
    toggleReveal,
    progressStatus,
    rateKeep,
    rateDone,
    canUndo,
    undo
  } = useStudySession(words);

  const hideSwipeHint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SWIPE_HINT_SEEN_KEY, "1");
    }
    setShowSwipeHint(false);
  }, []);

  const handleRateKeep = useCallback(() => {
    if (showSwipeHint) hideSwipeHint();
    rateKeep();
  }, [hideSwipeHint, rateKeep, showSwipeHint]);

  const handleRateDone = useCallback(() => {
    if (showSwipeHint) hideSwipeHint();
    rateDone();
  }, [hideSwipeHint, rateDone, showSwipeHint]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
      return;
    }
    router.back();
  };

  if (!words.length) {
    return (
      <main className="learn-shell">
        <LearnHeader
          onBack={handleBack}
          progress={{ done: 0, total: 0 }}
          canUndo={false}
          onUndo={() => {}}
        />
        <section className="learn-stage" aria-label="No data">
          <article className="learn-placeholder-card">単語データがありません。`/data/ngsl.json` を確認してください。</article>
        </section>
      </main>
    );
  }

  if (!isLoaded) {
    return (
      <main className="learn-shell">
        <LearnHeader onBack={handleBack} progress={progressStatus} canUndo={canUndo} onUndo={undo} />
        <section className="learn-stage" aria-label="Preparing session">
          <article className="learn-placeholder-card">セッションを準備しています...</article>
        </section>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="learn-shell">
        <LearnHeader onBack={handleBack} progress={progressStatus} canUndo={canUndo} onUndo={undo} />
        <section className="learn-stage" aria-label="Session complete">
          <article className="learn-placeholder-card">
            {progressStatus.total === 0
              ? "すべての単語がClearedです。トップからClearedを確認できます。"
              : "このセッションは完了です。Undoで直前カードに戻せます。"}
          </article>
        </section>
      </main>
    );
  }

  if (!currentWord) {
    return (
      <main className="learn-shell">
        <LearnHeader onBack={handleBack} progress={progressStatus} canUndo={canUndo} onUndo={undo} />
        <section className="learn-stage" aria-label="No current card">
          <article className="learn-placeholder-card">表示可能なカードがありません。</article>
        </section>
      </main>
    );
  }

  return (
    <main className="learn-shell">
      <LearnHeader onBack={handleBack} progress={progressStatus} canUndo={canUndo} onUndo={undo} />

      <section className="learn-stage" aria-label="Learn card area">
        <SwipeCard key={currentWord.id} onSwipeLeft={handleRateKeep} onSwipeRight={handleRateDone}>
          <WordCardContent word={currentWord} reveal={reveal} onToggleReveal={toggleReveal} />
        </SwipeCard>
      </section>

      {showSwipeHint ? (
        <p className="learn-once-hint" aria-live="polite">
          Swipe left to keep  •  Swipe right to clear
        </p>
      ) : null}
    </main>
  );
}
