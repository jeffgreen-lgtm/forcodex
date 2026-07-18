"use client";

import "./globals.css";
import "./rc4-production.css";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="production-state">
          <section className="production-state__card" aria-labelledby="global-error-title">
            <p className="production-state__eyebrow">CosmoScope paused</p>
            <h1 id="global-error-title">Something interrupted the experience.</h1>
            <p>
              Your account information remains protected. Try once more, or return to the home page and reopen CosmoScope.
            </p>
            <div className="production-state__actions">
              <button
                className="production-state__button production-state__button--primary"
                type="button"
                onClick={reset}
              >
                Try again
              </button>
              <a className="production-state__button production-state__button--secondary" href="/">
                Return home
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
