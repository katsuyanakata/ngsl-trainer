"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyKeep,
  buildSessionQueue,
  loadDoneMap,
  loadProgress,
  markDone,
  restoreDoneState,
  saveDoneMap,
  saveProgress,
  UndoAction,
  undoLastAction
} from "@/lib/progress-store";
import { DoneMap, LearnProgressMap, RevealState, WordItem } from "@/lib/types";

export function useStudySession(words: WordItem[]) {
  const [progress, setProgress] = useState<LearnProgressMap>({});
  const [doneMap, setDoneMap] = useState<DoneMap>({});
  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [reveal, setReveal] = useState<RevealState>(0);
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const progressRef = useRef<LearnProgressMap>({});
  const doneMapRef = useRef<DoneMap>({});

  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);
  const currentWordId = queue[queueIndex];
  const currentWord = currentWordId ? wordsById.get(currentWordId) : undefined;

  const total = queue.length;
  const done = Math.min(queueIndex, total);
  const isFinished = isLoaded && queueIndex >= total;

  useEffect(() => {
    const loadedProgress = loadProgress();
    const loadedDoneMap = loadDoneMap();

    progressRef.current = loadedProgress;
    doneMapRef.current = loadedDoneMap;

    setProgress(loadedProgress);
    setDoneMap(loadedDoneMap);

    const initialQueue = buildSessionQueue(words, loadedProgress, loadedDoneMap);
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
    setReveal((state) => (state < 3 ? ((state + 1) as RevealState) : 3));
  }, []);

  const rateCurrent = useCallback(
    (actionType: "keep" | "done") => {
      if (!currentWordId || queueIndex >= total) return;

      const prevProgress = progressRef.current[currentWordId] ?? null;
      const prevDoneAt = doneMapRef.current[currentWordId] ?? null;

      if (actionType === "keep") {
        const { nextProgress } = applyKeep(progressRef.current, currentWordId);
        progressRef.current = nextProgress;
        setProgress(nextProgress);
        saveProgress(nextProgress);
      } else {
        const nextDoneMap = markDone(doneMapRef.current, currentWordId);
        doneMapRef.current = nextDoneMap;
        setDoneMap(nextDoneMap);
        saveDoneMap(nextDoneMap);
      }

      setLastAction({
        wordId: currentWordId,
        prevProgress,
        prevDoneAt,
        prevQueueIndex: queueIndex,
        actionType
      });

      setQueueIndex((index) => Math.min(index + 1, total));
      setReveal(0);
    },
    [currentWordId, queueIndex, total]
  );

  const undo = useCallback(() => {
    if (!lastAction) return;

    if (lastAction.actionType === "keep") {
      const restoredProgress = undoLastAction(progressRef.current, lastAction);
      progressRef.current = restoredProgress;
      setProgress(restoredProgress);
      saveProgress(restoredProgress);
    }

    if (lastAction.actionType === "done") {
      const restoredDoneMap = restoreDoneState(doneMapRef.current, lastAction);
      doneMapRef.current = restoredDoneMap;
      setDoneMap(restoredDoneMap);
      saveDoneMap(restoredDoneMap);
    }

    setQueueIndex(lastAction.prevQueueIndex);
    setReveal(0);
    setLastAction(null);
  }, [lastAction]);

  const rateKeep = useCallback(() => {
    rateCurrent("keep");
  }, [rateCurrent]);

  const rateDone = useCallback(() => {
    rateCurrent("done");
  }, [rateCurrent]);

  return {
    currentWord,
    isLoaded,
    isFinished,
    reveal,
    toggleReveal,
    progress,
    doneMap,
    progressStatus: {
      done,
      total
    },
    rateKeep,
    rateDone,
    canUndo: Boolean(lastAction),
    undo
  };
}
