"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyRating,
  buildSessionQueue,
  loadProgress,
  saveProgress,
  UndoAction,
  undoLastAction
} from "@/lib/progress-store";
import { LearnProgressMap, Rating, RevealState, WordItem } from "@/lib/types";

export function useStudySession(words: WordItem[]) {
  const [progress, setProgress] = useState<LearnProgressMap>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [reveal, setReveal] = useState<RevealState>(0);
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const progressRef = useRef<LearnProgressMap>({});

  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);
  const currentWordId = queue[queueIndex];
  const currentWord = currentWordId ? wordsById.get(currentWordId) : undefined;

  const total = queue.length;
  const done = Math.min(queueIndex, total);
  const isFinished = isLoaded && total > 0 && queueIndex >= total;

  useEffect(() => {
    const loadedProgress = loadProgress();
    progressRef.current = loadedProgress;
    setProgress(loadedProgress);

    const initialQueue = buildSessionQueue(words, loadedProgress);
    setQueue(initialQueue);
    setQueueIndex(0);
    setReveal(0);
    setLastAction(null);
    setIsLoaded(true);
  }, [words]);

  useEffect(() => {
    setReveal(0);
  }, [currentWordId]);

  const toggleReveal = useCallback(() => {
    setReveal((state) => ((state + 1) % 3) as RevealState);
  }, []);

  const rateCurrent = useCallback(
    (rating: Rating) => {
      if (!currentWordId || queueIndex >= total) return;

      const { nextProgress, prevProgress } = applyRating(progressRef.current, currentWordId, rating);
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      saveProgress(nextProgress);

      setLastAction({
        wordId: currentWordId,
        prevProgress,
        prevQueueIndex: queueIndex
      });

      setQueueIndex((index) => Math.min(index + 1, total));
      setReveal(0);
    },
    [currentWordId, queueIndex, total]
  );

  const undo = useCallback(() => {
    if (!lastAction) return;

    const restored = undoLastAction(progressRef.current, lastAction);
    progressRef.current = restored;
    setProgress(restored);
    saveProgress(restored);

    setQueueIndex(lastAction.prevQueueIndex);
    setReveal(0);
    setLastAction(null);
  }, [lastAction]);

  const rateAgain = useCallback(() => {
    rateCurrent("again");
  }, [rateCurrent]);

  const rateGood = useCallback(() => {
    rateCurrent("good");
  }, [rateCurrent]);

  return {
    currentWord,
    isLoaded,
    isFinished,
    reveal,
    toggleReveal,
    progress,
    progressStatus: {
      done,
      total
    },
    rateAgain,
    rateGood,
    canUndo: Boolean(lastAction),
    undo
  };
}
