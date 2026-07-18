const trustPoints = [
  {
    icon: "lock",
    title: "Private by design",
    body: "Your data stays yours. Always."
  },
  {
    icon: "compass",
    title: "Precise & personal",
    body: "Built from your exact birth data, not generic horoscopes."
  },
  {
    icon: "spark",
    title: "For preparation",
    body: "Not prediction. Guidance for better decisions."
  }
];

const advantagePoints = [
  {
    icon: "sun",
    title: "Start with direction",
    body: "See the day’s theme and the energies shaping your decisions."
  },
  {
    icon: "moon",
    title: "Act with confidence",
    body: "Understand the pressure points and where your best moves are."
  },
  {
    icon: "star",
    title: "Stay aligned",
    body: "Make choices that fit your life, not just the moment."
  }
];

function Symbol({ name }: { name: string }) {
  return <span className={`symbol symbol-${name}`} aria-hidden="true" />;
}

export default function HomePage() {
  return (
    <main className="cosmoscope-home">
      <section className="hero-shell">
        <nav className="cosmoscope-nav" aria-label="Primary navigation">
          <a className="cosmoscope-wordmark" href="/" aria-label="CosmoScope home">
            <span className="wordmark-orbit" aria-hidden="true"><span /></span>
            <span>CosmoScope</span>
          </a>
          <div className="nav-actions">
            <a className="nav-login" href="/app">Log in</a>
            <a className="nav-cta" href="/app">Build my CosmoScope</a>
          </div>
        </nav>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit"><span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" /></div>
          <div className="hero-moon"><span className="moon-light" /><span className="moon-shadow" /></div>
          <span className="hero-star hero-star-one" />
          <span className="hero-star hero-star-two" />
          <span className="hero-star hero-star-three" />
          <span className="hero-star hero-star-four" />
          <div className="dawn-glow" />
          <div className="dawn-sun" />
          <div className="mountain mountain-back" />
          <div className="mountain mountain-mid" />
          <div className="mountain mountain-front" />
        </div>

        <div className="hero-copy">
          <p className="hero-eyebrow">Your chart. Today&apos;s sky.</p>
          <h1>The most beautiful way to begin your day.</h1>
          <p className="hero-lede">
            CosmoScope turns the current astrological climate into personal guidance you can actually use—so you meet the day with more clarity, confidence, and calm.
          </p>
          <a className="primary-cta" href="/app"><Symbol name="sun" />Build my CosmoScope</a>
          <p className="hero-note">Your first Today&apos;s Brief is free. <span aria-hidden="true">✦</span></p>
        </div>
      </section>

      <section className="trust-strip" aria-label="CosmoScope principles">
        {trustPoints.map((point) => (
          <article key={point.title}>
            <Symbol name={point.icon} />
            <div>
              <h2>{point.title}</h2>
              <p>{point.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="advantage-section" id="todays-brief">
        <article className="brief-card">
          <div className="brief-card-topline">
            <div>
              <p className="brief-date">Saturday · July 18</p>
              <p className="brief-for">Prepared for Jeff</p>
            </div>
            <Symbol name="sun" />
          </div>
          <div className="brief-divider" />
          <p className="brief-label">Today&apos;s theme</p>
          <h2>Protect the pace that keeps you clear.</h2>
          <p className="brief-copy">
            The day may reward discernment more than speed. You do not need to answer every demand as it arrives. Notice what creates urgency without creating value, then return your attention to the choice that will still matter tonight.
          </p>
          <div className="brief-divider" />
          <div className="brief-move">
            <span>Your move</span>
            <strong>Choose one meaningful priority before the outside world chooses three for you.</strong>
          </div>
        </article>

        <div className="advantage-copy">
          <p className="section-kicker">Your morning advantage</p>
          <h2>Clarity changes everything.</h2>
          <div className="advantage-list">
            {advantagePoints.map((point) => (
              <article key={point.title}>
                <div className="advantage-icon"><Symbol name={point.icon} /></div>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.body}</p>
                </div>
              </article>
            ))}
          </div>
          <a className="text-link" href="/app">See how it works <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-orbit" aria-hidden="true">
          <span className="final-orbit-dot dot-a" />
          <span className="final-orbit-dot dot-b" />
          <span className="final-orbit-dot dot-c" />
          <span className="final-orbit-dot dot-d" />
        </div>
        <div className="final-star"><Symbol name="star" /></div>
        <h2>Your day. Understood.</h2>
        <p>Beautiful guidance. Practical insight.<br />All personalized just for you.</p>
        <a className="primary-cta" href="/app"><Symbol name="sun" />Build my CosmoScope</a>
        <p className="final-note"><span>✓ Free Today&apos;s Brief</span><span>•</span><span>No credit card required</span></p>
      </section>

      <footer className="cosmoscope-footer">
        <span>CosmoScope</span>
        <span>Preparation over prediction.</span>
      </footer>
    </main>
  );
}
