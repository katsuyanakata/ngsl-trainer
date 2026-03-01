"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type SwipeCardProps = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  disabled?: boolean;
  children: ReactNode;
};

type SwipeDirection = "left" | "right";

type PointerTracking = {
  pointerId: number;
  startX: number;
  startY: number;
  isHorizontal: boolean;
  moved: boolean;
};

const TAP_SLOP_PX = 5;
const SWIPE_START_PX = 10;
const EXIT_DURATION_MS = 220;

function getThreshold(): number {
  if (typeof window === "undefined") return 90;
  return Math.min(120, window.innerWidth * 0.25);
}

export function SwipeCard({ onSwipeLeft, onSwipeRight, disabled = false, children }: SwipeCardProps) {
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animatingOut, setAnimatingOut] = useState<SwipeDirection | null>(null);
  const [threshold, setThreshold] = useState(90);

  const trackingRef = useRef<PointerTracking | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const blockClickRef = useRef(false);

  useEffect(() => {
    setThreshold(getThreshold());

    function updateThreshold() {
      setThreshold(getThreshold());
    }

    window.addEventListener("resize", updateThreshold);
    return () => {
      window.removeEventListener("resize", updateThreshold);
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  function resetDrag() {
    setDx(0);
    setIsDragging(false);
    trackingRef.current = null;
  }

  function runSwipe(direction: SwipeDirection) {
    if (animatingOut) return;

    blockClickRef.current = true;
    setIsDragging(false);
    setAnimatingOut(direction);
    setDx(direction === "left" ? -Math.max(threshold, 80) * 1.4 : Math.max(threshold, 80) * 1.4);

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }

    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
    }

    exitTimerRef.current = window.setTimeout(() => {
      if (direction === "left") onSwipeLeft();
      else onSwipeRight();

      setAnimatingOut(null);
      setDx(0);
      exitTimerRef.current = null;
    }, EXIT_DURATION_MS);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || animatingOut) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    trackingRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      isHorizontal: false,
      moved: false
    };

    blockClickRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const tracking = trackingRef.current;
    if (!tracking || tracking.pointerId !== event.pointerId || disabled || animatingOut) return;

    const deltaX = event.clientX - tracking.startX;
    const deltaY = event.clientY - tracking.startY;

    if (Math.abs(deltaX) > TAP_SLOP_PX || Math.abs(deltaY) > TAP_SLOP_PX) {
      tracking.moved = true;
      blockClickRef.current = true;
    }

    if (!tracking.isHorizontal && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_START_PX) {
      tracking.isHorizontal = true;
      setIsDragging(true);
    }

    if (tracking.isHorizontal) {
      setDx(deltaX);
    }
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const tracking = trackingRef.current;
    if (!tracking || tracking.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = event.clientX - tracking.startX;
    const deltaY = event.clientY - tracking.startY;

    trackingRef.current = null;

    if (tracking.isHorizontal) {
      setIsDragging(false);

      if (deltaX <= -threshold) {
        runSwipe("left");
        return;
      }

      if (deltaX >= threshold) {
        runSwipe("right");
        return;
      }

      setDx(0);
      return;
    }

    if (Math.abs(deltaX) > TAP_SLOP_PX || Math.abs(deltaY) > TAP_SLOP_PX || tracking.moved) {
      blockClickRef.current = true;
      setDx(0);
      setIsDragging(false);
      return;
    }

    blockClickRef.current = false;
    setDx(0);
    setIsDragging(false);
  }

  function handlePointerCancel() {
    blockClickRef.current = true;
    resetDrag();
  }

  const transform = animatingOut
    ? animatingOut === "left"
      ? "translate3d(-120%, 0, 0) rotate(-7deg)"
      : "translate3d(120%, 0, 0) rotate(7deg)"
    : `translate3d(${dx}px, 0, 0) rotate(${dx * 0.05}deg)`;

  const cueOpacity = Math.min(1, Math.abs(dx) / Math.max(threshold, 1));
  const cueLabel = dx < 0 ? "KEEP" : dx > 0 ? "DONE" : "";
  const cueToneClass = dx < 0 ? "is-keep" : dx > 0 ? "is-done" : "";

  return (
    <div className="swipe-card-wrap">
      <span className={`swipe-cue swipe-cue-center ${cueToneClass}`} style={{ opacity: cueLabel ? cueOpacity : 0 }} aria-hidden="true">
        {cueLabel || "KEEP"}
      </span>

      <div
        className={`swipe-card${isDragging ? " is-dragging" : ""}${animatingOut ? " is-animating-out" : ""}${
          disabled ? " is-disabled" : ""
        }`}
        style={{
          transform,
          transition: isDragging ? "none" : `transform ${EXIT_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        onClickCapture={(event) => {
          if (!blockClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          blockClickRef.current = false;
        }}
      >
        {children}
      </div>
    </div>
  );
}
