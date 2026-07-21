"use client";

import { useEffect, useMemo, useState } from "react";
import { API_PATHS, type ProductKey } from "@cosmoscope/api";
import { resolveTodaysBriefData, type StructuredDailyBrief } from "../components/todaysBriefData";
import { resolveCosmoScopeApiBaseUrl } from "../lib/apiBaseUrl";

type Mode = "signup" | "login";
type Phase = "auth" | "loading" | "member";
type ForecastTimeframe = "daily" | "weekly" | "monthly" | "yearly";
type SignupStep = "welcome" | "name" | "account" | "birthDate" | "birthTime" | "birthPlace" | "review";
type Meridiem = "AM" | "PM";

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
  structuredDailyBrief?: StructuredDailyBrief | null;
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

type ChartPlacementSummary = {
  body: "Sun" | "Moon" | "Rising";
  degreeLabel: string;
  sign: string;
};

const SESSION_STORAGE_KEY = "cosmoscope-access-token";
const signupSteps: SignupStep[] = ["welcome", "name", "account", "birthDate", "birthTime", "birthPlace", "review"];
const forecastLabels: Record<ForecastTimeframe, string> = {
  daily: "Today’s Brief",
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year"
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

function formatDegree(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${Math.round(value)}°`;
}

function findPlanetPlacement(planets: Placement[], body: "Sun" | "Moon") {
  return planets.find((placement) => placement.body.toLowerCase() === body.toLowerCase());
}

function buildChartPlacements(chart: ChartResponse | null): ChartPlacementSummary[] {
  const planets = chart?.chart?.planets ?? [];
  const sun = findPlanetPlacement(planets, "Sun");
  const moon = findPlanetPlacement(planets, "Moon");
  const rising = chart?.chart?.wheel?.ascendant ?? null;

  return [
    {
      body: "Sun",
      degreeLabel: formatDegree(sun?.degreeInSign),
      sign: chart?.chart?.bigThree?.sun ?? sun?.sign ?? "Pending"
    },
    {
      body: "Moon",
      degreeLabel: formatDegree(moon?.degreeInSign),
      sign: chart?.chart?.bigThree?.moon ?? moon?.sign ?? "Pending"
    },
    {
      body: "Rising",
      degreeLabel: formatDegree(rising?.degreeInSign),
      sign: chart?.chart?.bigThree?.rising ?? rising?.sign ?? "Pending"
    }
  ];
}

function buildChartSummaryLine(placements: ChartPlacementSummary[]) {
  const signs = placements.map((placement) => placement.sign).filter((sign) => sign && sign !== "Pending");
  if (signs.length < 3) {
    return "Your chart summary will sharpen once the full chart calculation is available.";
  }

  return `You’re working with ${signs[0]} drive, ${signs[1]} emotional timing, and ${signs[2]} presentation. Read together, they show how you choose, react, and enter the room.`;
}

function placementIcon(body: ChartPlacementSummary["body"]) {
  if (body === "Moon") {
    return "☾";
  }
  if (body === "Rising") {
    return "♒";
  }
  return "☉";
}

function MiniChartWheel({ placements }: { placements: ChartPlacementSummary[] }) {
  return (
    <svg className="live-chart-wheel" viewBox="0 0 220 220" role="img" aria-label="Compact natal chart wheel">
      <circle className="live-wheel-ring live-wheel-ring-outer" cx="110" cy="110" r="96" />
      <circle className="live-wheel-ring" cx="110" cy="110" r="72" />
      <circle className="live-wheel-ring live-wheel-ring-inner" cx="110" cy="110" r="36" />
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 110 + Math.cos(angle) * 72;
        const y1 = 110 + Math.sin(angle) * 72;
        const x2 = 110 + Math.cos(angle) * 96;
        const y2 = 110 + Math.sin(angle) * 96;
        return <line key={index} className="live-wheel-spoke" x1={x1} x2={x2} y1={y1} y2={y2} />;
      })}
      <polyline
        className="live-wheel-aspect live-wheel-aspect-gold"
        points="110,34 174,142 52,86 168,78 80,176 110,34"
      />
      <polyline className="live-wheel-aspect live-wheel-aspect-teal" points="52,86 110,186 188,110 52,86" />
      {placements.map((placement, index) => {
        const angle = (index / placements.length) * Math.PI * 2 - Math.PI / 2;
        const x = 110 + Math.cos(angle) * 82;
        const y = 110 + Math.sin(angle) * 82;
        return (
          <g key={placement.body}>
            <circle className="live-wheel-point" cx={x} cy={y} r="7" />
            <text className="live-wheel-label" x={x} y={y + 4} textAnchor="middle">
              {placement.body.slice(0, 1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
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
      ["Friday", "People become easier to read. Use the day for repair, not correction."],
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

function requireResolvedBirthLocation(selectedLocation: GeocodeResult | ResolvedBirthLocation | null): ResolvedBirthLocation {
  if (!selectedLocation) {
    throw new Error("Choose the birthplace that matches you best.");
  }

  return {
    label: selectedLocation.label,
    latitude: selectedLocation.latitude,
    longitude: selectedLocation.longitude,
    timezone: selectedLocation.timezone
  };
}

function normalizeBirthDateForApi(month: string, day: string, year: string): string {
  const parsedMonth = parseWholeNumber(month);
  const parsedDay = parseWholeNumber(day);
  const parsedYear = parseWholeNumber(year);

  if (!parsedMonth || !parsedDay || !parsedYear || year.trim().length !== 4) {
    throw new Error("Enter a complete birth date.");
  }

  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
  const isValidDate =
    date.getFullYear() === parsedYear && date.getMonth() === parsedMonth - 1 && date.getDate() === parsedDay;

  if (!isValidDate || date > new Date()) {
    throw new Error("Enter a real birth date.");
  }

  return `${String(parsedYear).padStart(4, "0")}-${String(parsedMonth).padStart(2, "0")}-${String(parsedDay).padStart(2, "0")}`;
}

function normalizeBirthTimeForApi(hour: string, minute: string, meridiem: Meridiem, unknown: boolean): string {
  if (unknown) {
    return "12:00";
  }

  const parsedHour = parseWholeNumber(hour);
  const parsedMinute = parseWholeNumber(minute);

  if (!parsedHour || parsedMinute === null || parsedHour < 1 || parsedHour > 12 || parsedMinute < 0 || parsedMinute > 59) {
    throw new Error("Enter a complete birth time, or choose that you do not know it.");
  }

  const hour24 = meridiem === "AM" ? parsedHour % 12 : (parsedHour % 12) + 12;
  return `${String(hour24).padStart(2, "0")}:${String(parsedMinute).padStart(2, "0")}`;
}

function formatBirthDateForDisplay(month: string, day: string, year: string) {
  try {
    const value = normalizeBirthDateForApi(month, day, year);
    const [parsedYear, parsedMonth, parsedDay] = value.split("-").map(Number);
    return new Date(parsedYear, parsedMonth - 1, parsedDay).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return "Birth date incomplete";
  }
}

function formatBirthTimeForDisplay(hour: string, minute: string, meridiem: Meridiem, unknown: boolean) {
  if (unknown) {
    return "Exact birth time unknown";
  }

  try {
    normalizeBirthTimeForApi(hour, minute, meridiem, false);
    return `${String(parseWholeNumber(hour) ?? "").padStart(2, "0")}:${String(parseWholeNumber(minute) ?? 0).padStart(2, "0")} ${meridiem}`;
  } catch {
    return "Birth time incomplete";
  }
}

function parseWholeNumber(value: string) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  return Number(trimmed);
}

export function LiveExperience() {
  const [mode, setMode] = useState<Mode>("signup");
  const [signupStep, setSignupStep] = useState<SignupStep>("welcome");
  const [phase, setPhase] = useState<Phase>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthHour, setBirthHour] = useState("");
  const [birthMinute, setBirthMinute] = useState("");
  const [birthMeridiem, setBirthMeridiem] = useState<Meridiem>("AM");
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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showFullChart, setShowFullChart] = useState(false);

  const memberLabel = useMemo(() => {
    return normalizeMemberLabel(displayName, email);
  }, [displayName, email]);

  const firstName = useMemo(() => {
    return memberLabel.split(/\s+/)[0] || "Member";
  }, [memberLabel]);

  const signupStepIndex = signupSteps.indexOf(signupStep);
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
      setSignupStep("welcome");
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
      void request<{ entitlement: EntitlementsResponse; productKey: string }>(API_PATHS.confirmCheckoutSession, {
        body: JSON.stringify({ sessionId }),
        headers: authHeaders(accessToken),
        method: "POST"
      })
        .then((payload) => {
          setEntitlements(payload.entitlement);
          if (payload.productKey === "tip_jar") {
            setToolStatus("Thank you for supporting CosmoScope.");
          }
          return hydrateMember(accessToken);
        })
        .then(() => {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("checkout");
          cleanUrl.searchParams.delete("session_id");
          window.history.replaceState({}, "", cleanUrl.toString());
          setToolStatus((current) => current ?? "Payment confirmed.");
        })
        .catch((caught) => {
          setError(caught instanceof Error ? caught.message : "We could not confirm the payment yet.");
          setToolStatus(null);
        });
    }

    if (checkout === "cancel" || checkout === "cancelled" || checkout === "canceled" || checkout === "failed") {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("checkout");
      cleanUrl.searchParams.delete("session_id");
      cleanUrl.searchParams.delete("product");
      window.history.replaceState({}, "", cleanUrl.toString());
      setError(null);
      setToolStatus("Checkout was cancelled. Nothing was charged.");
    }
  }, [accessToken]);

  function clearHandledCheckoutParams() {
    if (typeof window === "undefined") {
      return;
    }

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete("checkout");
    cleanUrl.searchParams.delete("session_id");
    cleanUrl.searchParams.delete("product");
    window.history.replaceState({}, "", cleanUrl.toString());
  }

  function clearLocalSession(message: string | null = null) {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      clearHandledCheckoutParams();
    }

    setMode("login");
    setSignupStep("welcome");
    setPhase("auth");
    setEmail("");
    setPassword("");
    setDisplayName("");
    setBirthPlace("");
    setBirthMonth("");
    setBirthDay("");
    setBirthYear("");
    setBirthHour("");
    setBirthMinute("");
    setBirthMeridiem("AM");
    setUnknownBirthTime(false);
    setGeocodeResults([]);
    setSelectedLocation(null);
    setLocationStatus("idle");
    setAccessToken(null);
    setChart(null);
    setEntitlements(null);
    setForecasts({});
    setActiveForecast("daily");
    setStarQuestion("What deserves my cleanest attention this week?");
    setStarScope(null);
    setPartnerName("Alex");
    setRelationshipType("Dating");
    setLoveSituation("The connection is strong, but the expectations are not fully named.");
    setLoveScope(null);
    setError(null);
    setToolStatus(message);
    setIsDeletingAccount(false);
    setShowFullChart(false);
  }

  function handleSignOut() {
    clearLocalSession("You have been signed out on this device.");
  }

  async function handleLocationSearch() {
    setSelectedLocation(null);

    const query = birthPlace.trim();
    if (query.length < 3) {
      setGeocodeResults([]);
      setLocationStatus("idle");
      setError("Enter a city or town first, like Marietta, Georgia.");
      return;
    }

    setError(null);
    setToolStatus(null);
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
        setToolStatus("Birthplace found.");
      } else if (payload.results.length > 1) {
        setToolStatus("Choose the birthplace that matches you best.");
      }
    } catch {
      setGeocodeResults([]);
      setLocationStatus("idle");
      setError("We could not find that place yet. Try city and state, like Marietta, Georgia.");
    }
  }

  async function resolveBirthLocationForSignup(): Promise<ResolvedBirthLocation> {
    if (selectedLocation) {
      return requireResolvedBirthLocation(selectedLocation);
    }

    const query = birthPlace.trim();

    if (query.length < 3) {
      throw new Error("Enter a city or town first, like Marietta, Georgia.");
    }

    setLocationStatus("searching");
    setToolStatus("Finding your birthplace...");

    let payload: { results: GeocodeResult[] };
    try {
      payload = await request<{ results: GeocodeResult[] }>(API_PATHS.geocode, {
        body: JSON.stringify({ query }),
        method: "POST"
      });
    } catch {
      throw new Error("We could not find that place yet. Try city and state, like Marietta, Georgia.");
    }

    setGeocodeResults(payload.results);
    setLocationStatus("ready");

    const bestMatch = payload.results[0];

    if (!bestMatch) {
      throw new Error("No birthplace matches came back. Try adding the state or country.");
    }

    if (payload.results.length > 1) {
      setToolStatus("Choose the birthplace that matches you best.");
      throw new Error("Choose the birthplace that matches you best.");
    }

    setSelectedLocation(bestMatch);
    setBirthPlace(bestMatch.label);
    setToolStatus(null);

    return requireResolvedBirthLocation(bestMatch);
  }

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setToolStatus(null);
  }

  function moveSignupBack() {
    setError(null);
    setToolStatus(null);
    const previousStep = signupSteps[Math.max(signupStepIndex - 1, 0)];
    setSignupStep(previousStep);
  }

  async function handleSignupContinue() {
    setError(null);
    setToolStatus(null);

    try {
      if (signupStep === "welcome") {
        setSignupStep("name");
        return;
      }

      if (signupStep === "name") {
        if (!displayName.trim()) {
          setError("Enter the name you want CosmoScope to use.");
          return;
        }
        setSignupStep("account");
        return;
      }

      if (signupStep === "account") {
        if (!email.trim() || !email.includes("@")) {
          setError("Enter a working email address.");
          return;
        }
        if (password.trim().length < 6) {
          setError("Choose a password with at least 6 characters.");
          return;
        }
        setSignupStep("birthDate");
        return;
      }

      if (signupStep === "birthDate") {
        normalizeBirthDateForApi(birthMonth, birthDay, birthYear);
        setSignupStep("birthTime");
        return;
      }

      if (signupStep === "birthTime") {
        normalizeBirthTimeForApi(birthHour, birthMinute, birthMeridiem, unknownBirthTime);
        setSignupStep("birthPlace");
        return;
      }

      if (signupStep === "birthPlace") {
        await resolveBirthLocationForSignup();
        setSignupStep("review");
        return;
      }

      await handleSubmit();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check this step and try again.");
      setToolStatus(null);
    }
  }

  async function handleSubmit() {
    setError(null);
    setToolStatus(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    let normalizedBirthDate = "";
    let normalizedBirthTime = "";

    try {
      normalizedBirthDate = mode === "signup" ? normalizeBirthDateForApi(birthMonth, birthDay, birthYear) : "";
      normalizedBirthTime =
        mode === "signup" ? normalizeBirthTimeForApi(birthHour, birthMinute, birthMeridiem, unknownBirthTime) : "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Check the birth details and try again.");
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
                birthTime: normalizedBirthTime,
                displayName: displayName.trim(),
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
      await hydrateMember(token, resolvedBirthLocation, normalizedBirthDate, normalizedBirthTime, unknownBirthTime);
      setPhase("member");
    } catch (caught) {
      setError(
        mode === "signup"
          ? "We could not open your CosmoScope yet. Check the details and try again."
          : caught instanceof Error
            ? caught.message
            : "Unable to log in."
      );
      setPhase("auth");
    }
  }

  async function hydrateMember(
    token: string,
    birthLocationOverride: ResolvedBirthLocation | null = null,
    birthDateOverride = "",
    birthTimeOverride = "",
    unknownBirthTimeOverride = unknownBirthTime
  ) {
    const chartLocation = birthLocationOverride ?? selectedLocation;

    const chartResponse = await request<ChartResponse>(API_PATHS.chart, {
      body: JSON.stringify(
        chartLocation
          ? {
              birthDate: birthDateOverride,
              birthPlace: chartLocation.label,
              birthTime: birthTimeOverride,
              latitude: chartLocation.latitude,
              longitude: chartLocation.longitude,
              timezone: chartLocation.timezone,
              timezoneOffset: null,
              unknownBirthTime: unknownBirthTimeOverride
            }
          : {}
      ),
      headers: authHeaders(token),
      method: "POST"
    });

    const entitlementsResponse = await request<EntitlementsResponse>(API_PATHS.entitlements, {
      headers: authHeaders(token),
      method: "GET"
    });

    setChart(chartResponse);
    setEntitlements(entitlementsResponse);
    setForecasts({});

    const chartBirth = chartResponse.chart?.birth;
    const chartBirthFields = chartBirth as Record<string, unknown> | undefined;

    const storedBirthDate =
      typeof chartBirthFields?.date === "string"
        ? chartBirthFields.date
        : typeof chartBirthFields?.birthDate === "string"
          ? chartBirthFields.birthDate
          : "";

    const storedBirthTime =
      typeof chartBirthFields?.time === "string"
        ? chartBirthFields.time
        : typeof chartBirthFields?.birthTime === "string"
          ? chartBirthFields.birthTime
          : "";

    const storedBirthPlace = typeof chartBirthFields?.place === "string" ? chartBirthFields.place : "";
    const storedLatitude = typeof chartBirthFields?.latitude === "number" ? chartBirthFields.latitude : null;
    const storedLongitude = typeof chartBirthFields?.longitude === "number" ? chartBirthFields.longitude : null;
    const storedTimezone = typeof chartBirthFields?.timezone === "string" ? chartBirthFields.timezone : "";
    const storedUnknownBirthTime =
      typeof chartBirthFields?.unknownBirthTime === "boolean" ? chartBirthFields.unknownBirthTime : false;

    const dailyForecastPayload =
      chartLocation && birthDateOverride && birthTimeOverride
        ? {
            timeframe: "daily" as const,
            birthDate: birthDateOverride,
            birthPlace: chartLocation.label,
            birthTime: birthTimeOverride,
            latitude: chartLocation.latitude,
            longitude: chartLocation.longitude,
            timezone: chartLocation.timezone,
            timezoneOffset: null,
            unknownBirthTime: unknownBirthTimeOverride
          }
        : storedBirthDate && storedBirthTime && storedBirthPlace && storedLatitude !== null && storedLongitude !== null && storedTimezone
          ? {
              timeframe: "daily" as const,
              birthDate: storedBirthDate,
              birthPlace: storedBirthPlace,
              birthTime: storedBirthTime,
              latitude: storedLatitude,
              longitude: storedLongitude,
              timezone: storedTimezone,
              timezoneOffset: null,
              unknownBirthTime: storedUnknownBirthTime
            }
          : null;

    if (!dailyForecastPayload) {
      setToolStatus("Your chart is open. The live daily reading needs one more refresh to load.");
      return;
    }

    try {
      const dailyForecast = await request<ForecastResponse>(API_PATHS.forecast, {
        body: JSON.stringify(dailyForecastPayload),
        headers: authHeaders(token),
        method: "POST"
      });

      setForecasts({ daily: dailyForecast });
      setActiveForecast("daily");
      setToolStatus(null);
    } catch (caught) {
      console.warn("Daily forecast did not load during member hydration.", caught);
      setToolStatus("Your chart is open. Daily timing can be loaded from the Daily tab.");
    }
  }

  async function beginCheckout(productKey: ProductKey) {
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

  async function loadForecast(timeframe: ForecastTimeframe) {
    if (!accessToken) {
      return;
    }

    setActiveForecast(timeframe);
    setError(null);

    if (timeframe === "yearly") {
      setToolStatus("The Yearly Blueprint is coming soon.");
      return;
    }

    const birthForForecast = chart?.chart?.birth;

    if (!birthForForecast) {
      setToolStatus("Your chart is open. This reading needs one more refresh before it can load.");
      return;
    }

    const birthForForecastFields = birthForForecast as typeof birthForForecast & {
      date?: string;
      birthDate?: string;
      time?: string;
      birthTime?: string;
    };

    const forecastBirthDate = birthForForecastFields.date ?? birthForForecastFields.birthDate;
    const forecastBirthTime = birthForForecastFields.time ?? birthForForecastFields.birthTime;

    if (
      !forecastBirthDate ||
      !forecastBirthTime ||
      !birthForForecast.place ||
      birthForForecast.latitude === undefined ||
      birthForForecast.longitude === undefined ||
      !birthForForecast.timezone
    ) {
      setToolStatus("Your chart is open. This reading needs one more refresh before it can load.");
      return;
    }

    setToolStatus(`Loading ${timeframe} reading...`);

    try {
      const response = await request<ForecastResponse>(API_PATHS.forecast, {
        body: JSON.stringify({
          timeframe,
          birthDate: forecastBirthDate,
          birthPlace: birthForForecast.place,
          birthTime: forecastBirthTime,
          latitude: birthForForecast.latitude,
          longitude: birthForForecast.longitude,
          timezone: birthForForecast.timezone,
          timezoneOffset: null,
          unknownBirthTime: birthForForecast.unknownBirthTime
        }),
        headers: authHeaders(accessToken),
        method: "POST"
      });

      setForecasts((current) => ({ ...current, [timeframe]: response }));
      setToolStatus(null);
    } catch (caught) {
      console.warn(`${timeframe} forecast did not load.`, caught);
      setError(null);
      setToolStatus(`The live ${forecastLabels[timeframe]} did not load, so we are showing the built-in ${forecastLabels[timeframe]} view for now.`);
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

  async function handleDeleteAccount() {
    if (!accessToken || isDeletingAccount) {
      return;
    }

    const confirmed =
      typeof window !== "undefined" &&
      window.confirm(
        "Delete your CosmoScope account? This removes your login, chart, readings, and premium access from this account. This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    setIsDeletingAccount(true);
    setError(null);
    setToolStatus("Deleting account...");

    try {
      await request<void>(API_PATHS.deleteAccount, {
        headers: authHeaders(accessToken),
        method: "POST"
      });
      clearLocalSession("Your CosmoScope account has been deleted.");
    } catch (caught) {
      setIsDeletingAccount(false);
      setError(caught instanceof Error ? caught.message : "Unable to delete the account.");
      setToolStatus(null);
    }
  }

  const forecastTabs: ForecastTimeframe[] = ["daily", "weekly", "monthly", "yearly"];
  const activeForecastCopy = forecasts[activeForecast];
  const transitSignal = chart?.chart?.dominantTransit;
  const chartPlacements = buildChartPlacements(chart);
  const chartSummaryLine = buildChartSummaryLine(chartPlacements);
  const chartBigThree = chartPlacements.map((placement) => placement.sign).filter((sign) => sign && sign !== "Pending").join(" • ");
  const cleanedForecastContent = sanitizeUserFacingCopy(activeForecastCopy?.content, memberLabel);
  const forecastBody = cleanedForecastContent;
  const forecastParagraphs = splitParagraphs(forecastBody);
  const cleanedChartSummary = sanitizeUserFacingCopy(chart?.summary, memberLabel);
  const chartSummaryParagraphs = splitParagraphs(cleanedChartSummary);
  const globalClimate = buildGlobalClimateReading(transitSignal);
  const weeklySupport = buildWeeklySupport(chartBigThree, transitSignal);
  const monthlyNarrative = chunkSentences(
    forecastBody
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean),
    2
  );
  const isActiveSignupIntake = mode === "signup" && signupStep !== "welcome";
  const dailyBrief = resolveTodaysBriefData({
    content: cleanedForecastContent,
    fallbackHeadline:
      forecastParagraphs[0] ||
      `Today asks ${firstName} for steadier pacing and clearer choices.` ||
      "A clearer daily reading will appear here once the latest forecast finishes loading.",
    structuredDailyBrief: activeForecastCopy?.structuredDailyBrief ?? null
  });
  const dailyReadingParagraphs = dailyBrief.whyTodayFeelsThisWay.length ? dailyBrief.whyTodayFeelsThisWay : forecastParagraphs;
  const monthlyFallback = [
    "This month asks for clearer structure around the routines, conversations, and decisions that carry the most weight.",
    "Use the larger pattern as a pacing guide. The goal is not to force certainty, but to notice which commitments deserve more care before they expand."
  ];
  const horizonParagraphs =
    activeForecast === "weekly"
      ? forecastParagraphs.length
        ? forecastParagraphs
        : [weeklySupport.opening, weeklySupport.middle, weeklySupport.closing]
      : activeForecast === "monthly"
        ? monthlyNarrative.length
          ? monthlyNarrative
          : forecastParagraphs.length
            ? forecastParagraphs
            : monthlyFallback
        : [];

  return (
    <main className="live-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
        <a className="button-secondary" href="/beta-feedback">
          Share feedback
        </a>
      </header>

      {phase === "auth" ? (
        <section className={`live-auth fade-up${isActiveSignupIntake ? " live-auth--intake" : ""}`}>
          <div className="live-auth-copy">
            <p className="timestamp">Personal astrological guidance from exact birth data.</p>
            <h1 className="demo-hero">
              <span>Understand today&apos;s astrological weather.</span>
              <span>Know how to move through it.</span>
            </h1>
            <p className="live-note">
              CosmoScope connects your natal chart with the current sky to show what deserves your attention today -
              and how to meet it with greater clarity, confidence, and calm.
            </p>
          </div>

          <form
            className={`live-form${isActiveSignupIntake ? " live-form--active-intake" : ""}`}
            onSubmit={(event) => {
              event.preventDefault();
              void (mode === "signup" ? handleSignupContinue() : handleSubmit());
            }}
          >
            <div className="live-celestial-mark" aria-hidden="true">
              <span />
            </div>
            <div className="mode-row" role="tablist" aria-label="Account mode">
              <button
                aria-selected={mode === "signup"}
                className={mode === "signup" ? "is-active" : ""}
                type="button"
                onClick={() => handleModeChange("signup")}
              >
                Create account
              </button>
              <button
                aria-selected={mode === "login"}
                className={mode === "login" ? "is-active" : ""}
                type="button"
                onClick={() => handleModeChange("login")}
              >
                Log in
              </button>
            </div>

            {mode === "signup" ? (
              <>
                <div className="live-intake-progress" aria-label={`Step ${signupStepIndex + 1} of ${signupSteps.length}`}>
                  <span>Step {signupStepIndex + 1} of {signupSteps.length}</span>
                  <div>
                    {signupSteps.map((step) => (
                      <i key={step} className={signupSteps.indexOf(step) <= signupStepIndex ? "is-active" : ""} />
                    ))}
                  </div>
                </div>

                {signupStep === "welcome" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Private intake</p>
                    <h2>Let&apos;s build your CosmoScope.</h2>
                    <p>We&apos;ll ask for the essentials one step at a time, then open your private reading.</p>
                  </section>
                ) : null}

                {signupStep === "name" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Name</p>
                    <h2>What should the CosmoScope call you?</h2>
                    <p className="live-step-help">This personalizes how your guidance speaks to you.</p>
                    <label className="demo-field live-field">
                      <span>Display name</span>
                      <input
                        autoComplete="given-name"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Jeff"
                      />
                    </label>
                  </section>
                ) : null}

                {signupStep === "account" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Account</p>
                    <h2>Where should we save your reading?</h2>
                    <p className="live-step-help">Your chart and readings stay connected to your private account.</p>
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
                        autoComplete="new-password"
                        minLength={6}
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 6 characters"
                      />
                    </label>
                  </section>
                ) : null}

                {signupStep === "birthDate" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Birth date</p>
                    <h2>When did you arrive?</h2>
                    <p className="live-step-help">Your birth date establishes the planetary pattern you were born under.</p>
                    <div className="live-three-col">
                      <label className="demo-field live-field">
                        <span>Month</span>
                        <input
                          inputMode="numeric"
                          maxLength={2}
                          value={birthMonth}
                          onChange={(event) => setBirthMonth(event.target.value)}
                          placeholder="11"
                        />
                      </label>
                      <label className="demo-field live-field">
                        <span>Day</span>
                        <input
                          inputMode="numeric"
                          maxLength={2}
                          value={birthDay}
                          onChange={(event) => setBirthDay(event.target.value)}
                          placeholder="30"
                        />
                      </label>
                      <label className="demo-field live-field">
                        <span>Year</span>
                        <input
                          inputMode="numeric"
                          maxLength={4}
                          value={birthYear}
                          onChange={(event) => setBirthYear(event.target.value)}
                          placeholder="1983"
                        />
                      </label>
                    </div>
                  </section>
                ) : null}

                {signupStep === "birthTime" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Birth time</p>
                    <h2>About what time?</h2>
                    <p className="live-step-help">
                      Your birth time helps calculate your Rising sign and the houses of your chart.
                    </p>
                    <div className="live-three-col">
                      <label className="demo-field live-field">
                        <span>Hour</span>
                        <input
                          disabled={unknownBirthTime}
                          inputMode="numeric"
                          maxLength={2}
                          value={birthHour}
                          onChange={(event) => setBirthHour(event.target.value)}
                          placeholder="9"
                        />
                      </label>
                      <label className="demo-field live-field">
                        <span>Minute</span>
                        <input
                          disabled={unknownBirthTime}
                          inputMode="numeric"
                          maxLength={2}
                          value={birthMinute}
                          onChange={(event) => setBirthMinute(event.target.value)}
                          placeholder="07"
                        />
                      </label>
                      <label className="demo-field live-field">
                        <span>AM/PM</span>
                        <select
                          disabled={unknownBirthTime}
                          value={birthMeridiem}
                          onChange={(event) => setBirthMeridiem(event.target.value as Meridiem)}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </label>
                    </div>
                    <label className="demo-toggle live-intake-toggle">
                      <input
                        checked={unknownBirthTime}
                        type="checkbox"
                        onChange={(event) => setUnknownBirthTime(event.target.checked)}
                      />
                      I don&apos;t know my exact birth time.
                    </label>
                    <p className="live-step-note">You can continue without it, but some chart details will be less precise.</p>
                  </section>
                ) : null}

                {signupStep === "birthPlace" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Birth place</p>
                    <h2>Where did your story begin?</h2>
                    <p className="live-step-help">
                      Your birthplace supplies the coordinates and time zone needed to calculate your chart accurately.
                    </p>
                    <label className="demo-field live-field">
                      <span>City, state, or country</span>
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
                          setToolStatus(null);
                        }}
                        placeholder="Marietta, Georgia"
                      />
                    </label>
                    <button
                      className="button-secondary live-location-search-button"
                      type="button"
                      onClick={() => void handleLocationSearch()}
                    >
                      Find my birthplace
                    </button>
                    {locationStatus === "searching" ? <p className="live-subtle">Finding your birthplace...</p> : null}
                    {locationStatus === "ready" && !geocodeResults.length ? (
                      <p className="live-subtle">No match yet. Try adding the state or country.</p>
                    ) : null}
                    {geocodeResults.length ? (
                      <div className="live-suggestion-list" aria-label="Birthplace matches">
                        {geocodeResults.map((result) => (
                          <button
                            key={result.id}
                            className={selectedLocation?.id === result.id ? "is-selected" : ""}
                            type="button"
                            onClick={() => {
                              setSelectedLocation(result);
                              setBirthPlace(result.label);
                              setError(null);
                              setToolStatus("Birthplace selected.");
                            }}
                          >
                            <strong>{result.label}</strong>
                            <span>Use this birthplace</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {selectedLocation ? <p className="live-subtle">Selected: {selectedLocation.label}</p> : null}
                  </section>
                ) : null}

                {signupStep === "review" ? (
                  <section className="live-intake-step">
                    <p className="reading-kicker">Review</p>
                    <h2>Ready to open your CosmoScope.</h2>
                    <p className="live-step-help">
                      Check these details carefully. Small differences in time or place can change parts of your chart.
                    </p>
                    <div className="live-review-list">
                      <div>
                        <span>Name</span>
                        <strong>{displayName.trim()}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{email.trim()}</strong>
                      </div>
                      <div>
                        <span>Birth date</span>
                        <strong>{formatBirthDateForDisplay(birthMonth, birthDay, birthYear)}</strong>
                      </div>
                      <div>
                        <span>Birth time</span>
                        <strong>{formatBirthTimeForDisplay(birthHour, birthMinute, birthMeridiem, unknownBirthTime)}</strong>
                      </div>
                      <div>
                        <span>Birth place</span>
                        <strong>{selectedLocation?.label ?? birthPlace.trim()}</strong>
                      </div>
                    </div>
                  </section>
                ) : null}
              </>
            ) : (
              <>
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
                    autoComplete="current-password"
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
                  />
                </label>
              </>
            )}

            {error ? <p className="live-error">{error}</p> : null}
            {toolStatus ? <p className="live-subtle">{toolStatus}</p> : null}

            {mode === "login" ? (
              <button className="live-text-button" type="button" onClick={() => void sendResetLink()}>
                Forgot password?
              </button>
            ) : null}

            {mode === "signup" ? (
              <div className="live-intake-actions">
                {signupStepIndex > 0 ? (
                  <button className="button-secondary" type="button" onClick={moveSignupBack}>
                    Back
                  </button>
                ) : null}
                <button className="button-primary" type="submit">
                  {signupStep === "welcome"
                    ? "Build my CosmoScope"
                    : signupStep === "review"
                      ? "Open my CosmoScope"
                      : "Continue"}
                </button>
              </div>
            ) : (
              <button className="button-primary" type="submit">
                Log in and continue
              </button>
            )}
          </form>
        </section>
      ) : null}

      {phase === "loading" ? (
        <section className="demo-screen demo-loading fade-up" aria-live="polite">
          <p className="caption">Preparing your file</p>
          <h1 className="demo-loading-text">Calculating your chart and current climate</h1>
          <p className="demo-body">We are preparing your chart, reading today’s sky, and opening your private brief.</p>
        </section>
      ) : null}

      {phase === "member" ? (
        <section className="live-member live-member--dashboard fade-up">
          <header className="live-dashboard-header">
            <a className="live-dashboard-brand" href="/">
              <span aria-hidden="true">✶</span>
              <strong>CosmoScope</strong>
            </a>
            <div className="live-dashboard-header-actions">
              <span className="live-profile-chip" aria-label={`Signed in as ${memberLabel}`}>
                {firstName.slice(0, 1).toUpperCase()}
              </span>
              <button className="live-menu-button" type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </header>

          <nav className="live-time-selector" role="tablist" aria-label="Reading time horizon">
            {forecastTabs.map((timeframe) => {
              const isYearly = timeframe === "yearly";
              return (
                <button
                  key={timeframe}
                  aria-selected={activeForecast === timeframe}
                  className={activeForecast === timeframe ? "is-active" : ""}
                  disabled={isYearly}
                  role="tab"
                  type="button"
                  onClick={() => void loadForecast(timeframe)}
                >
                  <span>{forecastLabels[timeframe]}</span>
                  {isYearly ? <em>Coming Soon</em> : null}
                </button>
              );
            })}
          </nav>

          <div className="live-dashboard-content">
            {activeForecast === "daily" ? (
              <section className="live-primary-brief" aria-labelledby="today-brief-title">
                <div className="live-primary-brief-copy">
                  <p className="reading-kicker">{formatEffectiveLabel(activeForecastCopy?.effectiveDate, activeForecast)}</p>
                  <h1 id="today-brief-title">{dailyBrief.headline}</h1>
                  <div className="live-brief-paragraphs">
                    {dailyReadingParagraphs.slice(0, 3).map((paragraph, index) => (
                      <p key={`daily-brief-${index}`}>{renderMove(paragraph)}</p>
                    ))}
                  </div>
                  <div className="live-consider-today">
                    <span aria-hidden="true">✶</span>
                    <div>
                      <p className="reading-kicker">Consider today</p>
                      <p>{dailyBrief.yourMove}</p>
                    </div>
                  </div>
                </div>
                <div className="live-primary-brief-art" aria-hidden="true" />
              </section>
            ) : (
              <section className="live-horizon-reading" aria-labelledby="horizon-reading-title">
                <div className="live-horizon-head">
                  <div>
                    <p className="reading-kicker">{activeForecast === "weekly" ? "Week ahead" : "Month ahead"}</p>
                    <h1 id="horizon-reading-title">{forecastLabels[activeForecast]}</h1>
                  </div>
                  <p>{formatEffectiveLabel(activeForecastCopy?.effectiveDate, activeForecast)}</p>
                </div>
                <div className="live-horizon-copy">
                  {horizonParagraphs.map((paragraph, index) => (
                    <p key={`${activeForecast}-copy-${index}`}>{renderMove(paragraph)}</p>
                  ))}
                </div>
                {activeForecast === "weekly" && !forecastParagraphs.length ? (
                  <div className="live-week-list">
                    {weeklySupport.themes.map(([day, theme]) => (
                      <div key={day}>
                        <strong>{day}</strong>
                        <p>{theme}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                {activeForecast === "monthly" && transitSignal ? (
                  <div className="live-transit-note">
                    <p className="reading-kicker">{transitSignal.transitBody} / {transitSignal.natalBody}</p>
                    <p>Use this timing as context for pacing, not as a verdict about what must happen.</p>
                  </div>
                ) : null}
              </section>
            )}

            <section className="live-chart-summary" aria-labelledby="chart-summary-title">
              <div className="live-chart-summary-copy">
                <p className="reading-kicker">Your chart</p>
                <h2 id="chart-summary-title">Your core placements</h2>
                <div className="live-placement-list">
                  {chartPlacements.map((placement) => (
                    <div key={placement.body} className="live-placement-row">
                      <span aria-hidden="true">{placementIcon(placement.body)}</span>
                      <strong>{placement.body} in {placement.sign}</strong>
                      <em>{placement.degreeLabel}</em>
                    </div>
                  ))}
                </div>
                <p>{chartSummaryLine}</p>
                <button className="live-inline-link" type="button" onClick={() => setShowFullChart((value) => !value)}>
                  {showFullChart ? "Hide full chart" : "View full chart"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <div className="live-chart-wheel-wrap">
                <MiniChartWheel placements={chartPlacements} />
              </div>
              {showFullChart ? (
                <div className="live-chart-details">
                  {chartSummaryParagraphs.length ? (
                    chartSummaryParagraphs.map((paragraph, index) => <p key={`summary-${index}`}>{renderMove(paragraph)}</p>)
                  ) : (
                    <p>Your chart summary will sharpen as the calculation finishes.</p>
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
                </div>
              ) : null}
            </section>

            <div className="live-dashboard-lower">
              <section className="live-support-card">
                <p className="reading-kicker">Support CosmoScope</p>
                <h2>Enjoying CosmoScope?</h2>
                <p>
                  If today&apos;s reading helped you feel a little more prepared for the day ahead, and you&apos;d like to support the continued development of CosmoScope, you&apos;re welcome to leave a tip.
                </p>
                <button className="live-tip-button" type="button" onClick={() => void beginCheckout("tip_jar")}>
                  Leave a Tip
                  <span aria-hidden="true">♡</span>
                </button>
                <p className="live-support-note">Your support helps keep CosmoScope independent and ad-free.</p>
              </section>

              <section className="live-about-card">
                <p className="reading-kicker">About CosmoScope</p>
                <p>
                  CosmoScope began as a personal project born from a lifelong fascination with astrology—not as a way to predict the future, but as a way to better understand the present.
                </p>
                <p>
                  I believe astrology is most useful when it helps us prepare rather than fear. The goal isn&apos;t certainty. It&apos;s awareness.
                </p>
                <p>
                  Every reading is designed to help you notice patterns, move through difficult moments with a little more intention, and appreciate the good ones while they&apos;re here.
                </p>
                <p>
                  Prepare. Don&apos;t predict.
                </p>
              </section>

              <section className="live-about-card">
                <p className="reading-kicker">About the Designer</p>
                <p>
                  Hi, I&apos;m Jeff.
                </p>
                <p>
                  I&apos;ve loved astrology for as long as I can remember. Over the years I found myself wishing there were an app that treated it with the same care that Apple brings to its products—thoughtful, beautiful, calm, and focused on the experience instead of the noise.
                </p>
                <p>
                  CosmoScope is my attempt to build that app.
                </p>
                <p>
                  Thank you for spending a few moments of your day here.
                </p>
                <p>
                  — Jeff
                </p>
              </section>

              <section className="live-account-panel">
                <p className="reading-kicker">Account</p>
                <p>Sign out clears this browser session. Delete account permanently removes this CosmoScope account.</p>
                <div className="live-account-actions">
                  <button className="button-secondary" type="button" onClick={handleSignOut}>
                    Sign out
                  </button>
                  <button
                    className="live-danger-button"
                    disabled={isDeletingAccount}
                    type="button"
                    onClick={() => void handleDeleteAccount()}
                  >
                    {isDeletingAccount ? "Deleting..." : "Delete account"}
                  </button>
                </div>
              </section>
            </div>

            {toolStatus ? <p className="live-status-line">{toolStatus}</p> : null}
            {error ? <p className="live-error">{error}</p> : null}
            <p className="live-dashboard-close">Prepare. Don&apos;t predict.</p>
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
  const response = await fetch(`${resolveCosmoScopeApiBaseUrl()}${path}`, {
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
