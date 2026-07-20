import { notFound } from "next/navigation";
import { UnderstandWhySection, TodaysBriefPanel } from "../../components/TodaysBriefSections";

const isProductionPreviewBlocked = process.env.APP_ENV === "production";

const demoPlacements = [
  {
    content:
      "Aquarius Sun describes the part of the chart that values perspective, independence, and enough distance to see the pattern without getting swallowed by the moment.",
    headline: "Aquarius",
    kicker: "Sun sign"
  },
  {
    content:
      "Taurus Moon grounds the emotional layer. In this illustrative example, it points toward steadier pacing, sensory calm, and fewer reactive decisions when the day gets noisy.",
    headline: "Taurus",
    kicker: "Moon sign"
  },
  {
    content:
      "Libra Rising shapes the first impression. It gives the fictional chart a social tone that reads as measured, relational, and aware of how the room is responding.",
    headline: "Libra",
    kicker: "Rising sign"
  }
];

const whyToday = [
  "This illustrative briefing shows how the layout handles a direct opening theme, a screenshot-friendly takeaway, and a calmer explanation section underneath.",
  "The educational layer then steps in to explain how the Sun, Moon, and Rising cards support the top-line message without forcing the user through a wall of text first."
];

export const metadata = {
  title: "CosmoScope Today’s Brief Preview",
  description: "Development-only preview route for the authenticated Today’s Brief layout."
};

export default function TodaysBriefPreviewPage() {
  if (isProductionPreviewBlocked) {
    notFound();
  }

  return (
    <main className="live-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
        <span className="demo-pill">Development-only preview</span>
      </header>

      <section className="live-member fade-up">
        <div className="live-member-head">
          <p className="timestamp">Preview member: Rowan Vale</p>
        </div>

        <div className="live-dashboard-grid">
          <TodaysBriefPanel
            disclaimer="Illustrative demo content — not generated from a real chart."
            effectiveLabel="July 11"
            headline="Clearer pacing helps the day stay readable."
            learnYourSky="In this fictional example, the Rising sign explains first impressions while the daily transit layer changes how quickly interactions heat up."
            move="Save the sharpest sentence for the moment when the conversation is ready for it, then let restraint do some of the work."
            noticeWhen={[
              "A conversation that becomes faster than it becomes clearer.",
              "The urge to tidy the signal before you have finished hearing it.",
              "Trying to solve the whole pattern when the next useful step is much smaller."
            ]}
            whyTodayFeelsThisWay={whyToday}
          />

          <UnderstandWhySection
            copy="These fictional placements show how the educational layer sits beneath the briefing and gives the user a calmer way into the chart."
            placements={demoPlacements}
            title="See how the chart layer supports the briefing."
          />
        </div>
      </section>
    </main>
  );
}
