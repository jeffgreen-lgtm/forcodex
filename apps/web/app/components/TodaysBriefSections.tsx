import { Fragment } from "react";

export type BriefPlacementCard = {
  content: string;
  headline: string;
  kicker: string;
};

type TodaysBriefPanelProps = {
  disclaimer?: string;
  effectiveLabel: string;
  learnYourSky?: string;
  move: string;
  headline: string;
  noticeWhen: string[];
  title?: string;
  whyTodayFeelsThisWay: string[];
};

type UnderstandWhySectionProps = {
  copy: string;
  placements: BriefPlacementCard[];
  title?: string;
};

function renderTextWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={`bold-${index}`}>{boldMatch[1]}</strong>;
    }

    return <Fragment key={`text-${index}`}>{part}</Fragment>;
  });
}

export function TodaysBriefPanel({
  disclaimer,
  effectiveLabel,
  learnYourSky,
  move,
  headline,
  noticeWhen,
  title = "Today’s Brief",
  whyTodayFeelsThisWay
}: TodaysBriefPanelProps) {
  return (
    <section className="live-editorial-panel live-editorial-panel-wide">
      <div className="live-forecast-head">
        <div className="live-forecast-title-block">
          <h2>{title}</h2>
        </div>
        <p>{effectiveLabel}</p>
      </div>

      {disclaimer ? <p className="live-inline-metadata live-demo-disclaimer">{disclaimer}</p> : null}

      <div className="live-forecast-copy">
        <section className="live-daily-brief">
          <article className="live-daily-theme-card">
            <p className="reading-kicker">Today&apos;s Headline</p>
            <h3>{renderTextWithBold(headline)}</h3>
          </article>

          {noticeWhen.length ? (
            <article className="live-daily-priority-card">
              <p className="reading-kicker">Notice When</p>
              <ul className="live-watch-list" aria-label="Notice When">
                {noticeWhen.map((item, index) => (
                  <li key={`notice-${index}`}>
                    <span className="live-watch-icon" aria-hidden="true">
                      •
                    </span>
                    <span>{renderTextWithBold(item)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}

          <article className="live-callout-card live-daily-move">
            <p className="reading-kicker">Your Move</p>
            <p>{renderTextWithBold(move)}</p>
          </article>

          <div className="live-why-today">
            <p className="reading-kicker">Why Today Feels This Way</p>
            {whyTodayFeelsThisWay.map((paragraph, index) => (
              <p key={`why-today-${index}`}>{renderTextWithBold(paragraph)}</p>
            ))}
          </div>

          {learnYourSky ? (
            <div className="live-why-today">
              <p className="reading-kicker">Learn Your Sky</p>
              <p>{renderTextWithBold(learnYourSky)}</p>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

export function UnderstandWhySection({
  copy,
  placements,
  title = "See the chart behind the briefing."
}: UnderstandWhySectionProps) {
  return (
    <>
      <section className="live-editorial-panel live-understand-why-panel live-editorial-panel-wide">
        <p className="reading-kicker">Understand why</p>
        <h2>{title}</h2>
        <p className="live-understand-why-copy">{copy}</p>
      </section>

      <section className="live-big-three live-editorial-panel-wide">
        <div className="live-section-label">
          <span />
          <p>Your core placements</p>
          <span />
        </div>
        <div className="live-coordinate-grid">
          {placements.map((item) => (
            <article key={item.kicker} className="live-coordinate-card">
              <p className="reading-kicker">{item.kicker}</p>
              <h2>{item.headline}</h2>
              <p>{item.content}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
