import "./rc2-polish.css";
import "./rc3-conversion.css";

const signupHref = "/app?mode=signup&source=landing";

const trustPoints = [
  { icon: "lock", title: "Private by design", body: "Your birth data stays connected to your private account." },
  { icon: "compass", title: "Precise & personal", body: "Built from your exact birth data, not a generic sun-sign horoscope." },
  { icon: "spark", title: "Useful immediately", body: "Your first Today’s Brief is waiting at the end of setup." }
];

const advantagePoints = [
  { icon: "sun", title: "Start with direction", body: "See the day’s theme and the energies shaping your decisions." },
  { icon: "moon", title: "Act with confidence", body: "Understand the pressure points and where your best moves are." },
  { icon: "star", title: "Stay aligned", body: "Make choices that fit your life, not just the moment." }
];

const setupSteps = [
  { index: "01", title: "Tell us who you are", body: "Add your name and private account details." },
  { index: "02", title: "Add your birth details", body: "Your date, time, and place create the chart behind every reading." },
  { index: "03", title: "Open today’s guidance", body: "CosmoScope calculates your chart and takes you directly to your first Today’s Brief." }
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
            <a className="nav-cta" href={signupHref}>Get my first brief</a>
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
          <p className="hero-lede">CosmoScope turns the current astrological climate into personal guidance you can actually use—so you meet the day with more clarity, confidence, and calm.</p>
          <a className="primary-cta" href={signupHref}><Symbol name="sun" />Get my first Today&apos;s Brief</a>
          <div className="hero-reassurance" aria-label="Signup reassurance">
            <span>Free first brief</span><span aria-hidden="true">•</span><span>No credit card</span><span aria-hidden="true">•</span><span>About 2 minutes</span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="CosmoScope principles">
        {trustPoints.map((point) => (
          <article key={point.title}><Symbol name={point.icon} /><div><h2>{point.title}</h2><p>{point.body}</p></div></article>
        ))}
      </section>

      <section className="activation-section" aria-labelledby="activation-title">
        <div className="activation-heading">
          <p className="section-kicker">From curiosity to clarity</p>
          <h2 id="activation-title">Your first useful answer is three simple steps away.</h2>
          <p>No quiz. No vague personality test. Just the birth details needed to calculate your chart accurately.</p>
        </div>
        <div className="activation-steps">
          {setupSteps.map((step) => (
            <article key={step.index}><span>{step.index}</span><h3>{step.title}</h3><p>{step.body}</p></article>
          ))}
        </div>
        <a className="activation-link" href={signupHref}>Start my private setup <span aria-hidden="true">→</span></a>
      </section>

      <section className="advantage-section" id="todays-brief">
        <article className="brief-card">
          <div className="brief-card-topline"><div><p className="brief-date">Saturday · July 18</p><p className="brief-for">Prepared for Jeff</p></div><Symbol name="sun" /></div>
          <div className="brief-divider" />
          <p className="brief-label">Today&apos;s theme</p>
          <h2>Protect the pace that keeps you clear.</h2>
          <p className="brief-copy">The day may reward discernment more than speed. You do not need to answer every demand as it arrives. Notice what creates urgency without creating value, then return your attention to the choice that will still matter tonight.</p>
          <div className="brief-divider" />
          <div className="brief-move"><span>Your move</span><strong>Choose one meaningful priority before the outside world chooses three for you.</strong></div>
        </article>

        <div className="advantage-copy">
          <p className="section-kicker">The value you receive first</p>
          <h2>Clarity before complexity.</h2>
          <p className="advantage-intro">Your first screen is not a chart full of symbols. It is a readable, personal brief that tells you what matters today and how to move through it.</p>
          <div className="advantage-list">
            {advantagePoints.map((point) => (
              <article key={point.title}><div className="advantage-icon"><Symbol name={point.icon} /></div><div><h3>{point.title}</h3><p>{point.body}</p></div></article>
            ))}
          </div>
          <a className="text-link" href={signupHref}>Open my first brief <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-orbit" aria-hidden="true"><span className="final-orbit-dot dot-a" /><span className="final-orbit-dot dot-b" /><span className="final-orbit-dot dot-c" /><span className="final-orbit-dot dot-d" /></div>
        <div className="final-star"><Symbol name="star" /></div>
        <p className="section-kicker">Your first brief is free</p>
        <h2>Your day. Understood.</h2>
        <p>Give CosmoScope the details that make your chart yours.<br />We&apos;ll turn them into guidance you can use today.</p>
        <a className="primary-cta" href={signupHref}><Symbol name="sun" />Get my Today&apos;s Brief</a>
        <p className="final-note"><span>✓ Private setup</span><span>•</span><span>No credit card required</span><span>•</span><span>Useful on day one</span></p>
      </section>

      <footer className="cosmoscope-footer"><span>CosmoScope</span><span>Preparation over prediction.</span></footer>
    </main>
  );
}
