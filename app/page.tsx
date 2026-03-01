"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const HERO_TARGET_COUNT = 2800;
const HERO_COUNT_DURATION_MS = 1400;

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

export default function HomePage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [heroCount, setHeroCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setHeroCount(HERO_TARGET_COUNT);
      return;
    }

    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / HERO_COUNT_DURATION_MS);
      const eased = easeOutCubic(progress);
      setHeroCount(Math.round(HERO_TARGET_COUNT * eased));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  const formattedHeroCount = useMemo(() => {
    return new Intl.NumberFormat("en-US").format(heroCount);
  }, [heroCount]);

  return (
    <main className="app-shell">
      <div className="home-layout">
        <section className="hero-wrap reveal" aria-label="Top page">
          <article className="paper-card hero-card">
            <div className="hero-content">
              <h1>
                {formattedHeroCount} words is
                <br />
                all we need.
              </h1>
              <p className="hero-sub">英語の9割は、2,800語でできている。</p>
              <div className="hero-actions">
                <Link href="/study" className="outline-button" aria-label="Start NGSL study">
                  START
                </Link>
              </div>
              <div className="hero-links">
                <Link href="/cleared" className="inline-link" aria-label="Open cleared words list">
                  CLEARED
                </Link>
                <Link href="/keep" className="inline-link" aria-label="Open keep words list">
                  KEEP
                </Link>
                <button
                  type="button"
                  className="inline-link"
                  aria-label="What is NGSL?"
                  onClick={() => setIsAboutOpen(true)}
                >
                  NGSLとは？
                </button>
              </div>
            </div>
          </article>
        </section>
      </div>

      {isAboutOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="About NGSL">
          <article className="modal-panel">
            <header className="modal-header">
              <h2>NGSLとは？</h2>
              <button
                type="button"
                className="close-button"
                onClick={() => setIsAboutOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </header>
            <div className="carousel-body">
              <div className="detail-block">
                <p>
                  NGSL（New General Service List）は、現代英語で頻繁に使われる語彙をまとめた基礎語彙リストです。
                </p>
                <p>
                  このアプリでは、単語の想起と自己評価を短いサイクルで繰り返し、最小構成で語彙定着を狙います。
                </p>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
