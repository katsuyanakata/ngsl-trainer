"use client";

import { useRouter } from "next/navigation";
import { LearnHeader } from "@/components/learn/learn-header";
import { SwipeCard } from "@/components/learn/swipe-card";
import { SwipeHint } from "@/components/learn/swipe-hint";
import { WordCardContent } from "@/components/learn/word-card-content";
import { useStudySession } from "@/hooks/use-study-session";
import { WordItem } from "@/lib/types";

export function LearnPage({ words }: { words: WordItem[] }) {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length <= 1) {
      router.push("/");
      return;
    }
    router.back();
  };
  const {
    currentWord,
    isLoaded,
    isFinished,
    reveal,
    toggleReveal,
    progressStatus,
    rateAgain,
    rateGood,
    canUndo,
    undo
  } = useStudySession(words);

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
        <SwipeHint />
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
        <SwipeHint />
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="learn-shell">
        <LearnHeader onBack={handleBack} progress={progressStatus} canUndo={canUndo} onUndo={undo} />
        <section className="learn-stage" aria-label="Session complete">
          <article className="learn-placeholder-card">このセッションは完了です。Undoで直前カードに戻せます。</article>
        </section>
        <SwipeHint />
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
        <SwipeHint />
      </main>
    );
  }

  return (
    <main className="learn-shell">
      <LearnHeader onBack={handleBack} progress={progressStatus} canUndo={canUndo} onUndo={undo} />

      <section className="learn-stage" aria-label="Learn card area">
        <SwipeCard key={currentWord.id} onSwipeLeft={rateAgain} onSwipeRight={rateGood}>
          <WordCardContent word={currentWord} reveal={reveal} onToggleReveal={toggleReveal} />
        </SwipeCard>
      </section>

      <SwipeHint />
    </main>
  );
}
