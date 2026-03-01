import { useEffect, useRef, useState } from "react";
import { RevealState, WordItem } from "@/lib/types";

type WordCardContentProps = {
  word: WordItem;
  reveal: RevealState;
  onToggleReveal: () => void;
  disabled?: boolean;
};

export function WordCardContent({ word, reveal, onToggleReveal, disabled = false }: WordCardContentProps) {
  const canReveal = !disabled && reveal < 2;
  const [showSwipeNudge, setShowSwipeNudge] = useState(false);
  const nudgeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (reveal >= 2) return;
    setShowSwipeNudge(false);
  }, [reveal]);

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current === null) return;
      window.clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  function triggerSwipeNudge() {
    setShowSwipeNudge(true);

    if (nudgeTimerRef.current !== null) {
      window.clearTimeout(nudgeTimerRef.current);
    }

    nudgeTimerRef.current = window.setTimeout(() => {
      setShowSwipeNudge(false);
      nudgeTimerRef.current = null;
    }, 900);
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className="word-card-content"
      onClick={() => {
        if (canReveal) {
          onToggleReveal();
          return;
        }

        if (reveal >= 2) {
          triggerSwipeNudge();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();

        if (canReveal) {
          onToggleReveal();
          return;
        }

        if (reveal >= 2) {
          triggerSwipeNudge();
        }
      }}
      aria-label="Toggle card details"
      aria-disabled={disabled}
    >
      <h1 className="word-card-lemma">{word.lemma}</h1>

      <div className="word-card-reveal" aria-live="polite">
        {reveal >= 1 ? (
          <>
            <p className="word-card-label">意味</p>
            <p className="word-card-definition">{word.definition_en}</p>
          </>
        ) : null}

        {reveal >= 2 ? (
          <>
            <p className="word-card-label">例文</p>
            <p className="word-card-example">{word.example_en}</p>
            {showSwipeNudge ? (
              <p className="word-swipe-nudge" aria-hidden="true">
                <span> ←  SWIPE  →</span>
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
