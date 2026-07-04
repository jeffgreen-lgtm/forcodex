"use client";

import { useEffect, useMemo, useState } from "react";
import { API_PATHS } from "@cosmoscope/api";
import { PREMIUM_PRODUCTS } from "@cosmoscope/api/products";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL?.trim() || "https://cosmoscope-api.jeff-green-5aa.workers.dev";

type Mode = "signup" | "login";
type Phase = "auth" | "loading" | "member";
type ForecastTimeframe = "daily" | "weekly" | "monthly" | "yearly";

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

type GeocodeResult = {
  id: number;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type Placement = {
  body: string;
  degree: number;
  degreeInSign: number;
  retrograde: boolean;
  sign: string;
};

type TransitSignal = {
  aspect: string;
  exactness: number;
  natalBody: string;
  natalSign: string;
  orb: number;
  transitBody: string;
  transitSign: string;
};

type ChartResponse = {
  cached: boolean;
  chart?: {
    accuracy?: {
      engine?: string;
      houses?: string;
      planets?: string;
    };
    bigThree?: {
      moon?: string;
      rising?: string;
      sun?: string;
    };
    birth?: {
      instantUtc?: string;
      latitude?: number;
      longitude?: number;
      place?: string;
      timezone?: string;
      unknownBirthTime?: boolean;
    };
    dominantTransit?: TransitSignal;
    planets?: Placement[];
    transits?: Placement[];
    wheel?: {
      ascendant?: {
        degree?: number;
        degreeInSign?: number;
        sign?: string;
      } | null;
      midheaven?: {
        degree?: number;
        degreeInSign?: number;
        sign?: string;
      } | null;
    };
  };
  summary: string | null;
  updatedAt: string;
};

type ForecastResponse = {
  cached: boolean;
  content: string;
  effectiveDate: string;
  timeframe: ForecastTimeframe;
};

type StarScopeResponse = {
  content: string;
  productKey: string;
  question: string;
};

type LoveScopeResponse = {
  content: string;
  partnerName: string;
  productKey: string;
  relationshipType: string;
};

type EntitlementsResponse = {
  activeSubscriptionProductKey?: string | null;
  expiresAt?: string | null;
  premiumActive: boolean;
  premiumSource: string;
  revenueCatActive: boolean;
  sourceUpdatedAt?: string;
  stripeActive: boolean;
  unlocks: {
    forecastMonthly: boolean;
    lovescope: boolean;
    starscope: boolean;
    yearlyBlueprint: boolean;
  };
};

type CheckoutSessionResponse = {
  productKey: string;
  sessionId: string;
  url: string;
};

type ResolvedBirthLocation = Pick<GeocodeResult, "label" | "latitude" | "longitude" | "timezone">;

const defaultBirthDate = "1990-10-24";
const defaultBirthTime = "09:07";
const SESSION_STORAGE_KEY = "cosmoscope-access-token";
const forecastLabels: Record<ForecastTimeframe, string> = {
  daily: "Daily decoding",
  weekly: "Weekly breakdown",
  monthly: "Monthly structure",
  yearly: "Yearly blueprint"
};

const placementKickers = ["Sun sign", "Moon sign", "Rising sign"] as const;
const signQualities: Record<
  string,
  {
    emotionalNeed: string;
    publicStyle: string;
    solarDrive: string;
  }
> = {
  Aries: {
    emotionalNeed: "directness, movement, and enough room to act before overthinking takes over",
    publicStyle: "quick, self-starting, and hard to mistake for passive",
    solarDrive: "to initiate, test yourself, and move toward what feels alive"
  },
  Taurus: {
    emotionalNeed: "stability, consistency, and enough calm to trust what is unfolding",
    publicStyle: "grounded, measured, and quietly self-possessed",
    solarDrive: "to build something lasting and protect what feels worth keeping"
  },
  Gemini: {
    emotionalNeed: "conversation, mental movement, and the freedom to keep revising your understanding",
    publicStyle: "curious, responsive, and mentally quick on first contact",
    solarDrive: "to learn, connect, and keep life mentally alive"
  },
  Cancer: {
    emotionalNeed: "safety, emotional honesty, and space to feel before performing strength",
    publicStyle: "receptive, intuitive, and protective of what matters",
    solarDrive: "to protect, nurture, and stay close to what feels emotionally true"
  },
  Leo: {
    emotionalNeed: "warmth, loyalty, and the feeling that your inner life is being met with genuine regard",
    publicStyle: "radiant, expressive, and easier to feel than to ignore",
    solarDrive: "to create, lead, and live with visible heart"
  },
  Virgo: {
    emotionalNeed: "clarity, usefulness, and the sense that effort is leading somewhere real",
    publicStyle: "observant, exact, and quietly discerning",
    solarDrive: "to refine, improve, and make life more coherent"
  },
  Libra: {
    emotionalNeed: "balance, reciprocity, and enough harmony to hear yourself clearly",
    publicStyle: "gracious, socially aware, and highly attuned to tone",
    solarDrive: "to create fairness, beauty, and more intelligent relationship"
  },
  Scorpio: {
    emotionalNeed: "trust, honesty, and room for intensity without performance",
    publicStyle: "contained, magnetic, and difficult to read fully at first glance",
    solarDrive: "to go deep, stay real, and transform what is no longer workable"
  },
  Sagittarius: {
    emotionalNeed: "space, honesty, and the freedom to move toward what feels meaningful",
    publicStyle: "open, candid, and hard to pin down when life gets too small",
    solarDrive: "to expand, explore, and live inside a bigger truth"
  },
  Capricorn: {
    emotionalNeed: "self-respect, structure, and evidence that your effort is compounding",
    publicStyle: "steady, serious, and more authoritative than loud",
    solarDrive: "to build something durable and become stronger through discipline"
  },
  Aquarius: {
    emotionalNeed: "distance, perspective, and enough independence to think clearly",
    publicStyle: "distinctive, cerebral, and slightly outside the room while still in it",
    solarDrive: "to question defaults, modernize the pattern, and think beyond the obvious"
  },
  Pisces: {
    emotionalNeed: "softness, restoration, and room to feel what cannot be reduced to logic",
    publicStyle: "porous, imaginative, and quietly shape-shifting",
    solarDrive: "to dissolve false edges and stay close to meaning, feeling, and intuition"
  }
};

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

function splitParagraphs(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function splitSentences(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function stripMoveLabel(text: string | null | undefined) {
  if (!text) {
    return "";
  }

  return text.replace(/\*\*Your move:\*\*\s*/gi, "").trim();
}

function extractMoveText(text: string | null | undefined) {
  if (!text) {
    return "";
  }

  const match = text.match(/\*\*Your move:\*\*\s*([\s\S]*)$/i);
  return match?.[1]?.trim() ?? "";
}

function toDisplayName(source: string) {
  return source
    .split(/[@._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

function normalizeMemberLabel(displayName: string, email: string) {
  const source = displayName.trim() || email.split("@")[0] || "Member";
  const looksHandleLike =
    !source.includes(" ") && (/[._-]/.test(source) || /\d/.test(source) || source === source.toLowerCase());

  if (source.includes("@") || looksHandleLike) {
    const normalized = toDisplayName(source);
    return normalized || "Member";
  }

  return source;
}

function formatEffectiveLabel(value: string | undefined, timeframe: ForecastTimeframe) {
  if (!value) {
    return forecastLabels[timeframe];
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed =
    Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
      ? new Date(year, month - 1, day)
      : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  if (timeframe === "weekly") {
    const end = new Date(parsed);
    end.setDate(parsed.getDate() + 6);
    return `${parsed.toLocaleDateString(undefined, { month: "long", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "long", day: "numeric" })}`;
  }

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: timeframe === "yearly" ? undefined : "long",
    year: parsed.getFullYear() !== new Date().getFullYear() || timeframe === "yearly" ? "numeric" : undefined
  });
}

function buildCoordinateMeaning(kicker: (typeof placementKickers)[number], sign: string | undefined) {
  if (!sign) {
    return "This part of your chart will appear here once the calculation is complete.";
  }

  const qualities =
    signQualities[sign] ?? {
      emotionalNeed: "clarity about what you feel and why it matters",
      publicStyle: "distinctive and legible on first contact",
      solarDrive: "to move toward what feels true"
    };

  if (kicker === "Sun sign") {
    return `${sign} describes the central drive in your natal chart: the part of you that decides what matters, what kind of standards you live by, and where your identity wants to grow. In practice, that usually means a strong pull ${qualities.solarDrive}. When your Sun is working well, life feels more coherent because your effort is moving in the same direction as your values.`;
  }

  if (kicker === "Moon sign") {
    return `${sign} describes how your emotional body works before you have time to explain yourself. It points to what helps you feel settled, what tends to sting, and what your system reaches for when life gets louder. A ${sign} Moon usually needs ${qualities.emotionalNeed}, so understanding that pattern gives you a much cleaner read on your reactions, your relationships, and your recovery rhythm.`;
  }

  return `${sign} describes the outer style of your chart: how you enter a room, how other people read you at first contact, and what your presence communicates before much is said. In real life, that often comes through as ${qualities.publicStyle}. Your Rising sign does not replace who you are; it shows the doorway through which the rest of the chart first gets seen.`;
}

function buildGlobalClimateReading(signal: TransitSignal | undefined) {
  if (!signal) {
    return {
      body: "Today’s collective reading will appear here once the live transit layer is available.",
      headline: "Today’s wider atmosphere",
      metadata: null as string | null
    };
  }

  return {
    body: `${signal.transitBody} in ${signal.transitSign} is making confidence, timing, and public reactions feel less settled than usual. In the wider atmosphere, people may move too fast, overstate what is ready, or push a conversation past the point where it stays useful.`,
    headline: "Today’s wider atmosphere",
    metadata: "Live transit signal"
  };
}

function buildDailyReading(sentences: string[], chartBigThree: string, firstName: string, signal: TransitSignal | undefined) {
  const primary = sentences.slice(0, 5).join(" ");
  const secondary =
    sentences.slice(5).join(" ") ||
    `${firstName}, this is the kind of day where ${chartBigThree || "your chart"} benefits from pacing, cleaner language, and fewer reactive decisions. ${signal ? `${signal.transitBody} is making urgency louder than wisdom, so give important choices more room before you lock them in.` : "If the day feels louder than usual, take that as a cue to simplify rather than intensify."}`;

  return { primary, secondary };
}

function buildWeeklySupport(chartBigThree: string, signal: TransitSignal | undefined) {
  return {
    opening: "The beginning of the week asks for more patience than pride. If you rush to prove a point too early, you can waste energy that would be better used building leverage.",
    middle: signal
      ? `${signal.transitBody} sharpens the middle of the week and makes reactions louder than they need to be. This is the stretch where better timing, clearer boundaries, and less over-explaining will help the most.`
      : "The middle of the week is where patterns become easier to read. Stay close to what is working, and do not keep feeding what is obviously thinning out.",
    closing:
      "By the end of the week, the tone softens and the real lesson becomes visible. What looked urgent at first will read more clearly once you stop forcing resolution before it is ready.",
    themes: [
      ["Monday", "Set the tone early. Keep decisions narrow and protect your attention."],
      ["Tuesday", "Expect stronger reactions around communication. Clarify before you commit."],
      ["Wednesday", "Momentum improves when you stop over-explaining and move one task at a time."],
      ["Thursday", signal ? `${signal.transitBody} sharpens the atmosphere. Confidence helps, but force will backfire.` : "Stay measured. Push only what is genuinely ready."],
      ["Friday", "People become easier to read. Use the day for alignment, not correction."],
      ["Saturday", "Let the pace soften. What you process privately now will help next week land better."],
      ["Sunday", "Use the day to reset your priorities and leave unfinished tension where it belongs."]
    ] as Array<[string, string]>
  };
}

function chunkSentences(sentences: string[], size: number) {
  const chunks: string[] = [];
  for (let index = 0; index < sentences.length; index += size) {
    chunks.push(sentences.slice(index, index + size).join(" "));
  }
  return chunks.filter(Boolean);
}

function sanitizeUserFacingCopy(text: string | null | undefined, memberLabel: string) {
  if (!text) {
    return "";
  }

  const safeName = memberLabel || "you";
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, safeName)
    .replace(/\b[A-Z0-9._%+-]+(?=@)/gi, safeName)
    .replace(/(^|\n\n)([a-z])/g, (_, boundary: string, char: string) => `${boundary}${char.toUpperCase()}`);
}

function requireResolvedBirthLocation(selectedLocation: GeocodeResult | null): ResolvedBirthLocation {
  if (!selectedLocation) {
    throw new Error("Choose a birth place from the search results so the chart uses the right coordinates.");
  }

  return {
    label: selectedLocation.label,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    timezone: selectedLocation.timezone
  };
}

function normalizeBirthDateForApi(rawBirthDate: string): string {
  const value = rawBirthDate.trim();

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return value;
  }

  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const dashMatch = value.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, month, day, year] = dashMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  throw new Error("Enter birth date as MM/DD/YYYY or YYYY-MM-DD.");
}

export function LiveExperience() {
  const [mode, setMode] = useState<Mode>("signup");
  const [phase, setPhase] = useState<Phase>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState(defaultBirthDate);
  const [birthTime, setBirthTime] = useState(defaultBirthTime);
  const [unknownBirthTime, setUnknownBirthTime] = useState(false);
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodeResult | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "searching" | "ready">("idle");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(null);
  const [forecasts, setForecasts] = useState<Partial<Record<ForecastTimeframe, ForecastResponse>>>({});
  const [activeForecast, setActiveForecast] = useState<ForecastTimeframe>("daily");
  const [starQuestion, setStarQuestion] = useState("What deserves my cleanest attention this week?");
  const [starScope, setStarScope] = useState<StarScopeResponse | null>(null);
  const [partnerName, setPartnerName] = useState("Alex");
  const [relationshipType, setRelationshipType] = useState("Dating");
  const [loveSituation, setLoveSituation] = useState("The connection is strong, but the expectations are not fully named.");
  const [loveScope, setLoveScope] = useState<LoveScopeResponse | null>(null);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const memberLabel = useMemo(() => {
    return normalizeMemberLabel(displayName, email);
  }, [displayName, email]);

  const firstName = useMemo(() => {
    return memberLabel.split(/\s+/)[0] || "Member";
  }, [memberLabel]);

  useEffect(() => {
    if (typeof window === "undefined" || accessToken) {
      return;
    }

    const savedToken = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedToken) {
      return;
    }

    setAccessToken(savedToken);
    setPhase("loading");

    void hydrateMember(savedToken)
      .then(() => {
        setPhase("member");
      })
      .catch((caught) => {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setAccessToken(null);
        setError(caught instanceof Error ? caught.message : "Your saved session expired. Log in again.");
        setPhase("auth");
      });
  }, []);

  useEffect(() => {
    if (mode !== "signup") {
      setGeocodeResults([]);
      setSelectedLocation(null);
      setLocationStatus("idle");
    }
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined" || !accessToken) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    const sessionId = params.get("session_id");

    if (checkout === "success" && sessionId) {
      setToolStatus("Confirming payment...");
      void request<{ entitlement: EntitlementsResponse }>(API_PATHS.confirmCheckoutSession, {
        body: JSON.stringify({ sessionId }),
        headers: authHeaders(accessToken),
        method: "POST"
      })
        .then((payload) => {
          setEntitlements(payload.entitlement);
          return hydrateMember(accessToken);
        })
        .then(() => {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("checkout");
          cleanUrl.searchParams.delete("session_id");
          window.history.replaceState({}, "", cleanUrl.toString());
          setToolStatus("Payment confirmed.");
        })
        .catch((caught) => {
          setError(caught instanceof Error ? caught.message : "We could not confirm the payment yet.");
          setToolStatus(null);
        });
    }
  }, [accessToken]);

  async function handleLocationSearch() {
    setSelectedLocation(null);

    const query = birthPlace.trim();
    if (query.length < 3) {
      setGeocodeResults([]);
      setLocationStatus("idle");
      setError("Type at least 3 characters for the birth place, then search.");
      return;
    }

    setError(null);
    setLocationStatus("searching");

    try {
      const payload = await request<{ results: GeocodeResult[] }>(API_PATHS.geocode, {
        body: JSON.stringify({ query }),
        method: "POST"
      });

      setGeocodeResults(payload.results);
      setLocationStatus("ready");

      const onlyResult = payload.results[0];
      if (payload.results.length === 1 && onlyResult) {
        setSelectedLocation(onlyResult);
        setBirthPlace(onlyResult.label);
      }
    } catch {
      setGeocodeResults([]);
      setLocationStatus("idle");
      setError("Location search failed. Try city and state, like Chicago, Illinois.");
    }
  }

  async function resolveBirthLocationForSignup(): Promise<ResolvedBirthLocation> {
    if (selectedLocation) {
      return requireResolvedBirthLocation(selectedLocation);
    }

    const query = birthPlace.trim();

    if (query.length < 3) {
      throw new Error("Type at least 3 characters for the birth place, like Marietta, Georgia.");
    }

    setLocationStatus("searching");
    setToolStatus("Resolving your birth place...");

    const payload = await request<{ results: GeocodeResult[] }>(API_PATHS.geocode, {
      body: JSON.stringify({ query }),
      method: "POST"
    });

    setGeocodeResults(payload.results);
    setLocationStatus("ready");

    const bestMatch = payload.results[0];

    if (!bestMatch) {
      throw new Error("No location matches found. Try city and state, like Marietta, Georgia.");
    }

    setSelectedLocation(bestMatch);
    setBirthPlace(bestMatch.label);
    setToolStatus(null);

    return requireResolvedBirthLocation(bestMatch);
  }

  async function handleSubmit() {
    setError(null);
    setToolStatus(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "signup" && !birthDate) {
      setError("Birth date is required.");
      return;
    }

    let normalizedBirthDate = birthDate;

    try {
      normalizedBirthDate = mode === "signup" ? normalizeBirthDateForApi(birthDate) : birthDate;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enter a valid birth date.");
      return;
    }

    setPhase("loading");

    try {
      const resolvedBirthLocation = mode === "signup" ? await resolveBirthLocationForSignup() : null;
      const auth = await request<AuthResponse>(mode === "signup" ? API_PATHS.signup : API_PATHS.login, {
        body: JSON.stringify(
          mode === "signup"
            ? {
                birthDate: normalizedBirthDate,
                birthPlace: resolvedBirthLocation?.label,
                birthTime: unknownBirthTime ? "12:00" : birthTime,
                displayName: displayName.trim() || email.split("@")[0],
                email: email.trim(),
                latitude: resolvedBirthLocation?.latitude,
                longitude: resolvedBirthLocation?.longitude,
                password,
                timezone: resolvedBirthLocation?.timezone,
                timezoneOffset: null,
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
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
      }
      await hydrateMember(token, resolvedBirthLocation, normalizedBirthDate);
      setPhase("member");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load CosmoScope.");
      setPhase("auth");
    }
  }

  async function hydrateMember(
    token: string,
    birthLocationOverride: ResolvedBirthLocation | null = null,
    birthDateOverride = birthDate
  ) {
    const chartLocation = birthLocationOverride ?? selectedLocation;

    const chartResponse = await request<ChartResponse>(API_PATHS.chart, {
      body: JSON.stringify(
        chartLocation
          ? {
              birthDate: birthDateOverride,
              birthPlace: chartLocation.label,
              birthTime: unknownBirthTime ? "12:00" : birthTime,
              latitude: chartLocation.latitude,
              longitude: chartLocation.longitude,
              timezone: chartLocation.timezone,
              timezoneOffset: null
            }
          : {}
      ),
      headers: authHeaders(token),
      method: "POST"
    });

    const dailyForecast = await request<ForecastResponse>(API_PATHS.forecast, {
      body: JSON.stringify({ timeframe: "daily" }),
      headers: authHeaders(token),
      method: "POST"
    });

    const entitlementsResponse = await request<EntitlementsResponse>(API_PATHS.entitlements, {
      headers: authHeaders(token),
      method: "GET"
    });

    setChart(chartResponse);
    setEntitlements(entitlementsResponse);
    setForecasts({ daily: dailyForecast });
  }

  async function beginCheckout(productKey: keyof typeof PREMIUM_PRODUCTS) {
    if (!accessToken) {
      setError("Create or open your account before starting checkout.");
      return;
    }

    setToolStatus("Opening checkout...");
    setError(null);
    try {
      const response = await request<CheckoutSessionResponse>(API_PATHS.createCheckoutSession, {
        body: JSON.stringify({ productKey }),
        headers: authHeaders(accessToken),
        method: "POST"
      });
      window.location.href = response.url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start checkout.");
      setToolStatus(null);
    }
  }

  function canAccessForecast(timeframe: ForecastTimeframe) {
    if (timeframe === "daily" || timeframe === "weekly") {
      return true;
    }

    if (entitlements?.premiumActive) {
      return true;
    }

    if (timeframe === "monthly") {
      return Boolean(entitlements?.unlocks.forecastMonthly);
    }

    if (timeframe === "yearly") {
      return Boolean(entitlements?.unlocks.yearlyBlueprint);
    }

    return false;
  }

  function checkoutProductForForecast(timeframe: ForecastTimeframe): keyof typeof PREMIUM_PRODUCTS | null {
    if (timeframe === "monthly") {
      return "forecast_monthly";
    }

    if (timeframe === "yearly") {
      return "yearly_blueprint";
    }

    return null;
  }

  async function loadForecast(timeframe: ForecastTimeframe) {
    if (!accessToken) {
      return;
    }

    if (!canAccessForecast(timeframe)) {
      const productKey = checkoutProductForForecast(timeframe);
      if (productKey) {
        await beginCheckout(productKey);
      }
      return;
    }

    setToolStatus(`Loading ${timeframe} reading...`);
    setError(null);
    try {
      const response = await request<ForecastResponse>(API_PATHS.forecast, {
        body: JSON.stringify({ timeframe }),
        headers: authHeaders(accessToken),
        method: "POST"
      });
      setForecasts((current) => ({ ...current, [timeframe]: response }));
      setActiveForecast(timeframe);
      setToolStatus(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Unable to load the ${timeframe} reading.`);
      setToolStatus(null);
    }
  }

  async function runStarScope() {
    if (!accessToken) {
      return;
    }

    setToolStatus("Loading StarScope...");
    setError(null);
    try {
      const response = await request<StarScopeResponse>(API_PATHS.starscope, {
        body: JSON.stringify({ question: starQuestion }),
        headers: authHeaders(accessToken),
        method: "POST"
      });
      setStarScope(response);
      setToolStatus(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load StarScope.");
      setToolStatus(null);
    }
  }

  async function runLoveScope() {
    if (!accessToken) {
      return;
    }

    setToolStatus("Loading LoveScope...");
    setError(null);
    try {
      const response = await request<LoveScopeResponse>(API_PATHS.lovescope, {
        body: JSON.stringify({
          partnerBirthDate: null,
          partnerName,
          relationshipType,
          situation: loveSituation
        }),
        headers: authHeaders(accessToken),
        method: "POST"
      });
      setLoveScope(response);
      setToolStatus(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load LoveScope.");
      setToolStatus(null);
    }
  }

  async function sendResetLink() {
    if (!email.trim()) {
      setError("Enter your email first, then request a reset link.");
      return;
    }

    setToolStatus("Sending reset email...");
    setError(null);
    try {
      const response = await request<{ message: string }>(API_PATHS.resetPassword, {
        body: JSON.stringify({ email: email.trim() }),
        method: "POST"
      });
      setToolStatus(response.message || "If that address is in the system, a reset link is on the way.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send reset email.");
      setToolStatus(null);
    }
  }

  const forecastTabs: ForecastTimeframe[] = ["daily", "weekly", "monthly", "yearly"];
  const activeForecastCopy = forecasts[activeForecast];
  const chartPlanets = chart?.chart?.planets ?? [];
  const chartTransits = chart?.chart?.transits ?? [];
  const transitSignal = chart?.chart?.dominantTransit;
  const chartBigThree = [chart?.chart?.bigThree?.sun, chart?.chart?.bigThree?.moon, chart?.chart?.bigThree?.rising]
    .filter(Boolean)
    .join(" • ");
  const bigThreeCards = [
    {
      content: buildCoordinateMeaning(placementKickers[0], chart?.chart?.bigThree?.sun),
      headline: chart?.chart?.bigThree?.sun ?? "Pending",
      kicker: placementKickers[0]
    },
    {
      content: buildCoordinateMeaning(placementKickers[1], chart?.chart?.bigThree?.moon),
      headline: chart?.chart?.bigThree?.moon ?? "Pending",
      kicker: placementKickers[1]
    },
    {
      content: buildCoordinateMeaning(placementKickers[2], chart?.chart?.bigThree?.rising),
      headline: chart?.chart?.bigThree?.rising ?? "Pending",
      kicker: placementKickers[2]
    }
  ];
  const cleanedForecastContent = sanitizeUserFacingCopy(activeForecastCopy?.content, memberLabel);
  const moveText = extractMoveText(cleanedForecastContent);
  const forecastBody = stripMoveLabel(cleanedForecastContent);
  const forecastParagraphs = splitParagraphs(forecastBody);
  const forecastSentences = splitSentences(forecastBody);
  const cleanedChartSummary = sanitizeUserFacingCopy(chart?.summary, memberLabel);
  const chartSummaryParagraphs = splitParagraphs(cleanedChartSummary);
  const blueprintPrice = PREMIUM_PRODUCTS.yearly_blueprint.priceLabel;
  const globalClimate = buildGlobalClimateReading(transitSignal);
  const dailyReading = buildDailyReading(forecastSentences, chartBigThree, firstName, transitSignal);
  const weeklySupport = buildWeeklySupport(chartBigThree, transitSignal);
  const monthlyNarrative = chunkSentences(forecastSentences, 2);

  return (
    <main className="live-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
      </header>

      {phase === "auth" ? (
        <section className="live-auth fade-up">
          <div className="live-auth-copy">
            <p className="timestamp">Private reading from exact data.</p>
            <h1 className="demo-hero">The CosmoScope reads the pattern back to you.</h1>
            <p className="live-note">
              Give it the clearest record you can. It will return your core placements, today&apos;s reading, and the larger pattern shaping the week, month, and year.
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
                  <input
                    name="birthPlace"
                    autoComplete="off"
                    spellCheck={false}
                    value={birthPlace}
                    onChange={(event) => {
                      setBirthPlace(event.currentTarget.value);
                      setSelectedLocation(null);
                      setGeocodeResults([]);
                      setLocationStatus("idle");
                    }}
                    onInput={(event) => {
                      const nextValue = event.currentTarget.value;
                      setBirthPlace(nextValue);
                      setSelectedLocation(null);
                    }}
                    placeholder="Chicago, Illinois"
                  />
                </label>

                <button
                  className="button-secondary live-location-search-button"
                  type="button"
                  onClick={() => void handleLocationSearch()}
                >
                  Search location
                </button>

                {locationStatus === "searching" ? <p className="live-subtle">Resolving place...</p> : null}
                {locationStatus === "ready" && !geocodeResults.length ? (
                  <p className="live-subtle">No location matches found. Try city and state.</p>
                ) : null}
                {geocodeResults.length ? (
                  <div className="live-suggestion-list" aria-label="Birth place matches">
                    {geocodeResults.map((result) => (
                      <button
                        key={result.id}
                        className={selectedLocation?.id === result.id ? "is-selected" : ""}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(result);
                          setBirthPlace(result.label);
                        }}
                      >
                        {result.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {selectedLocation ? <p className="live-subtle">Selected: {selectedLocation.label}</p> : null}

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
            {toolStatus ? <p className="live-subtle">{toolStatus}</p> : null}

            {mode === "login" ? (
              <button className="live-text-button" type="button" onClick={() => void sendResetLink()}>
                Forgot password?
              </button>
            ) : null}

            <button className="button-primary" type="submit">
              {mode === "signup" ? "Create account and open chart" : "Log in and continue"}
            </button>
          </form>
        </section>
      ) : null}

      {phase === "loading" ? (
        <section className="demo-screen demo-loading fade-up" aria-live="polite">
          <p className="caption">Preparing your file</p>
          <h1 className="demo-loading-text">Calculating your chart and current climate</h1>
          <p className="demo-body">We are building the account, caching the chart, and opening your member reading.</p>
        </section>
      ) : null}

      {phase === "member" ? (
        <section className="live-member fade-up">
          <div className="live-member-head">
            <p className="timestamp">Private reading, built from your exact data.</p>
            <div className="live-member-heading-row">
              <h1 className="demo-hero">
                <span>Your coordinates.</span>
                <span>Your life, decoded.</span>
              </h1>
              <button className="live-upgrade-button" type="button" onClick={() => void beginCheckout("annual_pass")}>
                {entitlements?.premiumActive ? "Membership active" : "Upgrade to premium"}
              </button>
            </div>
          </div>

          <div className="live-dashboard-grid">
            <section className="live-editorial-panel live-editorial-panel-wide">
              <div className="live-tab-row" role="tablist" aria-label="Forecast timeframes">
                {forecastTabs.map((timeframe) => (
                  <button
                    key={timeframe}
                    className={activeForecast === timeframe ? "is-active" : ""}
                    type="button"
                    onClick={() => void loadForecast(timeframe)}
                  >
                    {forecastLabels[timeframe]}
                  </button>
                ))}
              </div>

              <div className="live-forecast-head">
                <h2>{forecastLabels[activeForecast]}</h2>
                <p>{formatEffectiveLabel(activeForecastCopy?.effectiveDate, activeForecast)}</p>
              </div>

              <div className="live-forecast-copy">
                {activeForecast === "daily" ? (
                  <>
                    <p>
                      {dailyReading.primary ||
                        "Today asks for stronger attention to timing, tone, and what is worth your actual energy. The emotional weather is not necessarily dramatic, but it is revealing. You will learn more by watching where friction keeps repeating than by trying to outpace it. What feels small on the surface may be the clearest signal of what needs adjusting. Stay close to what feels structurally true, not just emotionally loud."}
                    </p>
                    <p>{dailyReading.secondary}</p>
                  </>
                ) : null}
                {activeForecast === "weekly" ? (
                  <>
                    <p>{weeklySupport.opening}</p>
                    <p>{weeklySupport.middle}</p>
                    <p>{weeklySupport.closing}</p>
                    <div className="live-timeline-list">
                      {weeklySupport.themes.map(([day, theme]) => (
                        <div key={day} className="live-timeline-item">
                          <strong>{day}</strong>
                          <p>{theme}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
                {activeForecast === "monthly" ? (
                  <>
                    <div className="live-longform-section">
                      <p className="reading-kicker">The overarching narrative</p>
                      {(monthlyNarrative.length ? monthlyNarrative : forecastParagraphs).map((paragraph, index) => (
                        <p key={`monthly-${index}`}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="live-longform-section">
                      <p className="reading-kicker">Retrogrades and stations</p>
                      <div className="live-callout-stack">
                        <div className="live-callout-card">
                          <p className="reading-kicker">Timing note</p>
                          <p>
                            The month asks for fewer reactive commitments and more attention to what is quietly shifting underneath the surface.
                          </p>
                        </div>
                        {transitSignal ? (
                          <div className="live-callout-card">
                            <p className="reading-kicker">{transitSignal.transitBody} against {transitSignal.natalBody}</p>
                            <p>
                              This pattern can make growth feel urgent and control feel justified. The better use of it is strategic pacing, not overreach.
                            </p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : null}
                {activeForecast === "yearly" ? (
                  forecastParagraphs.length ? (
                    forecastParagraphs.map((paragraph, index) => <p key={`${activeForecast}-${index}`}>{renderMove(paragraph)}</p>)
                  ) : (
                    <p>Choose a timeframe to load the reading.</p>
                  )
                ) : null}
              </div>

              {transitSignal && activeForecast === "daily" ? (
                <div className="live-callout-card live-daily-move">
                  <p className="reading-kicker">Your move</p>
                  <p>
                    {moveText ||
                      "Expect stronger reactions where confidence and control overlap. The cleanest move today is to pace decisions instead of forcing certainty too early."}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="live-big-three live-editorial-panel-wide">
              <div className="live-section-label">
                <span />
                <p>Your core placements</p>
                <span />
              </div>
              <p className="live-bridge-copy">
                These three placements show how you move through the world, how you process experience, and how other people read you before much is said. Read them together, because this is where the chart becomes personal instead of theoretical.
              </p>
              <div className="live-coordinate-grid">
                {bigThreeCards.map((item) => (
                  <article key={item.kicker} className="live-coordinate-card">
                    <p className="reading-kicker">{item.kicker}</p>
                    <h2>{item.headline}</h2>
                    <p>{item.content}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="live-editorial-panel">
              <p className="reading-kicker">The wider atmosphere</p>
              <h2>{globalClimate.headline}</h2>
              <p>{globalClimate.body}</p>
              {globalClimate.metadata ? <p className="live-inline-metadata">{globalClimate.metadata}</p> : null}
            </section>

            <section className="live-editorial-panel live-architecture-panel">
              <div className="live-panel-topline">
                <p className="reading-kicker">Your cosmic architecture</p>
              </div>
              {chartSummaryParagraphs.length ? (
                chartSummaryParagraphs.map((paragraph, index) => <p key={`summary-${index}`}>{renderMove(paragraph)}</p>)
              ) : (
                <p>Your chart summary will appear here once the calculation is complete.</p>
              )}
              <div className="live-metadata-footer">
                <div>
                  <span>Calculated origin</span>
                  <strong>{chart?.chart?.birth?.place ?? "Birth place pending"}</strong>
                </div>
                <div>
                  <span>Reading for</span>
                  <strong>{memberLabel}</strong>
                </div>
              </div>
            </section>

            <section className="live-blueprint-panel live-editorial-panel-wide">
              <p className="reading-kicker">Premium publication</p>
              <h2>The 2026 Yearly Blueprint</h2>
              <p>
                A long-form reading that maps the year&apos;s major turning points against your exact chart, so your bigger decisions have a stronger frame around them.
              </p>
              <button className="live-blueprint-button" type="button" onClick={() => void beginCheckout("yearly_blueprint")}>
                Unlock Blueprint - {blueprintPrice}
              </button>
            </section>

            <section className="live-editorial-panel live-editorial-panel-wide">
              <div className="live-panel-topline">
                <p className="reading-kicker">Cosmic Pass</p>
                <p className="live-inline-metadata">
                  {entitlements?.premiumActive
                    ? `Active${entitlements.expiresAt ? ` through ${new Date(entitlements.expiresAt).toLocaleDateString()}` : ""}`
                    : "Membership inactive"}
                </p>
              </div>
              <h2>Choose how much of the system you want open all the time.</h2>
              <div className="live-chip-row">
                <button type="button" onClick={() => void beginCheckout("monthly_pass")}>
                  Monthly Pass - $14.99
                </button>
                <button type="button" onClick={() => void beginCheckout("annual_pass")}>
                  Annual Pass - $99
                </button>
                <button type="button" onClick={() => void beginCheckout("lovescope_unlock")}>
                  LoveScope - $2.99
                </button>
                <button type="button" onClick={() => void beginCheckout("starscope_unlock")}>
                  StarScope - $3.99
                </button>
              </div>
            </section>
          </div>

          {toolStatus ? <p className="live-subtle">{toolStatus}</p> : null}
          {error ? <p className="live-error">{error}</p> : null}

          <div className="demo-footer-actions">
            <button
              className="button-secondary"
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
                }
                setAccessToken(null);
                setChart(null);
                setEntitlements(null);
                setForecasts({});
                setPhase("auth");
              }}
            >
              Change account
            </button>
            <a className="button-primary" href="/">
              Return to overview
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

  const payload = (await response.json().catch(() => null)) as
    | { details?: { error_code?: string; msg?: string }; message?: string }
    | T
    | null;
  if (!response.ok) {
    throw new Error(describeRequestError(response.status, payload as { details?: { error_code?: string; msg?: string }; message?: string } | null));
  }

  return payload as T;
}

function describeRequestError(
  status: number,
  payload: { details?: { error_code?: string; msg?: string }; message?: string } | null
) {
  const errorCode = payload?.details?.error_code ?? "";
  const message = payload?.message?.trim() || payload?.details?.msg?.trim();

  if (errorCode === "user_already_exists") {
    return "An account with this email already exists. Log in instead.";
  }

  if (status === 400 && message) {
    return message;
  }

  if (status === 401) {
    return "That login did not go through. Check your email and password, then try again.";
  }

  return message || `Request failed with ${status}`;
}
