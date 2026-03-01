"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyKeep,
  loadDoneMap,
  loadProgress,
  markDone,
  restoreDoneState,
  unmarkDone,
  saveDoneMap,
  saveProgress,
  UndoAction,
  undoLastAction
} from "@/lib/progress-store";
import { DoneMap, LearnProgressMap, RevealState, WordItem } from "@/lib/types";

export function useStudySession(words: WordItem[]) {
  const [progress, setProgress] = useState<LearnProgressMap>({});
  const [doneMap, setDoneMap] = useState<DoneMap>({});
  const [currentWordId, setCurrentWordId] = useState<string | null>(null);
  const [reveal, setReveal] = useState<RevealState>(0);
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const progressRef = useRef<LearnProgressMap>({});
  const doneMapRef = useRef<DoneMap>({});

  const wordsById = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);
  const wordIds = useMemo(() => words.map((word) => word.id), [words]);
  const currentWord = currentWordId ? wordsById.get(currentWordId) : undefined;

  const pickRandomWordId = useCallback(
    (doneSource: DoneMap = doneMapRef.current): string | null => {
      if (!wordIds.length) return null;
      const activeWordIds = wordIds.filter((wordId) => !doneSource[wordId]);
      if (!activeWordIds.length) return null;
      const randomIndex = Math.floor(Math.random() * activeWordIds.length);
      return activeWordIds[randomIndex] ?? null;
    },
    [wordIds]
  );

  const total = words.length;
  const done = useMemo(() => {
    if (!words.length) return 0;
    let doneCount = 0;
    for (const word of words) {
      if (doneMap[word.id]) doneCount += 1;
    }
    return doneCount;
  }, [doneMap, words]);

  useEffect(() => {
    const loadedProgress = loadProgress();
    const loadedDoneMap = loadDoneMap();

    progressRef.current = loadedProgress;
    doneMapRef.current = loadedDoneMap;

    setProgress(loadedProgress);
    setDoneMap(loadedDoneMap);
    setCurrentWordId(pickRandomWordId(loadedDoneMap));
    setReveal(0);
    setLastAction(null);
    setIsLoaded(true);
  }, [pickRandomWordId]);

  useEffect(() => {
    if (!isLoaded || currentWordId || !wordIds.length) return;
    setCurrentWordId(pickRandomWordId());
  }, [currentWordId, isLoaded, pickRandomWordId, wordIds.length]);

  useEffect(() => {
    setReveal(0);
  }, [currentWordId]);

  const toggleReveal = useCallback(() => {
    setReveal((state) => (state < 2 ? ((state + 1) as RevealState) : 2));
  }, []);

  const rateCurrent = useCallback(
    (actionType: "keep" | "done") => {
      if (!currentWordId) return;

      const prevProgress = progressRef.current[currentWordId] ?? null;
      const prevDoneAt = doneMapRef.current[currentWordId] ?? null;

      let nextDoneMap = doneMapRef.current;

      if (actionType === "keep") {
        const { nextProgress } = applyKeep(progressRef.current, currentWordId);
        progressRef.current = nextProgress;
        setProgress(nextProgress);
        saveProgress(nextProgress);

        nextDoneMap = unmarkDone(doneMapRef.current, currentWordId);
        doneMapRef.current = nextDoneMap;
        setDoneMap(nextDoneMap);
        saveDoneMap(nextDoneMap);
      } else {
        nextDoneMap = markDone(doneMapRef.current, currentWordId);
        doneMapRef.current = nextDoneMap;
        setDoneMap(nextDoneMap);
        saveDoneMap(nextDoneMap);
      }

      setLastAction({
        wordId: currentWordId,
        prevProgress,
        prevDoneAt,
        actionType
      });

      setCurrentWordId(pickRandomWordId(nextDoneMap));
      setReveal(0);
    },
    [currentWordId, pickRandomWordId]
  );

  const undo = useCallback(() => {
    if (!lastAction) return;

    if (lastAction.actionType === "keep") {
      const restoredProgress = undoLastAction(progressRef.current, lastAction);
      progressRef.current = restoredProgress;
      setProgress(restoredProgress);
      saveProgress(restoredProgress);
    }

    const restoredDoneMap = restoreDoneState(doneMapRef.current, lastAction);
    doneMapRef.current = restoredDoneMap;
    setDoneMap(restoredDoneMap);
    saveDoneMap(restoredDoneMap);

    setCurrentWordId(lastAction.wordId);
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
