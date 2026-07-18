const briefDetails = [
  ["The climate", "The emotional and practical tone shaping your day."],
  ["The pressure point", "Where the day may ask more patience, honesty, or restraint."],
  ["Your move", "One grounded action that helps you work with the moment."],
];

const trustPoints = [
  "Built from your exact birth date, time, and place",
  "Translated into direct, useful language",
  "Designed for preparation—not prediction",
];

export default function HomePage() {
  return (
    <main className="cosmoscope-home">
      <nav className="cosmoscope-nav" aria-label="Primary navigation">
        <a className="cosmoscope-wordmark" href="/" aria-label="CosmoScope home">
          <span className="wordmark-orbit" aria-hidden="true" />
          CosmoScope
        </a>
        <a className="nav-login" href="/app">Log in</a>
      </nav>

      <section className="cosmoscope-hero">
        <div className="hero-atmosphere" aria-hidden="true">
          <div className="hero-moon" />
          <div className="hero-horizon" />
          <span className="star star-one" />
          <span className="star star-two" />
          <span className="star star-three" />
          <span className="star star-four" />
        </div>

        <div className="hero-content fade-up">
          <p className="hero-eyebrow">Your chart. Today&apos;s sky. One clear way forward.</p>
          <h1>The most beautiful way to begin your day.</h1>
          <p className="hero-lede">
            CosmoScope turns the current astrological climate into personal guidance you can actually use—so you meet the day with more clarity, confidence, and calm.
          </p>
          <div className="hero-actions">
            <a className="hero-primary" href="/app">Build my CosmoScope</a>
            <span className="hero-note">Your first Today&apos;s Brief is free.</span>
          </div>
        </div>

        <div className="hero-proof fade-up delay-2" aria-label="CosmoScope principles">
          {trustPoints.map((point) => <span key={point}>{point}</span>)}
        </div>
      </section>

      <section className="brief-section" id="todays-brief">
        <div className="brief-intro">
          <p className="section-kicker">Today&apos;s Brief</p>
          <h2>Not a horoscope. A personal morning advantage.</h2>
          <p>
            The same sky affects everyone differently. CosmoScope reads today through your natal chart, then translates the strongest signal into a calm, useful plan.
          </p>
        </div>

        <article className="brief-card">
          <div className="brief-card-topline">
            <div>
              <p className="brief-date">Saturday · July 18</p>
              <p className="brief-for">Prepared for Jeff</p>
            </div>
            <span className="brief-sun" aria-hidden="true">☼</span>
          </div>
          <p className="brief-label">Today&apos;s central theme</p>
          <h3>Protect the pace that keeps you clear.</h3>
          <p className="brief-copy">
            The day may reward discernment more than speed. You do not need to answer every demand as it arrives. Notice what creates urgency without creating value, then return your attention to the choice that will still matter tonight.
          </p>
          <div className="brief-move">
            <span>Your move</span>
            <strong>Choose one meaningful priority before the outside world chooses three for you.</strong>
          </div>
        </article>
      </section>

      <section className="translation-section">
        <div className="translation-heading">
          <p className="section-kicker">How it becomes useful</p>
          <h2>Complex astrology, translated into the three things you need today.</h2>
        </div>
        <div className="translation-grid">
          {briefDetails.map(([title, body], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="personal-section">
        <div className="personal-orbit" aria-hidden="true">
          <span className="orbit-core">You</span>
          <span className="orbit-label orbit-sun">Sun</span>
          <span className="orbit-label orbit-moon">Moon</span>
          <span className="orbit-label orbit-rising">Rising</span>
        </div>
        <div className="personal-copy">
          <p className="section-kicker">Personal by design</p>
          <h2>Your guidance begins where generic astrology ends.</h2>
          <p>
            Your Sun, Moon, Rising, houses, and current transits create a pattern that belongs to you. Exact birth data gives CosmoScope the context to explain not only what is active, but where you are most likely to feel it.
          </p>
          <a className="text-link" href="/app">See what today means for me <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="depth-section">
        <div className="depth-copy">
          <p className="section-kicker">Go deeper when you need to</p>
          <h2>A daily ritual first. More context when life asks for it.</h2>
          <p>
            Begin with Today&apos;s Brief. Open weekly, monthly, relationship, and decision-focused guidance only when the moment deserves a wider view.
          </p>
        </div>
        <div className="depth-list" aria-label="Premium guidance options">
          <span>Weekly perspective</span>
          <span>Monthly forecast</span>
          <span>Relationship insight</span>
          <span>Decision support</span>
          <span>Yearly blueprint</span>
        </div>
      </section>

      <section className="final-cta">
        <p className="section-kicker">Meet the day differently</p>
        <h2>Begin with the sky.<br />Move with yourself.</h2>
        <a className="hero-primary" href="/app">Build my CosmoScope</a>
        <p className="final-note">Free to begin. Exact birth time helps, but is not required.</p>
      </section>

      <footer className="cosmoscope-footer">
        <span>CosmoScope</span>
        <span>Preparation over prediction.</span>
      </footer>
    </main>
  );
}
