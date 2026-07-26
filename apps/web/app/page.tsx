import Image from "next/image";

const appHref = "/app";

const methodSteps = [
  {
    label: "Birth chart",
    text: "Your exact place, date, and time give CosmoScope the pattern it reads from."
  },
  {
    label: "Current sky",
    text: "Today’s movement is compared against that pattern."
  },
  {
    label: "Your move",
    text: "The result is one useful theme, moments to notice, and a practical next step."
  }
];

export default function HomePage() {
  return (
    <main className="cosmic-landing cosmic-landing--reconstructed">
      <section className="cosmic-opening" aria-labelledby="cosmic-hero-title">
        <header className="cosmic-nav" aria-label="CosmoScope">
          <a className="cosmic-brand" href="/" aria-label="CosmoScope home">
            <span aria-hidden="true" />
            CosmoScope
          </a>
          <nav aria-label="Primary navigation">
            <a href="#brief">Today</a>
            <a href="#method">Method</a>
            <a href={appHref}>Log in</a>
            <a className="cosmic-nav-cta" href={appHref}>
              Begin
            </a>
          </nav>
        </header>

        <div className="cosmic-opening-grid">
          <div className="cosmic-hero-visual" aria-hidden="true">
            <Image
              className="cosmic-asset cosmic-asset--deep-space"
              src="/art/backgrounds/deep-space.jpg"
              alt=""
              fill
              unoptimized
              priority
              sizes="(max-width: 980px) 100vw, 62vw"
            />
            <Image
              className="cosmic-asset cosmic-asset--eclipse"
              src="/art/celestial/eclipse-gold.png"
              alt=""
              width={864}
              height={552}
              unoptimized
              priority
              sizes="(max-width: 980px) 88vw, 56vw"
            />
            <Image
              className="cosmic-asset cosmic-asset--horizon"
              src="/art/backgrounds/hero-earth-sunrise.jpg"
              alt=""
              width={1200}
              height={690}
              unoptimized
              priority
              sizes="(max-width: 980px) 100vw, 62vw"
            />
            <Image
              className="cosmic-asset cosmic-asset--orbit"
              src="/art/celestial/orbit-ring.png"
              alt=""
              width={344}
              height={416}
              unoptimized
              sizes="(max-width: 980px) 70vw, 28vw"
            />
          </div>

          <div className="cosmic-hero-copy">
            <p className="cosmic-eyebrow">Today is a story</p>
            <h1 id="cosmic-hero-title">
              Know the day.
              <span>Own your life.</span>
            </h1>
            <p>
              CosmoScope reads your birth chart against the sky right now and gives you one clear theme,
              one thing to notice, and one practical move.
            </p>
            <div className="cosmic-hero-actions">
              <a className="cosmic-button cosmic-button-primary" href={appHref}>
                Begin your experience
              </a>
              <span>Free first brief · No credit card · About 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cosmic-demonstration" id="brief" aria-labelledby="cosmic-brief-title">
        <div className="cosmic-demo-context">
          <p className="cosmic-eyebrow">Today’s Brief</p>
          <h2>A useful reading before the day gets loud.</h2>
          <p>
            The first answer comes before the explanation. You see the theme, what to notice, and the move
            that helps you meet the day with more composure.
          </p>
        </div>

        <article className="cosmic-brief-card">
          <div className="cosmic-brief-copy">
            <div className="cosmic-brief-header">
              <p className="cosmic-eyebrow">Today</p>
              <time>06:42</time>
            </div>
            <p className="cosmic-brief-label">Today’s Theme</p>
            <h3 id="cosmic-brief-title">Protect the pace that keeps you clear.</h3>
            <p>
              The day may reward discernment more than speed. Notice what creates urgency without creating value.
            </p>
            <div className="cosmic-brief-rule" aria-hidden="true" />
            <p className="cosmic-brief-label">Notice When</p>
            <p>Someone asks for an answer before the question has become clear.</p>
            <div className="cosmic-brief-rule" aria-hidden="true" />
            <p className="cosmic-brief-label">Your Move</p>
            <p className="cosmic-brief-move">Finish what matters before avoidable noise chooses your pace.</p>
          </div>
          <div className="cosmic-brief-orbit" aria-hidden="true">
            <Image
              src="/art/celestial/orbit-grid.png"
              alt=""
              width={384}
              height={416}
              unoptimized
              sizes="(max-width: 980px) 70vw, 28vw"
            />
            <Image
              src="/art/celestial/golden-star.png"
              alt=""
              width={360}
              height={416}
              unoptimized
              sizes="(max-width: 980px) 42vw, 16vw"
            />
          </div>
        </article>
      </section>

      <section className="cosmic-method" id="method" aria-labelledby="cosmic-method-title">
        <div className="cosmic-method-heading">
          <p className="cosmic-eyebrow">Preparation over prediction</p>
          <h2 id="cosmic-method-title">Astrology is the engine. Daily clarity is the product.</h2>
        </div>
        <ol>
          {methodSteps.map((step, index) => (
            <li key={step.label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step.label}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cosmic-final" aria-labelledby="cosmic-final-title">
        <div className="cosmic-final-orbit" aria-hidden="true" />
        <p className="cosmic-eyebrow">Your first brief is free</p>
        <h2 id="cosmic-final-title">
          Your day.
          <span>Understood.</span>
        </h2>
        <p>Personal guidance from your chart and today’s sky.</p>
        <a className="cosmic-button cosmic-button-primary" href={appHref}>
          Get Today’s Brief
        </a>
      </section>

      <footer className="cosmic-footer">
        <span>CosmoScope</span>
        <span>Preparation over prediction.</span>
        <a href={appHref}>Log in</a>
      </footer>
    </main>
  );
}
