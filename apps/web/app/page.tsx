import Image from "next/image";

export default function HomePage() {
  return (
    <main className="solar-landing">
      <header className="solar-landing-header" aria-label="CosmoScope">
        <a className="solar-brand" href="/" aria-label="CosmoScope home">
          CosmoScope
        </a>
        <nav className="solar-nav" aria-label="Primary navigation">
          <a href="/app">Sign in</a>
          <a className="solar-nav-cta" href="/app">
            Begin
          </a>
        </nav>
      </header>

      <section className="solar-hero-section" aria-labelledby="solar-hero-title">
        <div className="solar-hero-copy">
          <p className="solar-eyebrow">Your chart. Today&apos;s sky.</p>
          <h1 id="solar-hero-title">The most beautiful way to begin your day.</h1>
          <p className="solar-hero-lede">Know where to place your attention before the day begins.</p>
          <div className="solar-action-row">
            <a className="solar-button solar-button-primary" href="/app">
              Get my first Today&apos;s Brief
            </a>
          </div>
        </div>

        <div className="solar-hero-art" aria-hidden="true">
          <Image
            className="solar-eclipse-art solar-eclipse-desktop"
            src="/art/eclipse-desktop.png"
            alt=""
            width={1200}
            height={900}
            priority
            unoptimized
          />
          <Image
            className="solar-eclipse-art solar-eclipse-mobile"
            src="/art/eclipse-mobile.png"
            alt=""
            width={900}
            height={1100}
            priority
            unoptimized
          />
        </div>
      </section>

      <section className="solar-positioning" id="preparation" aria-labelledby="solar-positioning-title">
        <p className="solar-eyebrow">Preparation over prediction</p>
        <h2 id="solar-positioning-title">Preparation over prediction.</h2>
        <p>
          CosmoScope uses astrology as the engine, but the product is daily clarity: what deserves your attention,
          where friction may appear, and how to move through it.
        </p>
      </section>

      <section className="solar-reading-section" id="todays-brief" aria-labelledby="solar-reading-title">
        <article className="solar-reading-paper">
          <p className="solar-eyebrow">Today</p>

          <div className="solar-reading-row">
            <p className="solar-reading-label">Theme</p>
            <div>
              <h2 id="solar-reading-title">
                Protect the pace
                <span>that keeps you clear.</span>
              </h2>
              <p>
                The day may reward discernment more than speed. Notice what creates urgency without creating value.
              </p>
            </div>
          </div>

          <div className="solar-reading-rule" aria-hidden="true" />

          <div className="solar-reading-row">
            <p className="solar-reading-label">Pressure</p>
            <p>
              Urgency may arrive dressed as importance. Before you respond, separate what is truly time-sensitive from
              what is simply loud.
            </p>
          </div>

          <div className="solar-reading-rule" aria-hidden="true" />

          <div className="solar-reading-row">
            <p className="solar-reading-label">Your Move</p>
            <p>Finish what matters before avoidable noise chooses your pace.</p>
          </div>
        </article>
      </section>

      <section className="solar-final-section" aria-labelledby="solar-final-title">
        <h2 id="solar-final-title">
          Your day.
          <span>Understood.</span>
        </h2>
        <a className="solar-button solar-button-primary" href="/app">
          Begin
        </a>
      </section>
    </main>
  );
}
