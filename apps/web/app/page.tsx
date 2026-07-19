import {
  EnergyTimeline,
  PremiumButton,
  PremiumCard,
  PremiumSurface,
  SolarHero,
  solarCssVars
} from "./components/premium";

export default function HomePage() {
  return (
    <PremiumSurface className="page-shell front-door-shell" style={solarCssVars}>
      <section className="opening-band front-door-opening" aria-labelledby="cosmoscope-hero-title">
        <SolarHero className="hero-celestial-art" />
        <div className="opening-copy fade-up">
          <p className="timestamp">Your chart. Today&apos;s sky.</p>
          <h1 className="hero-title" id="cosmoscope-hero-title">
            <span>The most beautiful way</span>
            <span>to begin your day.</span>
          </h1>
          <p className="lede">Know where to place your attention before the day begins.</p>
          <div className="action-row">
            <PremiumButton href="/app">
              Get my first Today&apos;s Brief
            </PremiumButton>
            <PremiumButton href="/app" variant="secondary">
              Log in
            </PremiumButton>
          </div>
          <p className="trust-line">Free first brief · No credit card · About 2 minutes</p>
        </div>
      </section>

      <section className="product-demo-band" id="daily-layer" aria-labelledby="product-reveal-title">
        <div className="product-reveal-glow" aria-hidden="true" />
        <div className="section-copy">
          <PremiumCard className="daily-reading product-brief-card">
            <div className="brief-card-header">
              <p className="reading-kicker">Today&apos;s Theme</p>
              <span>06:42</span>
            </div>
            <h2 className="reading-headline" id="product-reveal-title">
              Protect the pace that keeps you clear.
            </h2>
            <p className="reading-body brief-body">
              The day may reward discernment more than speed. Notice what creates urgency without creating value.
            </p>
            <div className="brief-move">
              <p className="reading-kicker">Your Move</p>
              <p>Finish what matters before avoidable noise chooses your pace.</p>
            </div>
            <span className="brief-card-mark" aria-hidden="true" />
          </PremiumCard>
        </div>
      </section>

      <section className="editorial-principle-band" aria-labelledby="preparation-over-prediction">
        <div className="principle-celestial-mark" aria-hidden="true">
          <span />
        </div>
        <div className="section-copy">
          <h2 className="section-title" id="preparation-over-prediction">
            Preparation over prediction.
          </h2>
          <p className="section-body">Astrology is the engine. Daily clarity is the product.</p>
          <EnergyTimeline
            className="principle-list"
            items={["Today's theme", "Pressure points", "Your next best move"]}
          />
          <p className="principle-afterword">Know what deserves your attention before the day decides for you.</p>
        </div>
      </section>

      <section className="front-door-final-cta" aria-labelledby="final-invitation-title">
        <div className="invitation-orbit" aria-hidden="true">
          <span />
        </div>
        <div className="final-cta-copy">
          <p className="caption">Your first brief is free</p>
          <h2 className="section-title" id="final-invitation-title">
            <span>Your day.</span>
            <span>Understood.</span>
          </h2>
          <p className="section-body">Personal guidance from your chart and today&apos;s sky.</p>
          <PremiumButton href="/app">
            Get my Today&apos;s Brief
          </PremiumButton>
          <p className="trust-line">Private setup · No credit card required</p>
        </div>
      </section>

      <footer className="front-door-footer">
        <span>CosmoScope</span>
        <span>Preparation over prediction.</span>
        <a href="/app">Log in</a>
      </footer>
    </PremiumSurface>
  );
}
