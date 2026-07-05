const feedbackQuestions = [
  "How personal did your reading feel?",
  "Did it show you a clear path forward?",
  "What line stood out most?",
  "What felt generic, confusing, or too much?",
  "Would you come back tomorrow for another reading?",
  "Would monthly or yearly guidance feel worth paying for?",
  "What would make CosmoScope feel more magical, useful, or premium?"
];

export const metadata = {
  title: "Beta Feedback | CosmoScope",
  description: "Private beta feedback for CosmoScope."
};

export default function BetaFeedbackPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(245, 197, 107, 0.18), transparent 34rem), #080711",
        color: "#fff8ea",
        padding: "48px 20px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          border: "1px solid rgba(245, 197, 107, 0.26)",
          borderRadius: "28px",
          padding: "32px",
          background: "rgba(13, 11, 27, 0.78)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.38)"
        }}
      >
        <p
          style={{
            color: "#f5c56b",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "0.76rem",
            marginBottom: "18px"
          }}
        >
          CosmoScope private beta
        </p>

        <h1
          style={{
            fontSize: "clamp(2.1rem, 7vw, 4.6rem)",
            lineHeight: 0.95,
            margin: "0 0 20px"
          }}
        >
          Help shape the path forward.
        </h1>

        <p
          style={{
            color: "rgba(255, 248, 234, 0.78)",
            fontSize: "1.06rem",
            lineHeight: 1.7,
            marginBottom: "24px"
          }}
        >
          CosmoScope reads the stars, then shows you the path toward your most aligned self.
          This beta is here to test whether the reading actually feels personal, useful, and worth returning to.
        </p>

        <div
          style={{
            borderRadius: "22px",
            padding: "22px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            marginBottom: "24px"
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "14px" }}>Feedback questions</h2>
          <ol style={{ paddingLeft: "22px", lineHeight: 1.75, color: "rgba(255, 248, 234, 0.86)" }}>
            {feedbackQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </div>

        <p
          style={{
            color: "rgba(255, 248, 234, 0.72)",
            lineHeight: 1.7,
            marginBottom: "26px"
          }}
        >
          Send Jeff your honest reaction after trying your Daily and Weekly readings. The best feedback is specific:
          what felt magical, what felt generic, and what made you want to keep going.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <a
            href="/app"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              padding: "13px 18px",
              background: "#f5c56b",
              color: "#111",
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            Open CosmoScope
          </a>

          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "999px",
              padding: "13px 18px",
              border: "1px solid rgba(245, 197, 107, 0.38)",
              color: "#fff8ea",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
