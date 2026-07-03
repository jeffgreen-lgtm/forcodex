import { OUTPUT_RULES, PREMIUM_PRODUCTS } from "@cosmoscope/api";

const subscriptionProducts = Object.values(PREMIUM_PRODUCTS).filter((product) => product.kind === "subscription");
const unlockProducts = Object.values(PREMIUM_PRODUCTS).filter((product) => product.kind === "one_time_unlock");

const ritualSteps = [
  {
    title: "Enter birth details",
    body: "A short, private intake captures the exact data needed for a more credible chart."
  },
  {
    title: "Receive the free layer",
    body: "Big three identity, a crisp chart summary, and the first daily signal establish value immediately."
  },
  {
    title: "Unlock deeper reads",
    body: "Cosmic Pass and focused unlocks open StarScope, LoveScope, forecasts, and long-range guidance."
  }
];

const featureColumns = [
  {
    title: "Free layer",
    items: ["Big three identity", "Chart summary", "Daily signal"]
  },
  {
    title: "Premium layer",
    items: ["StarScope answers", "LoveScope readings", "Monthly and yearly guidance"]
  }
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CosmoScope</p>
          <h1>Your chart, translated clearly.</h1>
          <p className="lede">
            CosmoScope is a premium astrology experience built around emotional clarity, precise timing, and a calm
            editorial interface instead of a gamified credit economy.
          </p>
          <div className="hero-meta">
            <div>
              <span className="meta-label">Current state</span>
              <strong>Live mobile and edge foundation</strong>
            </div>
            <div>
              <span className="meta-label">Output rule</span>
              <strong>
                {OUTPUT_RULES.maxSentences} sentences, no astro-jargon, ends with {OUTPUT_RULES.requiredCta}
              </strong>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-head">
            <span className="panel-kicker">Daily climate</span>
            <strong>Today rewards clarity over urgency.</strong>
          </div>
          <p className="panel-copy">
            The member experience is meant to feel intimate, expensive, and grounded, with the free layer proving
            value before premium surfaces ask for commitment.
          </p>
          <div className="signal-list">
            {ritualSteps.map((step, index) => (
              <div key={step.title} className="signal-row">
                <span className="signal-index">0{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="story-band">
        <div className="story-copy">
          <p className="eyebrow">Member journey</p>
          <h2>A slower, more credible intake than horoscope filler.</h2>
          <p>
            The product is designed around a ritual: a precise birth-data intake, a short moment of anticipation, a
            high-clarity reveal, and then premium reads that feel editorial instead of manipulative.
          </p>
        </div>
        <div className="story-card">
          {featureColumns.map((column) => (
            <div key={column.title} className="story-column">
              <span className="product-kind">{column.title}</span>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section-grid">
        <div className="section-header">
          <p className="eyebrow">Subscriptions</p>
          <h2>Premium access is subscription-led.</h2>
          <p>
            The app is being shaped around a durable entitlement model: subscriptions for ongoing access, one-time
            unlocks for focused premium moments.
          </p>
        </div>
        <div className="product-grid">
          {subscriptionProducts.map((product) => (
            <article key={product.key} className="product-card featured">
              <span className="product-kind">Cosmic Pass</span>
              <h3>{product.title}</h3>
              <p>{product.priceLabel}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid">
        <div className="section-header">
          <p className="eyebrow">Unlocks</p>
          <h2>Selective paid depth for high-intent moments.</h2>
          <p>These one-time unlocks are already wired through the shared catalog and entitlement layer.</p>
        </div>
        <div className="product-grid compact">
          {unlockProducts.map((product) => (
            <article key={product.key} className="product-card">
              <span className="product-kind">One-time</span>
              <h3>{product.title}</h3>
              <p>{product.priceLabel}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="status-band">
        <div>
          <p className="eyebrow">Build status</p>
          <h2>Foundation is live. Brand polish and public deployment are next.</h2>
        </div>
        <div className="status-list">
          <div>
            <span>Mobile</span>
            <strong>Auth, charts, forecasts, premium reads, wallet</strong>
          </div>
          <div>
            <span>Edge API</span>
            <strong>Cloudflare Worker deployed and smoke-tested</strong>
          </div>
          <div>
            <span>Purchases</span>
            <strong>RevenueCat scaffolded, dashboard config pending</strong>
          </div>
        </div>
      </section>

      <section className="closing-note">
        <p className="eyebrow">Current web goal</p>
        <h2>Give the brand a presentable front door while mobile and payments mature behind it.</h2>
        <p>
          This surface is now good enough for visual review, content direction, and design iteration. The next web
          leap is live auth, real member state, and a proper premium conversion flow.
        </p>
      </section>
    </main>
  );
}
