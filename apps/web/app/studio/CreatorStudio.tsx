"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  API_PATHS,
  type StudioAudience,
  type StudioReadingResult,
  type StudioReadingType
} from "@cosmoscope/api/contracts";
import { resolveCosmoScopeApiBaseUrl } from "../lib/apiBaseUrl";

const readingTypes: Array<{ label: string; value: StudioReadingType }> = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "LoveScope", value: "lovescope" },
  { label: "StarScope", value: "starscope" },
  { label: "Ad copy", value: "ad_copy" },
  { label: "Landing page copy", value: "landing_page_copy" },
  { label: "Social post", value: "social_post" }
];

const audiences: Array<{ label: string; value: StudioAudience }> = [
  { label: "Personal", value: "personal" },
  { label: "Dating", value: "dating" },
  { label: "Career", value: "career" },
  { label: "Travel", value: "travel" },
  { label: "Pitch meeting", value: "pitch_meeting" },
  { label: "Advertising", value: "advertising" },
  { label: "LGBTQ audience", value: "lgbtq_audience" },
  { label: "Premium subscriber", value: "premium_subscriber" }
];

async function requestStudio(body: Record<string, unknown>) {
  const response = await fetch(`${resolveCosmoScopeApiBaseUrl()}${API_PATHS.studioRead}`, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json"
    },
    method: "POST"
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | StudioReadingResult | null;
  if (!response.ok) {
    throw new Error((payload as { message?: string } | null)?.message || `Request failed with ${response.status}`);
  }

  return payload as StudioReadingResult;
}

export function CreatorStudio() {
  const [accessKey, setAccessKey] = useState("");
  const [label, setLabel] = useState("Jeff");
  const [birthDate, setBirthDate] = useState("1984-11-24");
  const [birthTime, setBirthTime] = useState("09:07");
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [birthPlace, setBirthPlace] = useState("Marietta, Georgia, United States");
  const [latitude, setLatitude] = useState("33.9526");
  const [longitude, setLongitude] = useState("-84.5499");
  const [timezone, setTimezone] = useState("America/New_York");
  const [timezoneOffset, setTimezoneOffset] = useState("-240");
  const [readingType, setReadingType] = useState<StudioReadingType>("daily");
  const [audience, setAudience] = useState<StudioAudience>("advertising");
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<StudioReadingResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("Generating studio output...");

    try {
      const response = await requestStudio({
        accessKey,
        audience,
        birthDate,
        birthPlace,
        birthTime,
        label,
        latitude: Number(latitude),
        longitude: Number(longitude),
        question,
        readingType,
        timezone,
        timezoneOffset: Number(timezoneOffset),
        unknownBirthTime
      });
      setResult(response);
      setStatus("Studio output ready.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to generate studio output.");
      setStatus(null);
    }
  }

  return (
    <main className="live-shell studio-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
      </header>

      <section className="studio-grid">
        <form className="live-form studio-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="studio-head">
            <p className="timestamp">Private creator studio.</p>
            <h1 className="demo-question">Build the reading. Build the ad. Keep the voice intact.</h1>
          </div>

          <label className="demo-field live-field">
            <span>Studio access key</span>
            <input type="password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} />
          </label>

          <label className="demo-field live-field">
            <span>Profile label</span>
            <input value={label} onChange={(event) => setLabel(event.target.value)} />
          </label>

          <div className="live-two-col">
            <label className="demo-field live-field">
              <span>Birth date</span>
              <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
            </label>
            <label className="demo-field live-field">
              <span>Birth time</span>
              <input
                disabled={unknownBirthTime}
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
              />
            </label>
          </div>

          <label className="demo-toggle">
            <input checked={unknownBirthTime} type="checkbox" onChange={(event) => setUnknownBirthTime(event.target.checked)} />
            Birth time unknown
          </label>

          <label className="demo-field live-field">
            <span>Birth place</span>
            <input value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} />
          </label>

          <div className="live-two-col">
            <label className="demo-field live-field">
              <span>Latitude</span>
              <input value={latitude} onChange={(event) => setLatitude(event.target.value)} />
            </label>
            <label className="demo-field live-field">
              <span>Longitude</span>
              <input value={longitude} onChange={(event) => setLongitude(event.target.value)} />
            </label>
          </div>

          <div className="live-two-col">
            <label className="demo-field live-field">
              <span>Timezone</span>
              <input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
            </label>
            <label className="demo-field live-field">
              <span>Timezone offset</span>
              <input value={timezoneOffset} onChange={(event) => setTimezoneOffset(event.target.value)} />
            </label>
          </div>

          <div className="live-two-col">
            <label className="demo-field live-field">
              <span>Reading type</span>
              <select value={readingType} onChange={(event) => setReadingType(event.target.value as StudioReadingType)}>
                {readingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="demo-field live-field">
              <span>Audience</span>
              <select value={audience} onChange={(event) => setAudience(event.target.value as StudioAudience)}>
                {audiences.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="demo-field live-field">
            <span>Question or context</span>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Optional" />
          </label>

          {error ? <p className="live-error">{error}</p> : null}
          {status ? <p className="live-subtle">{status}</p> : null}

          <button className="button-primary" type="submit">
            Generate studio output
          </button>
        </form>

        <section className="studio-output">
          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">Chart-style summary</p>
            <p>{result?.chartSummary ?? "Your chart summary will appear here."}</p>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">Forecast-style reading</p>
            <p>{result?.forecast ?? "Your forecast-style reading will appear here."}</p>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">CosmoScope voice reading</p>
            <p>{result?.voiceReading ?? "Your CosmoScope voice reading will appear here."}</p>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">Hooks</p>
            <ul className="studio-list">
              {(result?.hooks ?? ["Hooks will appear here."]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">Marketing variants</p>
            <ul className="studio-list">
              {(result?.marketingVariants ?? ["Marketing variants will appear here."]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">CTA ideas</p>
            <ul className="studio-list">
              {(result?.ctaIdeas ?? ["CTA ideas will appear here."]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">Module fit</p>
            <ul className="studio-list">
              {(result?.moduleFit ?? ["Module fit notes will appear here."]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="live-editorial-panel studio-panel">
            <p className="reading-kicker">Notes</p>
            <p>{result?.notes ?? "Studio notes will appear here."}</p>
          </article>
        </section>
      </section>
    </main>
  );
}
