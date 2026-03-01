import { RevealState, WordItem } from "@/lib/types";

type WordCardContentProps = {
  word: WordItem;
  reveal: RevealState;
  onToggleReveal: () => void;
  disabled?: boolean;
};

export function WordCardContent({ word, reveal, onToggleReveal, disabled = false }: WordCardContentProps) {
  return (
    <button
      type="button"
      className="word-card-content"
      onClick={onToggleReveal}
      disabled={disabled}
      aria-label="Toggle card details"
    >
      <h1 className="word-card-lemma">{word.lemma}</h1>

      <div className="word-card-reveal" aria-live="polite">
        {reveal === 1 ? (
          <>
            <p className="word-card-pos">{word.pos.join(" / ")}</p>
            <p className="word-card-definition">{word.definition_en}</p>
          </>
        ) : null}

        {reveal === 2 ? <p className="word-card-example">{word.example_en}</p> : null}
      </div>
    </button>
  );
}
