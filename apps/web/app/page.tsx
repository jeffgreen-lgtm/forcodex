import { OUTPUT_RULES, PREMIUM_PRODUCTS } from "@cosmoscope/api";

export const runtime = "edge";

export default function HomePage() {
  return (
    <main style={{ margin: "0 auto", maxWidth: 960, padding: "72px 24px 96px" }}>
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 24,
          padding: 32,
          background: "rgba(9, 10, 13, 0.68)",
          backdropFilter: "blur(12px)"
        }}
      >
        <p style={{ color: "var(--gold)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          CosmoScope Phase 1
        </p>
        <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", lineHeight: 1.02, margin: "0 0 16px" }}>
          Premium astrology without the arcade economy.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.7, maxWidth: 720 }}>
          The web surface now shares the same premium product catalog and AI output rules as the mobile and edge
          layers. This placeholder page is the Phase 1 checkpoint before live auth, paywalls, and cached forecast
          delivery are wired.
        </p>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Premium products</h2>
          <ul style={{ display: "grid", gap: 12, listStyle: "none", margin: 0, padding: 0 }}>
            {Object.values(PREMIUM_PRODUCTS).map((product) => (
              <li
                key={product.key}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 18,
                  padding: "16px 18px",
                  background: "rgba(255, 255, 255, 0.02)"
                }}
              >
                <strong>{product.title}</strong>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>{product.priceLabel}</div>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>AI output rules</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>
            {OUTPUT_RULES.maxSentences} sentences max. No astro-jargon. Every answer ends with{" "}
            <strong>{OUTPUT_RULES.requiredCta}</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}
