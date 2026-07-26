const adminSections = [
  {
    eyebrow: "Accounts",
    title: "User management",
    body: "Review, support, and remove beta accounts once the protected admin endpoint exists.",
    status: "Endpoint required"
  },
  {
    eyebrow: "Editorial",
    title: "Prompt and canon controls",
    body: "Manage reading prompts, governing documents, and approved phrase libraries from one internal surface.",
    status: "Planned"
  },
  {
    eyebrow: "Readings",
    title: "Data provenance",
    body: "Inspect the birth record, chart source, transit source, cache key, and forecast version behind a visible reading.",
    status: "Scaffolded"
  },
  {
    eyebrow: "Operations",
    title: "Beta health",
    body: "Track signup friction, geocode failures, chart-generation failures, tip flow health, and fallback usage.",
    status: "Planned"
  }
];

const adminLinks = [
  { href: "/studio", label: "Open Creator Studio" },
  { href: "/app", label: "Open live app" },
  { href: "/", label: "Return home" }
];

export const metadata = {
  title: "Admin | CosmoScope",
  description: "Internal CosmoScope administration console.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <main className="live-shell admin-shell">
      <header className="demo-header admin-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
        <nav aria-label="Internal admin links">
          {adminLinks.map((link) => (
            <a key={link.href} className="button-secondary" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="admin-hero" aria-labelledby="admin-title">
        <p className="timestamp">Private operations.</p>
        <h1 id="admin-title">The control room for beta integrity.</h1>
        <p>
          This page is the internal home for account support, prompt governance, reading provenance, and launch
          operations. Sensitive actions stay disabled until protected admin endpoints are added.
        </p>
      </section>

      <section className="admin-grid" aria-label="Admin management areas">
        {adminSections.map((section) => (
          <article key={section.title} className="live-editorial-panel admin-card">
            <div>
              <p className="reading-kicker">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
            <span className="admin-status">{section.status}</span>
          </article>
        ))}
      </section>

      <section className="admin-note live-editorial-panel" aria-labelledby="admin-boundaries-title">
        <p className="reading-kicker">Boundaries</p>
        <h2 id="admin-boundaries-title">No unsafe controls yet.</h2>
        <p>
          Account deletion, prompt publishing, and entitlement changes need server-side authorization before they belong
          here. Until then, this console documents the management surface without exposing dangerous client-only actions.
        </p>
      </section>
    </main>
  );
}
