type LearnHeaderProps = {
  onBack: () => void;
  progress: {
    done: number;
    total: number;
  };
  canUndo: boolean;
  onUndo: () => void;
};

function toRatio(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, done / total));
}

export function LearnHeader({ onBack, progress, canUndo, onUndo }: LearnHeaderProps) {
  const ratio = toRatio(progress.done, progress.total);

  return (
    <header className="learn-header" aria-label="Learn session controls">
      <button type="button" className="learn-header-link" onClick={onBack} aria-label="Back">
        <span aria-hidden="true">←</span> Back
      </button>

      <div
        className="learn-progress-track"
        role="progressbar"
        aria-label={`${progress.done} of ${progress.total} cleared`}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-valuenow={progress.done}
      >
        <span className="learn-progress-bar">
          <span className="learn-progress-fill" style={{ transform: `scaleX(${ratio})` }} />
        </span>
        <span className="learn-progress-count" aria-hidden="true">
          {progress.done}/{progress.total}
        </span>
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
