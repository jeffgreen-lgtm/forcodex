"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CosmoScope route error", error);
  }, [error]);

  return (
    <main className="production-state">
      <section className="production-state__card" aria-labelledby="error-title">
        <p className="production-state__eyebrow">A temporary interruption</p>
        <h1 id="error-title">Your CosmoScope did not open cleanly.</h1>
        <p>
          Your information is still safe. Try the page again, or return home and reopen your reading.
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
  );
}
