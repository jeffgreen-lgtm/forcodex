export default function NotFound() {
  return (
    <main className="production-state">
      <section className="production-state__card" aria-labelledby="not-found-title">
        <p className="production-state__eyebrow">Off course</p>
        <h1 id="not-found-title">This path is not in your sky.</h1>
        <p>
          The page may have moved, or the address may be incomplete. Return home or open your CosmoScope to keep going.
        </p>
        <div className="production-state__actions">
          <a className="production-state__button production-state__button--primary" href="/">
            Return home
          </a>
          <a className="production-state__button production-state__button--secondary" href="/app">
            Open CosmoScope
          </a>
        </div>
      </section>
    </main>
  );
}
