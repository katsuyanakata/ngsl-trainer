"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <main className="app-shell">
      <div className="home-layout">
        <section className="hero-wrap reveal" aria-label="Top page">
          <article className="paper-card hero-card">
            <div className="hero-content">
              <h1>
                2,800 words is
                <br />
                all we need.
              </h1>
              <p className="hero-sub">たった2,800語で、日常英語の90%以上をカバーできる。</p>
              <div className="hero-actions">
                <Link href="/study" className="outline-button" aria-label="Start NGSL study">
                  START
                </Link>
              </div>
              <div className="hero-links">
                <Link href="/done" className="inline-link" aria-label="Open done words list">
                  Done一覧
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
