import { PREMIUM_PRODUCTS } from "@cosmoscope/api";

const subscriptionProducts = Object.values(PREMIUM_PRODUCTS).filter((product) => product.kind === "subscription");
const unlockProducts = Object.values(PREMIUM_PRODUCTS).filter((product) => product.kind === "one_time_unlock");

const onboardingScreens = [
  {
    index: "01",
    title: "Birth place",
    body: "Start with the exact place. The better the location data, the cleaner the reading."
  },
  {
    index: "02",
    title: "Birth date",
    body: "One clear date gives the chart its timing without turning setup into a chore."
  },
  {
    index: "03",
    title: "Birth time",
    body: "Use the exact time if you know it. If you do not, CosmoScope will still give you a usable read."
  },
  {
    index: "04",
    title: "Reveal",
    body: "Core placements first. Today’s Brief next. Deeper guidance opens when you want more context."
  }
];

const modulePreview = [
  {
    eyebrow: "Your Sun",
    headline: "Aries",
    summary: "Impatient, bright, singular.",
    detail: "This is the part of you that decides what matters and where your effort naturally goes first.",
    locked: false
  },
  {
    eyebrow: "Your Moon",
    headline: "Scorpio",
    summary: "Private, exacting, magnetic.",
    detail: "This is the emotional pattern underneath the surface: what stings, what settles you, and what stays hidden until it matters.",
    locked: true
  },
  {
    eyebrow: "Your Rising",
    headline: "Virgo",
    summary: "Composed, observant, selective.",
    detail: "This is the version of you other people meet first and the tone you set before much is said.",
    locked: true
  }
];

const thresholdBenefits = [
  "Longer daily guidance with stronger context",
  "Weekly, monthly, and yearly structure mapped to your chart",
  "Focused one-time reads when a relationship or decision needs more depth"
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

export default function HomePage() {
  return (
    <main className="page-shell front-door-shell">
      <section className="opening-band front-door-opening">
        <div className="opening-copy fade-up">
          <p className="timestamp">Personal astrological guidance from exact birth data.</p>
          <h1 className="hero-title">
            <span>Understand today&apos;s astrological weather.</span>
            <span>Know how to move through it.</span>
          </h1>
          <p className="lede">
            CosmoScope connects your natal chart with the current sky to show what deserves your attention today - and
            how to meet it with greater clarity, confidence, and calm.
          </p>
          <div className="action-row">
            <a className="button-primary" href="/app">
              Build my CosmoScope
            </a>
            <a className="button-secondary" href="/app">
              Log in
            </a>
            <a className="button-secondary" href="#threshold">
              Explore Cosmic Pass
            </a>
          </div>
        </div>

        <aside className="opening-aside fade-up delay-2">
          <p className="caption">What opens first</p>
          <h2 className="aside-title">Core placements. Today&apos;s Brief. Then deeper structure.</h2>
          <p className="aside-copy">
            Start with the essentials, then move into longer guidance when the day needs more context.
          </p>
          <ul className="calibration-list">
            <li>
              <span>Core placements</span>
              <strong>Sun, Moon, and Rising translated into direct language</strong>
            </li>
            <li>
              <span>Today&apos;s Brief</span>
              <strong>A free reading built from the current astrological climate</strong>
            </li>
            <li>
              <span>Deeper work</span>
              <strong>Weekly, monthly, yearly, and one-time reads when the moment needs more depth</strong>
            </li>
          </ul>
        </aside>
      </section>

      <div className="rule" />

      <section className="ritual-band" id="ritual">
        <div className="section-copy">
          <p className="caption">How it opens</p>
          <h2 className="section-title">One question at a time, so the setup feels human.</h2>
          <p className="section-body">
            Exact place, date, and time do more for the reading than extra ornament ever will. The setup should feel
            measured, calm, and easy to finish.
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
          <h2 className="section-title">Useful guidance before you go deeper.</h2>
          <p className="section-body">
            Today’s Brief gives you the central theme, what to notice, and one practical move before anything else asks
            for your attention.
          </p>

          <article className="daily-reading">
            <p className="reading-kicker">Today</p>
            <h3 className="reading-headline">The day asks for cleaner timing, not louder effort.</h3>
            <p className="reading-body">
              Your attention is sharper than usual, but impatience is louder too. <strong>Your move:</strong> finish
              what matters before the day teaches you through avoidable noise.
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
            <h2 className="threshold-title">Go deeper when the lighter read is no longer enough.</h2>
            <p className="threshold-body">
              Cosmic Pass keeps the free daily rhythm intact, then opens the longer reads that benefit from repetition,
              pattern, and more emotional range. One-time unlocks stay available for moments that are too specific for
              a broad daily read to handle cleanly.
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
          <p className="caption">Why it matters</p>
          <h2 className="section-title">A chart is only useful if it becomes guidance you can act on.</h2>
          <p className="section-body">
            CosmoScope turns the pattern into language you can use, so the reading becomes preparation rather than
            performance.
          </p>
        </div>
      </section>
    </main>
  );
}
