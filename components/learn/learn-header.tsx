type LearnHeaderProps = {
  onBack: () => void;
  progress: {
    done: number;
    total: number;
  };
  canUndo: boolean;
  onUndo: () => void;
};

function buildDots(done: number, total: number): boolean[] {
  const dotCount = total > 0 ? Math.min(5, total) : 5;
  const filled = total > 0 ? Math.round((done / total) * dotCount) : 0;
  return Array.from({ length: dotCount }, (_, index) => index < filled);
}

export function LearnHeader({ onBack, progress, canUndo, onUndo }: LearnHeaderProps) {
  const dots = buildDots(progress.done, progress.total);

  return (
    <header className="learn-header" aria-label="Learn session controls">
      <button type="button" className="learn-header-link" onClick={onBack} aria-label="Back">
        <span aria-hidden="true">←</span> Back
      </button>

      <div className="learn-progress-dots" aria-label={`${progress.done} of ${progress.total} completed`}>
        {dots.map((isActive, index) => (
          <span key={index} className={`learn-dot${isActive ? " is-active" : ""}`} />
        ))}
      </div>

      <button
        type="button"
        className="learn-header-button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo previous rating"
      >
        Undo
      </button>
    </header>
  );
}
