import { OUTPUT_RULES, PREMIUM_PRODUCTS } from "@cosmoscope/api";

const subscriptionProducts = Object.values(PREMIUM_PRODUCTS).filter((product) => product.kind === "subscription");
const unlockProducts = Object.values(PREMIUM_PRODUCTS).filter((product) => product.kind === "one_time_unlock");

const onboardingScreens = [
  {
    index: "01",
    title: "Birth place",
    body: "One question, one screen, one precise location instead of a long intake form."
  },
  {
    index: "02",
    title: "Birth date",
    body: "A single date screen keeps the ritual moving while the data stays exact."
  },
  {
    index: "03",
    title: "Birth time",
    body: "Known time if you have it. A graceful fallback if you do not."
  },
  {
    index: "04",
    title: "Reveal",
    body: "Big three first, deeper context second, premium only after value is felt."
  }
];

const modulePreview = [
  {
    eyebrow: "Your Sun",
    headline: "Aries",
    summary: "Impatient, bright, singular.",
    detail: "The first read is concise on purpose. Depth arrives only when the user asks for more.",
    locked: false
  },
  {
    eyebrow: "Your Moon",
    headline: "Scorpio",
    summary: "Private, exacting, magnetic.",
    detail: "Expanded emotional patterning opens inside the premium threshold.",
    locked: true
  },
  {
    eyebrow: "Your Rising",
    headline: "Virgo",
    summary: "Composed, observant, selective.",
    detail: "The outer layer stays crisp. The full paragraph waits behind intent.",
    locked: true
  }
];

const thresholdBenefits = [
  "Full daily climate with deeper context",
  "StarScope and LoveScope for high-intent moments",
  "Monthly and yearly guidance without generic filler"
];

const subscriptionNotes: Record<string, string> = {
  monthly_pass: "The full member layer: daily climate, deep reads, and recurring guidance.",
  annual_pass: "The calmest long-view option, with the strongest value for committed members."
};

const unlockNotes: Record<string, string> = {
  lovescope_unlock: "Relationship insight when the question is specific and the stakes feel personal.",
  starscope_unlock: "A focused answer when timing, choice, or tension needs a sharper read.",
  forecast_monthly: "A single month of clearer context without committing to a full membership.",
  yearly_blueprint: "The long-range map for users who want the whole arc, not just the mood."
};

const openingDateLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric"
}).format(new Date());

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="opening-band">
        <div className="opening-copy fade-up">
          <p className="timestamp">
            <time dateTime={new Date().toISOString().slice(0, 10)}>{openingDateLabel}</time> - Exact birth data, no
            generic sun-sign filler.
          </p>
          <h1 className="hero-title">The chart is not the spectacle. You are.</h1>
          <p className="lede">
            CosmoScope turns precise sky math into intimate, legible guidance. Calm enough to trust. Sharp enough to
            change what you do next.
          </p>
          <div className="action-row">
            <a className="button-primary" href="/demo">
              Enter demo experience
            </a>
            <a className="button-primary" href="#daily-layer">
              Preview the free layer
            </a>
            <a className="button-secondary" href="#threshold">
              See Cosmic Pass
            </a>
          </div>
        </div>

        <aside className="opening-aside fade-up delay-2">
          <p className="caption">Calibration</p>
          <h2 className="aside-title">A quieter category position.</h2>
          <p className="aside-copy">
            No doom-scroll feed. No chat gimmicks. No decorative galaxy haze standing in for confidence. Just exact
            inputs, serious typography, and guidance that ends with a concrete next move.
          </p>
          <ul className="calibration-list">
            <li>
              <span>Output</span>
              <strong>
                {OUTPUT_RULES.maxSentences} sentences, no astro-jargon, ends with {OUTPUT_RULES.requiredCta}
              </strong>
            </li>
            <li>
              <span>Free habit</span>
              <strong>Daily reading first, premium deep dives second</strong>
            </li>
            <li>
              <span>Premium stance</span>
              <strong>Threshold, not punishment</strong>
            </li>
          </ul>
        </aside>
      </section>

      <div className="rule" />

      <section className="ritual-band" id="ritual">
        <div className="section-copy">
          <p className="caption">Onboarding ritual</p>
          <h2 className="section-title">One question per screen. More trust, less admin.</h2>
          <p className="section-body">
            The intake should feel like a private ritual, not a medical clipboard. Each answer deepens the sense that
            the user is building something exact.
          </p>
        </div>

        <ol className="ritual-list">
          {onboardingScreens.map((screen) => (
            <li key={screen.index} className="ritual-item">
              <span className="ritual-index">{screen.index}</span>
              <div>
                <strong>{screen.title}</strong>
                <p>{screen.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="rule" />

      <section className="daily-band" id="daily-layer">
        <div className="section-copy">
          <p className="caption">Free daily layer</p>
          <h2 className="section-title">A short reading before any premium ask.</h2>
          <p className="section-body">
            The free experience should already feel useful. Premium is not about more noise; it is about deeper
            pattern recognition when the user wants it.
          </p>

          <article className="daily-reading">
            <p className="reading-kicker">Today</p>
            <h3 className="reading-headline">The mood favors clean decisions over loud ones.</h3>
            <p className="reading-body">
              Your attention is sharper than usual, but so is your impatience. <strong>Your move:</strong> finish the
              important thing before you chase the interesting one.
            </p>
          </article>
        </div>

        <div className="module-stack" aria-label="Big three preview">
          {modulePreview.map((module) => (
            <article key={module.eyebrow} className={`module-preview${module.locked ? " is-locked" : ""}`}>
              <div className="module-topline">
                <p className="module-eyebrow">{module.eyebrow}</p>
                {module.locked ? <span className="lock-label">Threshold</span> : null}
              </div>
              <h3 className="module-headline">{module.headline}</h3>
              <p className="module-summary">{module.summary}</p>
              <p className="module-detail">{module.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="threshold-band" id="threshold">
        <div className="threshold-inner">
          <div className="threshold-copy">
            <p className="caption caption-inverse">Threshold</p>
            <h2 className="threshold-title">Premium should feel like entering a quieter room.</h2>
            <p className="threshold-body">
              Cosmic Pass keeps the free daily ritual intact, then opens the reads that benefit from history, pattern,
              and precision. One-time unlocks stay available for the moments that feel too specific for a generic
              horoscope app to handle well.
            </p>
            <ul className="benefit-list">
              {thresholdBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="threshold-products">
            <div className="product-section">
              <p className="caption caption-inverse">Cosmic Pass</p>
              <div className="product-grid">
                {subscriptionProducts.map((product) => (
                  <article key={product.key} className="product-card product-card-inverse">
                    <div className="product-header">
                      <span className="product-kind">{product.key === "annual_pass" ? "Best value" : "Membership"}</span>
                      <h3>{product.title}</h3>
                    </div>
                    <p className="product-price">{product.priceLabel}</p>
                    <p className="product-note">{subscriptionNotes[product.key] ?? "Premium access across the member layer."}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="product-section">
              <p className="caption caption-inverse">One-time unlocks</p>
              <div className="product-grid product-grid-compact">
                {unlockProducts.map((product) => (
                  <article key={product.key} className="product-card product-card-inverse">
                    <div className="product-header">
                      <span className="product-kind">One-time</span>
                      <h3>{product.title}</h3>
                    </div>
                    <p className="product-price">{product.priceLabel}</p>
                    <p className="product-note">{unlockNotes[product.key] ?? "Focused premium depth for a single moment."}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="rule" />

      <section className="closing-band">
        <div className="section-copy closing-copy">
          <p className="caption">Next up</p>
          <h2 className="section-title">Tonight&apos;s job is to turn the front door into a real product surface.</h2>
          <p className="section-body">
            This redesign establishes the tone, hierarchy, and premium posture. Auth, checkout, and live entitlement
            state are the immediate next layer, not a separate reinvention.
          </p>
        </div>
      </section>
    </main>
  );
}
