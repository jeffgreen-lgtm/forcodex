"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductDefinition } from "@cosmoscope/api";

type DemoExperienceProps = {
  products: ProductDefinition[];
};

type Step = "opening" | "place" | "date" | "time" | "loading" | "reveal" | "home" | "threshold";

const loadingMessages = ["Locating natal placements", "Structuring the big three", "Preparing the daily climate"];

const revealModules = [
  {
    eyebrow: "Your Sun",
    headline: "Aries",
    summary: "Impatient, bright, singular.",
    body:
      "You move best when the room stops asking you to dilute your momentum. **Your move:** choose one decisive action and let it teach everyone else where the line is."
  },
  {
    eyebrow: "Your Moon",
    headline: "Scorpio",
    summary: "Private, exacting, magnetic.",
    body:
      "Your emotional life runs deeper than your surface lets on, which makes honesty feel expensive and necessary. **Your move:** name the feeling before you turn it into strategy."
  },
  {
    eyebrow: "Your Rising",
    headline: "Virgo",
    summary: "Composed, observant, selective.",
    body:
      "People read your restraint as calm, but it is really precision under pressure. **Your move:** improve the system without making yourself responsible for everyone using it correctly."
  }
];

const deepModules = [
  {
    eyebrow: "LoveScope",
    headline: "Your closeness needs cleaner terms.",
    body:
      "The pattern is not distance; it is unspoken expectation building pressure in a quiet place. **Your move:** ask for the specific thing instead of testing whether they notice."
  },
  {
    eyebrow: "StarScope",
    headline: "The decision is smaller than the meaning you gave it.",
    body:
      "You are treating one choice like it has to explain the whole future, and that is slowing the obvious next step. **Your move:** take the reversible action first."
  },
  {
    eyebrow: "Monthly Forecast",
    headline: "This month rewards careful subtraction.",
    body:
      "The win is not adding more ambition; it is removing what keeps scattering your attention. **Your move:** choose the one obligation that no longer earns its space."
  }
];

function DemoText({ text }: { text: string }) {
  const [before, after] = text.split("**Your move:**");

  if (!after) {
    return <>{text}</>;
  }

  return (
    <>
      {before}
      <strong>Your move:</strong>
      {after}
    </>
  );
}

export function DemoExperience({ products }: DemoExperienceProps) {
  const [step, setStep] = useState<Step>("opening");
  const [place, setPlace] = useState("Chicago, Illinois");
  const [birthDate, setBirthDate] = useState("1990-10-24");
  const [birthTime, setBirthTime] = useState("09:07");
  const [unknownTime, setUnknownTime] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [expandedModule, setExpandedModule] = useState("Your Sun");

  const subscriptions = useMemo(() => products.filter((product) => product.kind === "subscription"), [products]);
  const unlocks = useMemo(() => products.filter((product) => product.kind === "one_time_unlock"), [products]);

  useEffect(() => {
    if (step !== "loading") {
      return;
    }

    setLoadingIndex(0);

    const interval = window.setInterval(() => {
      setLoadingIndex((current) => Math.min(current + 1, loadingMessages.length - 1));
    }, 720);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setStep("reveal");
    }, 2600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [step]);

  const startLoading = () => {
    setStep("loading");
  };

  return (
    <main className="demo-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
        <span className="demo-pill">Friend preview - payments disabled</span>
      </header>

      {step === "opening" ? (
        <section className="demo-screen demo-opening fade-up">
          <p className="timestamp">Demo mode - all premium reads unlocked</p>
          <h1 className="demo-hero">Let&apos;s build your cosmic blueprint.</h1>
          <p className="demo-body">
            This preview walks through the product feel, daily reading, reveal, LoveScope, StarScope, and premium
            threshold without charging a card.
          </p>
          <div className="action-row">
            <button className="button-primary" type="button" onClick={() => setStep("place")}>
              Begin demo
            </button>
            <button className="button-secondary" type="button" onClick={() => setStep("home")}>
              Skip to member home
            </button>
          </div>
        </section>
      ) : null}

      {step === "place" ? (
        <section className="demo-screen demo-form fade-up">
          <p className="caption">Birth place</p>
          <h1 className="demo-question">Where did your timeline start?</h1>
          <label className="demo-field">
            <span>Location</span>
            <input value={place} onChange={(event) => setPlace(event.target.value)} />
          </label>
          <ul className="demo-results" aria-label="Suggested locations">
            <li>Chicago, Illinois, United States</li>
            <li>Chicago Heights, Illinois, United States</li>
            <li>West Chicago, Illinois, United States</li>
          </ul>
          <div className="demo-footer-actions">
            <button className="button-secondary" type="button" onClick={() => setStep("opening")}>
              Back
            </button>
            <button className="button-primary" type="button" onClick={() => setStep("date")} disabled={!place.trim()}>
              Continue
            </button>
          </div>
        </section>
      ) : null}

      {step === "date" ? (
        <section className="demo-screen demo-form fade-up">
          <p className="caption">Birth date</p>
          <h1 className="demo-question">What was the exact date?</h1>
          <label className="demo-field">
            <span>Date</span>
            <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          </label>
          <p className="demo-help">The live app will validate future dates and cache the final chart permanently.</p>
          <div className="demo-footer-actions">
            <button className="button-secondary" type="button" onClick={() => setStep("place")}>
              Back
            </button>
            <button className="button-primary" type="button" onClick={() => setStep("time")}>
              Continue
            </button>
          </div>
        </section>
      ) : null}

      {step === "time" ? (
        <section className="demo-screen demo-form fade-up">
          <p className="caption">Birth time</p>
          <h1 className="demo-question">And the exact time?</h1>
          {!unknownTime ? (
            <label className="demo-field">
              <span>Time</span>
              <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
            </label>
          ) : (
            <p className="demo-solar-note">We will calculate a solar chart instead, so the flow never gets stuck.</p>
          )}
          <label className="demo-toggle">
            <input
              checked={unknownTime}
              type="checkbox"
              onChange={(event) => setUnknownTime(event.target.checked)}
            />
            I do not know my birth time
          </label>
          <div className="demo-footer-actions">
            <button className="button-secondary" type="button" onClick={() => setStep("date")}>
              Back
            </button>
            <button className="button-primary" type="button" onClick={startLoading}>
              Generate preview
            </button>
          </div>
        </section>
      ) : null}

      {step === "loading" ? (
        <section className="demo-screen demo-loading fade-up" aria-live="polite">
          <p className="caption">Resolution</p>
          <h1 className="demo-loading-text">{loadingMessages[loadingIndex]}</h1>
          <div className="demo-progress" aria-hidden="true">
            {loadingMessages.map((message, index) => (
              <span key={message} className={index <= loadingIndex ? "is-active" : ""} />
            ))}
          </div>
        </section>
      ) : null}

      {step === "reveal" ? (
        <section className="demo-screen demo-reveal fade-up">
          <div className="demo-section-head">
            <p className="caption">Big three reveal</p>
            <h1 className="demo-question">The first layer is intentionally brief.</h1>
            <p className="demo-body">Tap a placement to expand it. Premium depth arrives through intent, not clutter.</p>
          </div>
          <div className="demo-module-list">
            {revealModules.map((module) => (
              <button
                key={module.eyebrow}
                className="demo-insight-button"
                type="button"
                onClick={() => setExpandedModule(module.eyebrow)}
                aria-expanded={expandedModule === module.eyebrow}
              >
                <span>{module.eyebrow}</span>
                <strong>{module.headline}</strong>
                <em>{module.summary}</em>
                {expandedModule === module.eyebrow ? (
                  <p>
                    <DemoText text={module.body} />
                  </p>
                ) : null}
              </button>
            ))}
          </div>
          <div className="demo-footer-actions">
            <button className="button-secondary" type="button" onClick={() => setStep("time")}>
              Back
            </button>
            <button className="button-primary" type="button" onClick={() => setStep("home")}>
              Enter member home
            </button>
          </div>
        </section>
      ) : null}

      {step === "home" ? (
        <section className="demo-screen demo-home fade-up">
          <div className="demo-section-head">
            <p className="caption">Member home</p>
            <h1 className="demo-question">Today rewards clean decisions over loud ones.</h1>
            <p className="demo-body">
              Your attention is sharper than usual, but so is your impatience. <strong>Your move:</strong> finish the
              important thing before you chase the interesting one.
            </p>
          </div>

          <div className="demo-deep-grid">
            {deepModules.map((module) => (
              <article key={module.eyebrow} className="demo-deep-module">
                <p className="module-eyebrow">{module.eyebrow}</p>
                <h2>{module.headline}</h2>
                <p>
                  <DemoText text={module.body} />
                </p>
              </article>
            ))}
          </div>

          <div className="demo-footer-actions">
            <button className="button-secondary" type="button" onClick={() => setStep("reveal")}>
              Back to reveal
            </button>
            <button className="button-primary" type="button" onClick={() => setStep("threshold")}>
              Preview premium threshold
            </button>
          </div>
        </section>
      ) : null}

      {step === "threshold" ? (
        <section className="demo-screen demo-threshold fade-up">
          <div className="demo-section-head">
            <p className="caption caption-inverse">Threshold</p>
            <h1 className="demo-question">This is where payment will enter later.</h1>
            <p className="demo-body">
              In this friend preview, every module is unlocked and checkout is intentionally disabled. The final web
              build will attach these exact products to Stripe.
            </p>
          </div>

          <div className="demo-product-grid">
            {subscriptions.concat(unlocks).map((product) => (
              <article key={product.key} className="demo-product-card">
                <p className="product-kind">{product.kind === "subscription" ? "Cosmic Pass" : "One-time unlock"}</p>
                <h2>{product.title}</h2>
                <p>{product.priceLabel}</p>
                <button className="button-secondary button-on-dark" disabled type="button">
                  Checkout disabled for preview
                </button>
              </article>
            ))}
          </div>

          <div className="demo-footer-actions">
            <button className="button-secondary button-on-dark" type="button" onClick={() => setStep("home")}>
              Return home
            </button>
            <a className="button-primary button-on-light" href="/">
              Back to front door
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
