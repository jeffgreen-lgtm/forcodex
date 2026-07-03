"use client";

import { useMemo, useState } from "react";
import { API_PATHS } from "@cosmoscope/api";

const API_BASE_URL = "https://cosmoscope-api.jeff-green-5aa.workers.dev";

type Mode = "signup" | "login";
type Phase = "auth" | "loading" | "member";

type AuthResponse = {
  accessToken?: string | null;
  session?: {
    accessToken?: string | null;
  } | null;
  user?: {
    email?: string;
    id: string;
  } | null;
};

type ChartResponse = {
  cached: boolean;
  chart?: {
    bigThree?: {
      moon?: string;
      rising?: string;
      sun?: string;
    };
  };
  summary: string | null;
  updatedAt: string;
};

type ForecastResponse = {
  cached: boolean;
  content: string;
  effectiveDate: string;
  timeframe: "daily" | "weekly" | "monthly";
};

const defaultBirthDate = "1990-10-24";

function renderMove(text: string) {
  const [before, after] = text.split("**Your move:**");
  if (!after) {
    return text;
  }

  return (
    <>
      {before}
      <strong>Your move:</strong>
      {after}
    </>
  );
}

export function LiveExperience() {
  const [mode, setMode] = useState<Mode>("signup");
  const [phase, setPhase] = useState<Phase>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthPlace, setBirthPlace] = useState("Chicago, Illinois");
  const [birthDate, setBirthDate] = useState(defaultBirthDate);
  const [birthTime, setBirthTime] = useState("09:07");
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firstName = useMemo(() => {
    const source = displayName.trim() || email.split("@")[0] || "Member";
    return source.split(/\s+/)[0];
  }, [displayName, email]);

  async function handleSubmit() {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup" && (!birthPlace.trim() || !birthDate)) {
      setError("Birth place and birth date are required.");
      return;
    }

    setPhase("loading");

    try {
      const auth = await request<AuthResponse>(mode === "signup" ? API_PATHS.signup : API_PATHS.login, {
        body: JSON.stringify(
          mode === "signup"
            ? {
                birthDate,
                birthPlace,
                birthTime: unknownBirthTime ? "12:00" : birthTime,
                displayName: displayName.trim() || email.split("@")[0],
                email: email.trim(),
                latitude: 41.8781,
                longitude: -87.6298,
                password,
                timezone: "America/Chicago",
                timezoneOffset: -300,
                unknownBirthTime
              }
            : {
                email: email.trim(),
                password
              }
        ),
        method: "POST"
      });

      const token = auth.accessToken ?? auth.session?.accessToken ?? null;
      if (!token) {
        throw new Error("The account was created, but no access token came back. Try logging in.");
      }

      setAccessToken(token);

      const chartResponse = await request<ChartResponse>(API_PATHS.chart, {
        body: JSON.stringify({
          birthDate,
          birthPlace,
          birthTime: unknownBirthTime ? "12:00" : birthTime,
          latitude: 41.8781,
          longitude: -87.6298,
          timezone: "America/Chicago",
          timezoneOffset: -300
        }),
        headers: authHeaders(token),
        method: "POST"
      });

      const forecastResponse = await request<ForecastResponse>(API_PATHS.forecast, {
        body: JSON.stringify({ timeframe: "daily" }),
        headers: authHeaders(token),
        method: "POST"
      });

      setChart(chartResponse);
      setForecast(forecastResponse);
      setPhase("member");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load CosmoScope.");
      setPhase("auth");
    }
  }

  async function refreshDaily() {
    if (!accessToken) {
      setPhase("auth");
      return;
    }

    setError(null);
    try {
      const forecastResponse = await request<ForecastResponse>(API_PATHS.forecast, {
        body: JSON.stringify({ timeframe: "daily" }),
        headers: authHeaders(accessToken),
        method: "POST"
      });
      setForecast(forecastResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to refresh the daily reading.");
    }
  }

  return (
    <main className="live-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
        <span className="demo-pill">Live web app - payments pending</span>
      </header>

      {phase === "auth" ? (
        <section className="live-auth fade-up">
          <div className="live-auth-copy">
            <p className="timestamp">Live Worker + Supabase account</p>
            <h1 className="demo-hero">Open your daily climate.</h1>
            <p className="demo-body">
              This route uses the deployed CosmoScope API. It creates or reconnects a real member record, caches your
              chart inputs, and returns today&apos;s personalized reading.
            </p>
            <p className="live-note">
              Accuracy note: the account, cache, and forecast delivery are live. The current chart engine is the
              foundation version; the full ephemeris/planetary calculation layer is the next accuracy upgrade.
            </p>
          </div>

          <form
            className="live-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="mode-row" role="tablist" aria-label="Account mode">
              <button
                aria-selected={mode === "signup"}
                className={mode === "signup" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("signup")}
              >
                Create account
              </button>
              <button
                aria-selected={mode === "login"}
                className={mode === "login" ? "is-active" : ""}
                type="button"
                onClick={() => setMode("login")}
              >
                Log in
              </button>
            </div>

            {mode === "signup" ? (
              <label className="demo-field live-field">
                <span>Name</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Jeff" />
              </label>
            ) : null}

            <label className="demo-field live-field">
              <span>Email</span>
              <input
                autoComplete="email"
                inputMode="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="demo-field live-field">
              <span>Password</span>
              <input
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={6}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
              />
            </label>

            {mode === "signup" ? (
              <>
                <label className="demo-field live-field">
                  <span>Birth place</span>
                  <input value={birthPlace} onChange={(event) => setBirthPlace(event.target.value)} />
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
                  <input
                    checked={unknownBirthTime}
                    type="checkbox"
                    onChange={(event) => setUnknownBirthTime(event.target.checked)}
                  />
                  I do not know my birth time
                </label>
              </>
            ) : null}

            {error ? <p className="live-error">{error}</p> : null}

            <button className="button-primary" type="submit">
              {mode === "signup" ? "Create and read" : "Log in and read"}
            </button>
          </form>
        </section>
      ) : null}

      {phase === "loading" ? (
        <section className="demo-screen demo-loading fade-up" aria-live="polite">
          <p className="caption">Live API</p>
          <h1 className="demo-loading-text">Preparing your daily climate</h1>
          <p className="demo-body">Creating the member session, caching the chart, and pulling today&apos;s reading.</p>
        </section>
      ) : null}

      {phase === "member" ? (
        <section className="live-member fade-up">
          <div className="live-member-head">
            <p className="timestamp">{firstName}&apos;s CosmoScope</p>
            <h1 className="demo-hero">Today&apos;s reading is ready.</h1>
            <p className="live-note">
              This is coming from the live Worker and Supabase cache. Payments and premium entitlement unlocks are still
              pending Stripe/RevenueCat completion.
            </p>
          </div>

          <div className="live-grid">
            <article className="live-panel live-panel-wide">
              <p className="reading-kicker">Daily climate</p>
              <h2>{forecast?.effectiveDate ?? "Today"}</h2>
              <p>{forecast ? renderMove(forecast.content) : "No reading loaded yet."}</p>
              <button className="button-secondary" type="button" onClick={() => void refreshDaily()}>
                Refresh daily
              </button>
            </article>

            <article className="live-panel">
              <p className="reading-kicker">Cached chart</p>
              <h2>{chart?.cached ? "Restored" : "Created"}</h2>
              <p>{chart?.summary ?? "Chart summary unavailable."}</p>
            </article>

            <article className="live-panel">
              <p className="reading-kicker">Big three</p>
              <h2>{chart?.chart?.bigThree?.sun ?? "Sun"}</h2>
              <p>
                Moon: {chart?.chart?.bigThree?.moon ?? "pending"} / Rising:{" "}
                {chart?.chart?.bigThree?.rising ?? "pending"}
              </p>
            </article>
          </div>

          {error ? <p className="live-error">{error}</p> : null}

          <div className="demo-footer-actions">
            <button className="button-secondary" type="button" onClick={() => setPhase("auth")}>
              Switch account
            </button>
            <a className="button-primary" href="/demo">
              Open unlocked demo
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function authHeaders(accessToken: string) {
  return {
    authorization: `Bearer ${accessToken}`
  };
}

async function request<T>(path: string, init: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {})
    }
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    throw new Error((payload as { message?: string } | null)?.message ?? `Request failed with ${response.status}`);
  }

  return payload as T;
}
