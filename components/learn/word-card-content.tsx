import { RevealState, WordItem } from "@/lib/types";

type WordCardContentProps = {
  word: WordItem;
  reveal: RevealState;
  onToggleReveal: () => void;
  disabled?: boolean;
};

export function WordCardContent({ word, reveal, onToggleReveal, disabled = false }: WordCardContentProps) {
  const canReveal = !disabled && reveal < 3;

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className="word-card-content"
      onClick={() => {
        if (!canReveal) return;
        onToggleReveal();
      }}
      onKeyDown={(event) => {
        if (!canReveal) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onToggleReveal();
      }}
      aria-label="Toggle card details"
      aria-disabled={disabled}
    >
      <h1 className="word-card-lemma">{word.lemma}</h1>

      <div className="word-card-reveal" aria-live="polite">
        {reveal >= 1 ? (
          <>
            <p className="word-card-label">品詞</p>
            <p className="word-card-pos">{word.pos.join(" / ")}</p>
          </>
        ) : null}

        {reveal >= 2 ? (
          <>
            <p className="word-card-label">意味</p>
            <p className="word-card-definition">{word.definition_en}</p>
          </>
        ) : null}

        {reveal >= 3 ? (
          <>
            <p className="word-card-label">例文</p>
            <p className="word-card-example">{word.example_en}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
