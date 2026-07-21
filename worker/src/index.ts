import {
  API_PATHS,
  type ChartRequest,
  type ConfirmCheckoutSessionRequest,
  type CreateCheckoutSessionRequest,
  type EntitlementSyncSource,
  EntitlementSnapshot,
  type ForecastRequest,
  type ForecastTimeframe,
  type GeocodeRequest,
  ProductKey,
  type StudioReadRequest,
  type StudioReadingResult,
  type VerifyAppleTransactionRequest
} from "@cosmoscope/api/contracts";
import { assertPromptOutput } from "@cosmoscope/api/prompts";
import { PREMIUM_PRODUCTS } from "@cosmoscope/api/products";
import type { EntitlementRow } from "@cosmoscope/db/types";
import * as Astronomy from "astronomy-engine";
import { WORKER_ROUTE_MANIFEST } from "./contracts";

type LoginPayload = {
  email?: string;
  password?: string;
};

type StarScopeRequest = {
  question?: string;
};

type DevReadingEngineV2SmokeRequest = {
  displayName?: string;
  iterations?: number;
  timeframe?: ForecastTimeframe;
};

type LoveScopeRequest = {
  partnerBirthDate?: string | null;
  partnerName?: string;
  relationshipType?: string;
  situation?: string;
};

type AdminPurgeUsersRequest = {
  emails?: string[];
};

type SignupPayload = LoginPayload & {
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
  displayName?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  timezoneOffset?: number;
  unknownBirthTime?: boolean;
};

type SupabaseUser = {
  email?: string;
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

type SessionPayload = {
  access_token?: string;
  expires_at?: number;
  expires_in?: number;
  refresh_token?: string;
  user?: SupabaseUser;
};

type SupabaseAuthPayload = SessionPayload & {
  session?: SessionPayload | null;
  user?: SupabaseUser | null;
};

type EntitlementsRow = {
  active_until: string | null;
  lovescope_unlocked: boolean;
  premium_active: boolean;
  premium_source: EntitlementRow["premium_source"];
  revenuecat_active: boolean;
  starscope_unlocked: boolean;
  stripe_active: boolean;
  updated_at: string;
  yearly_blueprint_unlocked: boolean;
  forecast_monthly_unlocked: boolean;
};

type ChartRow = {
  chart_json: unknown;
  chart_summary: string | null;
  created_at: string;
  source_version: string;
  updated_at: string;
};

type ProfileRow = {
  birth_date: string | null;
  birth_place: string | null;
  birth_time: string | null;
  display_name: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  timezone_offset: number | null;
  unknown_birth_time: boolean;
};

type ForecastRow = {
  content: string;
  created_at: string;
  effective_date: string;
  refreshed_at: string;
  timeframe: ForecastTimeframe;
};

type Env = {
  AI_READING_PROVIDER?: string;
  AI_READING_MODEL?: string;
  ENABLE_PAID_AI_SMOKE?: string;
  GEMINI_API_KEY?: string;
  APP_ENV?: string;
  APPLE_SERVER_NOTIFICATION_BEARER?: string;
  APP_URL?: string;
  ASTROLOGY_API_KEY?: string;
  CORS_ALLOWED_ORIGINS?: string;
  COSMOSCOPE_STUDIO_ACCESS_KEY?: string;
  ENABLE_AI_READINGS?: string;
  PAYMENTS_DISABLED_PREVIEW?: string;
  READING_ENGINE_VERSION?: string;
  STRIPE_SECRET_KEY?: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_URL: string;
};

class HttpError extends Error {
  readonly details?: unknown;
  readonly status: number;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const CHART_SOURCE_VERSION = "phase3-astrologyapi-v1";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: getCorsHeaders(request, env),
          status: 204
        });
      }

      const url = new URL(request.url);
      const path = url.pathname;
      const routeKey = `${request.method.toUpperCase()} ${path}`;

      switch (routeKey) {
        case "GET /":
        case "GET /health":
          return json({
            appEnv: env.APP_ENV ?? "development",
            ok: true,
            routes: WORKER_ROUTE_MANIFEST.length,
            service: "cosmoscope-api",
            supabaseConfigured: hasSupabaseEnv(env)
          });
        case "GET /api/manifest":
          return json({ routes: WORKER_ROUTE_MANIFEST });
        case `POST ${API_PATHS.login}`:
          return await handleLogin(request, env);
        case `POST ${API_PATHS.signup}`:
          return await handleSignup(request, env);
        case `POST ${API_PATHS.resetPassword}`:
          return await handleResetPassword(request, env);
        case `POST ${API_PATHS.updatePassword}`:
          return await handleUpdatePassword(request, env);
        case `POST ${API_PATHS.geocode}`:
          return await handleGeocode(request);
        case `POST ${API_PATHS.studioRead}`:
          return await handleStudioRead(request, env);
        case `POST ${API_PATHS.createCheckoutSession}`:
          return await handleCreateCheckoutSession(request, env);
        case `POST ${API_PATHS.confirmCheckoutSession}`:
          return await handleConfirmCheckoutSession(request, env);
        case `POST ${API_PATHS.deleteAccount}`:
          return await handleDeleteAccount(request, env);
        case `GET ${API_PATHS.entitlements}`:
          return await handleEntitlements(request, env);
        case `GET ${API_PATHS.ledger}`:
          return await handleLedger(request, env);
        case `POST ${API_PATHS.chart}`:
          return await handleChart(request, env);
        case `POST ${API_PATHS.starscope}`:
          return await handleStarScope(request, env);
        case `POST ${API_PATHS.lovescope}`:
          return await handleLoveScope(request, env);
        case `POST ${API_PATHS.forecast}`:
          return await handleForecast(request, env);
        case "POST /api/dev/reading-engine-v2-smoke":
          return await handleDevReadingEngineV2Smoke(request, env);
        case "POST /api/dev/reading-engine-v2-gemini-smoke":
          return await handleDevReadingEngineV2GeminiSmoke(request, env);
        case "POST /api/dev/reading-engine-v2-gemini-batch":
          return await handleDevReadingEngineV2GeminiBatch(request, env);
        case `POST ${API_PATHS.verifyAppleTransaction}`:
          return await handleVerifyAppleTransaction(request, env);
        case `POST ${API_PATHS.appleServerNotification}`:
          return await handleAppleServerNotification(request, env);
        default:
          return json(
            {
              error: "not_found",
              message: "Route not found."
            },
            { status: 404 },
            request,
            env
          );
      }
    } catch (error) {
      return handleError(error, request, env);
    }
  }
};

async function handleDeleteAccount(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${auth.user.id}`, {
    headers: serviceRoleHeaders(env),
    method: "DELETE"
  });

  await readSupabasePayload(response);

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to delete the account.");
  }

  return new Response(null, {
    headers: getCorsHeaders(request, env),
    status: 204
  });
}

async function handleEntitlements(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const query =
    "select=premium_active,premium_source,stripe_active,revenuecat_active,lovescope_unlocked,starscope_unlocked,forecast_monthly_unlocked,yearly_blueprint_unlocked,active_until,updated_at";
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/app_entitlements?${query}`, {
    headers: {
      ...userHeaders(env, auth.token),
      accept: "application/vnd.pgrst.object+json"
    }
  });

  const payload = await readSupabasePayload(response);

  if (response.status === 406) {
    return json(
      {
        activeSubscriptionProductKey: null,
        expiresAt: null,
        premiumActive: false,
        premiumSource: "none",
        revenueCatActive: false,
        sourceUpdatedAt: new Date(0).toISOString(),
        stripeActive: false,
        unlocks: {
          forecastMonthly: false,
          lovescope: false,
          starscope: false,
          yearlyBlueprint: false
        }
      } satisfies EntitlementSnapshot & { activeSubscriptionProductKey: ProductKey | null; sourceUpdatedAt: string }
    );
  }

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load entitlements.", payload);
  }

  const entitlements = payload as EntitlementsRow;

  return json(
    {
      activeSubscriptionProductKey: entitlements.premium_active ? inferSubscriptionProductKey(entitlements) : null,
      expiresAt: entitlements.active_until,
      premiumActive: entitlements.premium_active,
      premiumSource: entitlements.premium_source,
      revenueCatActive: entitlements.revenuecat_active,
      sourceUpdatedAt: entitlements.updated_at,
      stripeActive: entitlements.stripe_active,
      unlocks: {
        forecastMonthly: entitlements.forecast_monthly_unlocked,
        lovescope: entitlements.lovescope_unlocked,
        starscope: entitlements.starscope_unlocked,
        yearlyBlueprint: entitlements.yearly_blueprint_unlocked
      }
    } satisfies EntitlementSnapshot & { activeSubscriptionProductKey: ProductKey | null; sourceUpdatedAt: string }
  );
}

async function handleLedger(request: Request, env: Env) {
  assertSupabaseEnv(env);
  await authenticateRequest(request, env);
  return json(
    {
      message: "Ledger history is deprecated in the premium-entitlement model.",
      transactions: []
    },
    { status: 410 }
  );
}

async function handleGeocode(request: Request) {
  const body = await readJson<GeocodeRequest>(request);
  const query = requireString(body.query, "query");
  const payload = await fetchGeocodeResults(query);
  const fallbackQuery = query.split(",")[0]?.trim();
  const fallbackPayload =
    payload.results?.length || !fallbackQuery || fallbackQuery.toLowerCase() === query.toLowerCase()
      ? null
      : await fetchGeocodeResults(fallbackQuery);
  const places = (payload.results?.length ? payload.results : fallbackPayload?.results) ?? [];

  const results = places.slice(0, 5).map((place) => ({
    id: place.id,
    label: [place.name, place.admin1, place.country].filter(Boolean).join(", "),
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone ?? "UTC"
  }));

  return json({ results });
}

async function handleCreateCheckoutSession(request: Request, env: Env) {
  assertSupabaseEnv(env);
  assertStripeEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<CreateCheckoutSessionRequest>(request);
  const productKey = requireProductKey(body.productKey);
  const product = PREMIUM_PRODUCTS[productKey];

  if (!product.stripePriceLookupKey) {
    throw new HttpError(400, "This product is not configured for Stripe checkout.");
  }

  const origin = getAppOrigin(request, env);
  const successUrl = new URL("/app", origin);
  successUrl.searchParams.set("checkout", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

  const cancelUrl = new URL("/app", origin);
  cancelUrl.searchParams.set("checkout", "cancel");
  cancelUrl.searchParams.set("product", productKey);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    body: buildFormBody({
      "allow_promotion_codes": "true",
      "cancel_url": cancelUrl.toString(),
      "client_reference_id": auth.user.id,
      "customer_email": auth.user.email ?? "",
      "line_items[0][price]": await resolveStripePriceId(env, product.stripePriceLookupKey),
      "line_items[0][quantity]": "1",
      "metadata[product_key]": productKey,
      "metadata[user_id]": auth.user.id,
      "mode": product.kind === "subscription" ? "subscription" : "payment",
      "success_url": successUrl.toString()
    }),
    headers: stripeHeaders(env),
    method: "POST"
  });
  const stripePayload = (await stripeResponse.json().catch(() => null)) as { id?: string; url?: string; error?: { message?: string } } | null;

  if (!stripeResponse.ok || !stripePayload?.id || !stripePayload.url) {
    throw new HttpError(stripeResponse.status || 502, "Unable to start checkout.", stripePayload);
  }

  return json({
    productKey,
    sessionId: stripePayload.id,
    url: stripePayload.url
  });
}

async function handleConfirmCheckoutSession(request: Request, env: Env) {
  assertSupabaseEnv(env);
  assertStripeEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<ConfirmCheckoutSessionRequest>(request);
  const sessionId = requireString(body.sessionId, "sessionId");
  const session = await fetchStripeCheckoutSession(env, sessionId);

  if (session.client_reference_id !== auth.user.id && session.metadata?.user_id !== auth.user.id) {
    throw new HttpError(403, "This checkout session does not belong to the active member.");
  }

  const productKey = requireProductKey(session.metadata?.product_key);
  const product = PREMIUM_PRODUCTS[productKey];
  const purchasedAt = session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString();

  let isActive = false;
  let expiresAt: string | null = null;

  if (product.kind === "subscription") {
    if (!session.subscription) {
      throw new HttpError(400, "The checkout session did not create a subscription.");
    }

    const subscription = await fetchStripeSubscription(env, session.subscription);
    isActive = ["active", "trialing"].includes(subscription.status ?? "");
    expiresAt = subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null;
  } else {
    isActive = session.payment_status === "paid";
  }

  if (!isActive) {
    throw new HttpError(409, "The payment is not complete yet.");
  }

  const entitlements = await applyEntitlementUpdate(env, {
    expiresAt,
    isActive: true,
    platform: "web",
    productKey,
    purchasedAt,
    source: "stripe",
    userId: auth.user.id
  });

  return json({
    entitlement: mapEntitlementsToSnapshot(entitlements),
    productKey,
    sessionId,
    status: "confirmed"
  });
}

async function fetchGeocodeResults(query: string) {
  const primary = await fetchOpenMeteoGeocode(query);
  if (primary.results.length) {
    return { results: primary.results };
  }

  const secondary = await fetchNominatimGeocode(query);
  return { results: secondary.results };
}

type GeocodePlace = {
  admin1?: string;
  country?: string;
  id: number;
  latitude: number;
  longitude: number;
  name: string;
  timezone?: string;
};

async function fetchOpenMeteoGeocode(query: string): Promise<{ results: GeocodePlace[] }> {
  const params = new URLSearchParams({
    count: "5",
    format: "json",
    language: "en",
    name: query
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, {
    headers: {
      accept: "application/json"
    }
  });
  const payload = (await response.json().catch(() => null)) as
    | {
        results?: GeocodePlace[];
      }
    | null;

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to resolve the birth place.", payload);
  }

  return { results: payload?.results ?? [] };
}

async function fetchNominatimGeocode(query: string): Promise<{ results: GeocodePlace[] }> {
  const params = new URLSearchParams({
    addressdetails: "1",
    format: "jsonv2",
    limit: "5",
    q: query
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      accept: "application/json",
      "user-agent": "CosmoScope/1.0"
    }
  });
  const payload = (await response.json().catch(() => null)) as
    | Array<{
        address?: {
          city?: string;
          country?: string;
          county?: string;
          state?: string;
          town?: string;
          village?: string;
        };
        display_name?: string;
        lat: string;
        lon: string;
        name?: string;
        osm_id?: number;
        place_id?: number;
      }>
    | null;

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to resolve the birth place.", payload);
  }

  const results = await Promise.all(
    (payload ?? []).map(async (place, index): Promise<GeocodePlace | null> => {
      const latitude = Number(place.lat);
      const longitude = Number(place.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        admin1: place.address?.state ?? place.address?.county,
        country: place.address?.country,
        id: place.place_id ?? place.osm_id ?? index + 1,
        latitude,
        longitude,
        name:
          place.name ??
          place.address?.city ??
          place.address?.town ??
          place.address?.village ??
          place.display_name?.split(",")[0] ??
          query,
        timezone: await lookupTimezone(latitude, longitude)
      };
    })
  );

  return { results: results.filter((place): place is GeocodePlace => Boolean(place)) };
}

async function lookupTimezone(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    current: "temperature_2m",
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto"
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    headers: {
      accept: "application/json"
    }
  });
  const payload = (await response.json().catch(() => null)) as { timezone?: string } | null;

  if (!response.ok) {
    return "UTC";
  }

  return payload?.timezone?.trim() || "UTC";
}

type AdminUserRecord = {
  email?: string;
  id: string;
};

async function listSupabaseUsers(env: Env) {
  const users: AdminUserRecord[] = [];
  let page = 1;

  while (page <= 20) {
    const params = new URLSearchParams({
      page: String(page),
      per_page: "200"
    });
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?${params.toString()}`, {
      headers: serviceRoleHeaders(env)
    });
    const payload = (await response.json().catch(() => null)) as
      | { users?: AdminUserRecord[] }
      | { error?: { message?: string } }
      | null;

    if (!response.ok) {
      throw new HttpError(response.status, "Unable to list Supabase users.", payload);
    }

    const batch = payload && "users" in payload ? payload.users ?? [] : [];
    users.push(...batch);

    if (batch.length < 200) {
      break;
    }

    page += 1;
  }

  return users;
}

async function handleChart(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<ChartRequest>(request);
  const chartBirthInput = body as ChartRequest & {
    unknownBirthTime?: boolean;
  };
  const profileRow = await loadProfile(env, auth.user.id);
  const metadataBirth = resolveAuthBirthMetadata(auth.user);
  const cachedChart = await loadChart(env, auth.user.id);
  const astrologyInput = resolveAstrologyProfileInput({
    birthDate: body.birthDate ?? profileRow?.birth_date ?? metadataBirth.birthDate,
    birthPlace: body.birthPlace ?? profileRow?.birth_place ?? metadataBirth.birthPlace,
    birthTime: body.birthTime ?? normalizeBirthTimeValue(profileRow?.birth_time) ?? normalizeBirthTimeValue(metadataBirth.birthTime),
    latitude: body.latitude ?? profileRow?.latitude ?? metadataBirth.latitude,
    longitude: body.longitude ?? profileRow?.longitude ?? metadataBirth.longitude,
    timezone: body.timezone ?? profileRow?.timezone ?? metadataBirth.timezone,
    timezoneOffset: body.timezoneOffset ?? profileRow?.timezone_offset ?? metadataBirth.timezoneOffset,
    unknownBirthTime: chartBirthInput.unknownBirthTime ?? profileRow?.unknown_birth_time ?? metadataBirth.unknownBirthTime
  });
  const liveTransitSignal = await fetchDominantTransitSignal(env, astrologyInput, "daily");

  if (cachedChart?.source_version === CHART_SOURCE_VERSION) {
    return json({
      cached: true,
      chart: mergeChartWithTransit(cachedChart.chart_json, liveTransitSignal),
      summary: cachedChart.chart_summary,
      updatedAt: cachedChart.updated_at
    });
  }

  const chart = await buildAstrologyChartSnapshot(
    env,
    astrologyInput,
    resolveMemberDisplayName({ profile: profileRow, user: auth.user })
  );

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/natal_charts`, {
    body: JSON.stringify({
      chart_json: chart.chart,
      chart_summary: chart.summary,
      source_version: chart.sourceVersion,
      updated_at: new Date().toISOString(),
      user_id: auth.user.id
    }),
    headers: {
      ...serviceRoleHeaders(env),
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    method: "POST"
  });
  const payload = await readSupabasePayload(response);
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to cache the natal chart.", payload);
  }

  return json({
    cached: false,
    chart: mergeChartWithTransit(chart.chart, liveTransitSignal),
    summary: chart.summary,
    updatedAt: new Date().toISOString()
  });
}

async function handleForecast(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<ForecastRequest>(request);
  const forecastBirthInput = body as ForecastRequest & {
    birthDate?: string;
    birthPlace?: string;
    birthTime?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    timezoneOffset?: number | null;
    unknownBirthTime?: boolean;
  };
  const timeframe = body.timeframe;

  if (!["daily", "weekly", "monthly", "yearly"].includes(timeframe)) {
    throw new HttpError(400, "Unsupported timeframe.");
  }

  const entitlements = await loadEntitlements(env, auth.token);
  if (timeframe === "yearly" && !hasProductAccess(env, entitlements, "yearly_blueprint")) {
    throw new HttpError(402, "Yearly Blueprint is a premium reading.");
  }

  const effectiveDate = getEffectiveDate(timeframe);
  const cached = await loadForecast(env, auth.user.id, timeframe, effectiveDate, auth.token);
  if (cached && !shouldRegenerateForecast(cached.content, timeframe, env)) {
    return json({
      cached: true,
      content: cached.content,
      effectiveDate: cached.effective_date,
      structuredDailyBrief: timeframe === "daily" ? deriveStructuredDailyBriefFromContent(cached.content) : undefined,
      timeframe: cached.timeframe
    });
  }

  const profile = await loadProfile(env, auth.user.id);
  const chart = await loadChart(env, auth.user.id);
  const metadataBirth = resolveAuthBirthMetadata(auth.user);
  const displayName = resolveMemberDisplayName({ profile, user: auth.user });
  const astrologyInput = resolveAstrologyProfileInput({
    birthDate: forecastBirthInput.birthDate ?? profile?.birth_date ?? metadataBirth.birthDate,
    birthPlace: forecastBirthInput.birthPlace ?? profile?.birth_place ?? metadataBirth.birthPlace,
    birthTime:
      forecastBirthInput.birthTime ??
      normalizeBirthTimeValue(profile?.birth_time) ??
      normalizeBirthTimeValue(metadataBirth.birthTime),
    latitude: forecastBirthInput.latitude ?? profile?.latitude ?? metadataBirth.latitude,
    longitude: forecastBirthInput.longitude ?? profile?.longitude ?? metadataBirth.longitude,
    timezone: forecastBirthInput.timezone ?? profile?.timezone ?? metadataBirth.timezone,
    timezoneOffset: forecastBirthInput.timezoneOffset ?? profile?.timezone_offset ?? metadataBirth.timezoneOffset,
    unknownBirthTime: forecastBirthInput.unknownBirthTime ?? profile?.unknown_birth_time ?? metadataBirth.unknownBirthTime
  });
  const normalizedChart = normalizeChartPayload(chart?.chart_json);
  const dominantTransit = await fetchDominantTransitSignal(
    env,
    astrologyInput,
    timeframe === "daily" ? "daily" : timeframe === "weekly" ? "weekly" : "long_range"
  );
  const chartForForecast = normalizedChart ? { ...normalizedChart, dominantTransit: dominantTransit ?? undefined } : normalizedChart;
  const result = await buildForecastContentResult({
    chart: chartForForecast,
    displayName,
    effectiveDate,
    entitlements,
    env,
    timeframe,
    hasChart: Boolean(chart)
  });
  const content = result.content;

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/forecast_cache`, {
    body: JSON.stringify({
      content,
      effective_date: effectiveDate,
      refreshed_at: new Date().toISOString(),
      timeframe,
      user_id: auth.user.id
    }),
    headers: {
      ...serviceRoleHeaders(env),
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    method: "POST"
  });
  const payload = await readSupabasePayload(response);
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to cache the forecast.", payload);
  }

  return json({
    cached: false,
    content,
    effectiveDate,
    structuredDailyBrief: timeframe === "daily" ? result.structuredDailyBrief : undefined,
    timeframe
  });
}

async function handleDevReadingEngineV2GeminiSmoke(request: Request, env: Env) {
  const smokeHeader = request.headers.get("x-cosmoscope-dev-smoke");
  if (env.APP_ENV === "production" && smokeHeader !== "reading-engine-v2") {
    throw new HttpError(404, "Route not found.");
  }

  if (!isPaidAiSmokeEnabled(env)) {
    throw new HttpError(403, "Paid Gemini smoke routes are disabled unless ENABLE_PAID_AI_SMOKE=true.");
  }

  if (!env.GEMINI_API_KEY) {
    throw new HttpError(400, "Gemini smoke test requires GEMINI_API_KEY to be configured in the Worker environment.");
  }

  const body = await readJson<DevReadingEngineV2SmokeRequest>(request);
  const timeframe = body.timeframe ?? "daily";

  if (!["daily", "weekly", "monthly", "yearly"].includes(timeframe)) {
    throw new HttpError(400, "Unsupported timeframe.");
  }

  const smokeEnv: Env = {
    ...env,
    AI_READING_PROVIDER: "gemini",
    ENABLE_AI_READINGS: "true",
    READING_ENGINE_VERSION: "v2"
  };

  const run = await runGeminiSmokeForecast({
    displayName: body.displayName?.trim() || "Jeff",
    env: smokeEnv,
    timeframe
  });

  return json({
    ok: run.result.ok,
    chart: run.chart.bigThree,
    content: run.result.content,
    promptTokenCount: run.result.usage?.promptTokenCount ?? null,
    candidatesTokenCount: run.result.usage?.candidatesTokenCount ?? null,
    thoughtsTokenCount: run.result.usage?.thoughtsTokenCount ?? null,
    totalTokenCount: run.result.usage?.totalTokenCount ?? null,
    estimatedCostUsd: run.result.usage?.estimatedCostUsd ?? null,
    effectiveDate: run.effectiveDate,
    engine: run.result.engine === "v2_ai" ? "v2_gemini" : "v1_fallback",
    fallbackUsed: run.result.fallbackUsed,
    error: run.result.fallbackUsed ? run.result.errorMessage : undefined,
    provider: run.result.provider,
    structuredDailyBrief: timeframe === "daily" ? run.result.structuredDailyBrief ?? null : null,
    telemetry: run.result.telemetry ?? null,
    timeframe
  });
}

async function handleDevReadingEngineV2GeminiBatch(request: Request, env: Env) {
  const smokeHeader = request.headers.get("x-cosmoscope-dev-smoke");
  if (env.APP_ENV === "production" && smokeHeader !== "reading-engine-v2") {
    throw new HttpError(404, "Route not found.");
  }

  if (!isPaidAiSmokeEnabled(env)) {
    throw new HttpError(403, "Paid Gemini smoke routes are disabled unless ENABLE_PAID_AI_SMOKE=true.");
  }

  if (!env.GEMINI_API_KEY) {
    throw new HttpError(400, "Gemini smoke test requires GEMINI_API_KEY to be configured in the Worker environment.");
  }

  const body = await readJson<DevReadingEngineV2SmokeRequest>(request);
  const timeframe = body.timeframe ?? "daily";
  const requestedIterations = body.iterations ?? 1;
  const iterations = Math.trunc(requestedIterations);

  if (!["daily", "weekly", "monthly", "yearly"].includes(timeframe)) {
    throw new HttpError(400, "Unsupported timeframe.");
  }

  if (!Number.isFinite(iterations) || iterations < 1) {
    throw new HttpError(400, "Iterations must be between 1 and 3.");
  }

  if (iterations > 3) {
    throw new HttpError(400, "Paid Gemini batch smoke is capped at 3 iterations.");
  }

  const smokeEnv: Env = {
    ...env,
    AI_READING_PROVIDER: "gemini",
    ENABLE_AI_READINGS: "true",
    READING_ENGINE_VERSION: "v2"
  };

  const runs: Array<{
    ok: boolean;
    estimatedCostUsd: number | null;
    fallbackUsed: boolean;
    failureKind: string | null;
    latencyMs: number | null;
  }> = [];

  for (let index = 0; index < iterations; index += 1) {
    const run = await runGeminiSmokeForecast({
      displayName: body.displayName?.trim() || "Jeff",
      env: smokeEnv,
      timeframe
    });

    const attempts = run.result.telemetry?.attempts ?? [];
    const terminalAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : undefined;

    runs.push({
      ok: run.result.ok,
      estimatedCostUsd: run.result.usage?.estimatedCostUsd ?? null,
      fallbackUsed: run.result.fallbackUsed,
      failureKind: run.result.ok ? null : terminalAttempt?.failureKind ?? "unknown",
      latencyMs: run.result.telemetry?.totalElapsedMs ?? terminalAttempt?.elapsedMs ?? null
    });
  }

  const successes = runs.filter((run) => run.ok).length;
  const failures = runs.length - successes;
  const latencyValues = runs.map((run) => run.latencyMs).filter((value): value is number => typeof value === "number");
  const costValues = runs
    .map((run) => run.estimatedCostUsd)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const failureKinds = runs.reduce<Record<string, number>>((accumulator, run) => {
    if (!run.failureKind) {
      return accumulator;
    }

    accumulator[run.failureKind] = (accumulator[run.failureKind] ?? 0) + 1;
    return accumulator;
  }, {});

  return json({
    averageEstimatedCostUsd:
      costValues.length > 0 ? Number((costValues.reduce((sum, value) => sum + value, 0) / costValues.length).toFixed(8)) : null,
    averageLatencyMs:
      latencyValues.length > 0 ? Math.round(latencyValues.reduce((sum, value) => sum + value, 0) / latencyValues.length) : null,
    failures,
    failureKinds,
    iterations,
    maxLatencyMs: latencyValues.length > 0 ? Math.max(...latencyValues) : null,
    successRate: Number(((successes / runs.length) * 100).toFixed(1)),
    successes
  });
}

async function handleDevReadingEngineV2Smoke(request: Request, env: Env) {
  const smokeHeader = request.headers.get("x-cosmoscope-dev-smoke");
  if (env.APP_ENV === "production" && smokeHeader !== "reading-engine-v2") {
    throw new HttpError(404, "Route not found.");
  }

  const body = await readJson<DevReadingEngineV2SmokeRequest>(request);
  const timeframe = body.timeframe ?? "daily";

  if (!["daily", "weekly", "monthly", "yearly"].includes(timeframe)) {
    throw new HttpError(400, "Unsupported timeframe.");
  }

  const effectiveDate = getEffectiveDate(timeframe);
  const chart: ChartPayload = {
    accuracy: {
      engine: "mock",
      houses: "mock",
      planets: "mock"
    },
    bigThree: {
      moon: "Libra",
      rising: "Pisces",
      sun: "Sagittarius"
    },
    birth: {
      date: "1983-11-30",
      instantUtc: "1983-11-30T18:18:00.000Z",
      latitude: 33.9528472,
      longitude: -84.5496148,
      place: "Marietta, Georgia, United States",
      time: "13:18",
      timezone: "America/New_York",
      unknownBirthTime: false
    },
    dominantTransit: {
      aspect: "Trine",
      exactness: 1.2,
      natalBody: "Mercury",
      natalSign: "Sagittarius",
      orb: 1.2,
      transitBody: "Venus",
      transitSign: "Leo"
    },
    transitSignals: [
      {
        aspect: "Trine",
        exactness: 1.2,
        natalBody: "Mercury",
        natalSign: "Sagittarius",
        orb: 1.2,
        transitBody: "Venus",
        transitSign: "Leo"
      },
      {
        aspect: "Sextile",
        exactness: 0.64,
        natalBody: "Moon",
        natalSign: "Libra",
        orb: 2.0,
        transitBody: "Mars",
        transitSign: "Gemini"
      },
      {
        aspect: "Square",
        exactness: 0.51,
        natalBody: "Sun",
        natalSign: "Sagittarius",
        orb: 2.8,
        transitBody: "Saturn",
        transitSign: "Pisces"
      }
    ],
    planets: [],
    transits: [],
    wheel: {
      ascendant: null,
      midheaven: null
    }
  };

  const entitlements: EntitlementsRow = {
    active_until: null,
    forecast_monthly_unlocked: true,
    lovescope_unlocked: false,
    premium_active: true,
    premium_source: "admin",
    revenuecat_active: false,
    starscope_unlocked: false,
    stripe_active: false,
    updated_at: new Date().toISOString(),
    yearly_blueprint_unlocked: true
  };

  const smokeEnv: Env = {
    ...env,
    AI_READING_PROVIDER: "mock",
    ENABLE_AI_READINGS: "true",
    READING_ENGINE_VERSION: "v2"
  };

  const result = await buildForecastContentResult({
    chart,
    displayName: body.displayName?.trim() || "Jeff",
    effectiveDate,
    entitlements,
    env: smokeEnv,
    timeframe,
    hasChart: true
  });

  return json({
    ok: result.ok,
    chart: chart.bigThree,
    content: result.content,
    effectiveDate,
    engine: result.fallbackUsed ? "v1_fallback" : "v2_mock",
    fallbackUsed: result.fallbackUsed,
    error: result.fallbackUsed ? result.errorMessage : undefined,
    provider: "mock",
    structuredDailyBrief: timeframe === "daily" ? result.structuredDailyBrief ?? null : null,
    timeframe
  });
}

function buildDevReadingEngineSmokeChart(): ChartPayload {
  return {
    accuracy: {
      engine: "mock",
      houses: "mock",
      planets: "mock"
    },
    bigThree: {
      moon: "Libra",
      rising: "Pisces",
      sun: "Sagittarius"
    },
    birth: {
      date: "1983-11-30",
      instantUtc: "1983-11-30T18:18:00.000Z",
      latitude: 33.9528472,
      longitude: -84.5496148,
      place: "Marietta, Georgia, United States",
      time: "13:18",
      timezone: "America/New_York",
      unknownBirthTime: false
    },
    dominantTransit: {
      aspect: "Trine",
      exactness: 1.2,
      natalBody: "Mercury",
      natalSign: "Sagittarius",
      orb: 1.2,
      transitBody: "Venus",
      transitSign: "Leo"
    },
    transitSignals: [
      {
        aspect: "Trine",
        exactness: 1.2,
        natalBody: "Mercury",
        natalSign: "Sagittarius",
        orb: 1.2,
        transitBody: "Venus",
        transitSign: "Leo"
      },
      {
        aspect: "Sextile",
        exactness: 0.64,
        natalBody: "Moon",
        natalSign: "Libra",
        orb: 2.0,
        transitBody: "Mars",
        transitSign: "Gemini"
      },
      {
        aspect: "Square",
        exactness: 0.51,
        natalBody: "Sun",
        natalSign: "Sagittarius",
        orb: 2.8,
        transitBody: "Saturn",
        transitSign: "Pisces"
      }
    ],
    planets: [],
    transits: [],
    wheel: {
      ascendant: null,
      midheaven: null
    }
  };
}

function buildDevReadingEngineSmokeEntitlements(): EntitlementsRow {
  return {
    active_until: null,
    forecast_monthly_unlocked: true,
    lovescope_unlocked: false,
    premium_active: true,
    premium_source: "admin",
    revenuecat_active: false,
    starscope_unlocked: false,
    stripe_active: false,
    updated_at: new Date().toISOString(),
    yearly_blueprint_unlocked: true
  };
}

async function runGeminiSmokeForecast(input: {
  displayName: string;
  env: Env;
  timeframe: ForecastTimeframe;
}) {
  const effectiveDate = getEffectiveDate(input.timeframe);
  const chart = buildDevReadingEngineSmokeChart();
  const entitlements = buildDevReadingEngineSmokeEntitlements();
  const result = await buildForecastContentResult({
    chart,
    displayName: input.displayName,
    effectiveDate,
    entitlements,
    env: input.env,
    timeframe: input.timeframe,
    hasChart: true
  });

  return {
    chart,
    effectiveDate,
    result
  };
}

async function handleStudioRead(request: Request, env: Env) {
  const body = await readJson<StudioReadRequest>(request);
  const expectedAccessKey = env.COSMOSCOPE_STUDIO_ACCESS_KEY?.trim();
  if (!expectedAccessKey) {
    throw new HttpError(503, "Creator Studio is not configured yet.");
  }

  if ((body.accessKey ?? "").trim() !== expectedAccessKey) {
    throw new HttpError(401, "Invalid Creator Studio access key.");
  }

  const astrologyInput = resolveAstrologyProfileInput({
    birthDate: body.birthDate,
    birthPlace: body.birthPlace,
    birthTime: body.birthTime ?? null,
    latitude: body.latitude,
    longitude: body.longitude,
    timezone: body.timezone,
    timezoneOffset: body.timezoneOffset ?? null,
    unknownBirthTime: body.unknownBirthTime ?? false
  });
  const chart = await buildAstrologyChartSnapshot(env, astrologyInput, body.label);

  const normalizedChart = normalizeChartPayload(chart.chart as Record<string, unknown>);
  const hasChart = Boolean(normalizedChart);
  const forecastTimeframe = resolveStudioForecastTimeframe(body.readingType);
  const transitSignals = forecastTimeframe
    ? await fetchTransitSignals(
        env,
        astrologyInput,
        forecastTimeframe === "daily" ? "daily" : forecastTimeframe === "weekly" ? "weekly" : "long_range"
      )
    : await fetchTransitSignals(env, astrologyInput, "daily");
  const chartWithTransit = normalizedChart
    ? {
        ...normalizedChart,
        dominantTransit: transitSignals[0] ?? undefined,
        transitSignals
      }
    : normalizedChart;
  const forecast = forecastTimeframe
    ? buildForecastCopy({
        chart: chartWithTransit,
        displayName: body.label,
        timeframe: forecastTimeframe,
        hasChart
      })
    : body.readingType === "starscope"
      ? buildStarScopeCopy({
          chart: chartWithTransit,
          displayName: body.label,
          hasChart,
          question: body.question?.trim() || "What deserves the cleanest attention right now?"
        })
      : body.readingType === "lovescope"
        ? buildLoveScopeCopy({
            chart: chartWithTransit,
            displayName: body.label,
            hasChart,
            partnerBirthDate: null,
            partnerName: "the other person",
            relationshipType: "Undefined",
            situation: body.question?.trim() || "The connection matters, but the terms are not fully named."
          })
        : buildStudioMarketingLead({
            audience: body.audience ?? "advertising",
            chart: normalizedChart,
            label: body.label,
            readingType: body.readingType
          });

  const result = buildStudioReadingResult({
    audience: body.audience ?? "personal",
    chart,
    forecast,
    label: body.label,
    question: body.question?.trim() || "",
    readingType: body.readingType
  });

  return json(result);
}

function shouldRegenerateForecast(content: string, timeframe: ForecastTimeframe, env?: Env) {
  const trimmed = content.trim();

  if (!trimmed) {
    return true;
  }

  if (env && isReadingEngineV2Enabled(env) && !isReadingEngineV2CachedContent(trimmed)) {
    return true;
  }

  const legacyForecastMarkers = [
    "Today asks for steadier pacing",
    "Today opens with",
    "Today asks for stronger attention",
    "The beginning of the week asks for more patience than pride",
    "This month is about restructuring the way your life carries weight",
    "This year is asking for a stronger container"
  ];

  if (legacyForecastMarkers.some((marker) => trimmed.includes(marker))) {
    return true;
  }

  if (timeframe === "daily" && splitForecastParagraphs(trimmed).length < 3) {
    return true;
  }

  if (timeframe === "weekly" && splitForecastParagraphs(trimmed).length < 4) {
    return true;
  }

  if (timeframe === "monthly" && splitForecastParagraphs(trimmed).length < 5) {
    return true;
  }

  if (timeframe === "yearly" && splitForecastParagraphs(trimmed).length < 5) {
    return true;
  }

  return false;
}

function splitForecastParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

type ReadingEngineV2Result = {
  dateLabel: string;
  paragraphs: string[];
  signals: string[];
  structuredDailyBrief?: StructuredDailyBrief;
  title: string;
  yourMove: string;
};

type StructuredDailyBrief = {
  headline: string;
  learnYourSky?: string;
  noticeWhen: string[];
  whyTodayFeelsThisWay: string[];
  yourMove: string;
};

type ReadingEngineGenerationInput = {
  chart: ChartPayload | null;
  displayName: string;
  effectiveDate: string;
  entitlements: EntitlementsRow;
  env: Env;
  timeframe: ForecastTimeframe;
  hasChart: boolean;
};

type ReadingEngineV2PromptPayload = {
  system: string;
  task: string;
  rules: string[];
  input: {
    displayName?: string;
    firstName: string;
    timeframe: ForecastTimeframe;
    effectiveDate: string;
    chart: {
      sun: string;
      moon: string;
      rising: string;
    };
    editorialBrief: EditorialBrief;
  };
  outputShape: Record<string, unknown>;
};

type InterpretationPacketConfidence = "high" | "medium" | "low" | "limited";

type InterpretationPacket = {
  primaryTheme: string;
  secondaryThemes: string[];
  opportunities: string[];
  frictionPoints: string[];
  confidence: InterpretationPacketConfidence;
  dominantTransit: TransitSignal | null;
  supportingTransits: TransitSignal[];
  practicalFocus: string[];
  editorialWarnings: string[];
  astrologicalEvidence: string[];
};

type EditorialBriefTone = "direct" | "steady" | "gentle" | "restrained";

type EditorialBrief = {
  headline: string;
  primaryNarrative: string;
  emotionalGoal: string;
  readerPreparation: string[];
  readerAction: string;
  tone: EditorialBriefTone;
  confidenceLanguage: string;
  avoidLanguage: string[];
  closingPurpose: string;
};

function buildInterpretationPacket(input: ReadingEngineGenerationInput): InterpretationPacket | null {
  if (!input.chart) {
    return null;
  }

  const dominantTransit = input.chart.dominantTransit ?? null;
  const chartSignals = input.chart.transitSignals?.slice(0, 5) ?? [];
  const transitSignals = dominantTransit
    ? [dominantTransit, ...chartSignals.filter((signal) => !isSameTransitSignal(signal, dominantTransit))]
    : chartSignals;
  const supportingTransits = dominantTransit
    ? transitSignals.filter((signal) => !isSameTransitSignal(signal, dominantTransit)).slice(0, 4)
    : transitSignals.slice(0, 4);
  const evidenceSignals = dominantTransit ? [dominantTransit, ...supportingTransits] : supportingTransits;

  return {
    primaryTheme: dominantTransit ? buildTransitSignalName(dominantTransit) : "No dominant transit signal available",
    secondaryThemes: supportingTransits.map(buildTransitSignalName),
    opportunities: supportingTransits.map(buildTransitSignalFocus),
    frictionPoints: dominantTransit ? [buildTransitSignalFocus(dominantTransit)] : [],
    confidence: deriveInterpretationPacketConfidence(dominantTransit, transitSignals),
    dominantTransit,
    supportingTransits,
    practicalFocus: evidenceSignals.map(buildTransitSignalFocus),
    editorialWarnings: buildInterpretationPacketWarnings(input, dominantTransit, supportingTransits),
    astrologicalEvidence: evidenceSignals.map(buildTransitSignalEvidence)
  };
}

function buildTransitSignalName(signal: TransitSignal) {
  return `${signal.transitBody} ${normalizeTransitAspect(signal.aspect)} ${signal.natalBody}`;
}

function buildTransitSignalFocus(signal: TransitSignal) {
  return `${signal.transitBody} in ${signal.transitSign} with natal ${signal.natalBody}`;
}

function buildTransitSignalEvidence(signal: TransitSignal) {
  const evidence = [
    `${signal.transitBody} in ${signal.transitSign}`,
    `${normalizeTransitAspect(signal.aspect)} natal ${signal.natalBody}`
  ];

  if (signal.natalSign) {
    evidence.push(`natal sign: ${signal.natalSign}`);
  }

  if (signal.exactness > 0) {
    evidence.push(`exactness: ${roundDegree(signal.exactness)}`);
  }

  if (signal.orb > 0) {
    evidence.push(`orb: ${roundDegree(signal.orb)}`);
  }

  return evidence.join(" | ");
}

function normalizeTransitAspect(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isSameTransitSignal(left: TransitSignal, right: TransitSignal) {
  return (
    left.transitBody === right.transitBody &&
    left.transitSign === right.transitSign &&
    left.aspect === right.aspect &&
    left.natalBody === right.natalBody &&
    left.natalSign === right.natalSign
  );
}

function deriveInterpretationPacketConfidence(
  dominantTransit: TransitSignal | null,
  transitSignals: TransitSignal[]
): InterpretationPacketConfidence {
  if (!dominantTransit && transitSignals.length === 0) {
    return "limited";
  }

  if ((dominantTransit?.exactness ?? 0) >= 18) {
    return "high";
  }

  if ((dominantTransit?.exactness ?? 0) >= 8 || transitSignals.length >= 3) {
    return "medium";
  }

  return "low";
}

function buildInterpretationPacketWarnings(
  input: ReadingEngineGenerationInput,
  dominantTransit: TransitSignal | null,
  supportingTransits: TransitSignal[]
) {
  const warnings = [
    "Do not infer astrological meaning beyond the packet evidence.",
    "Treat supporting transits as secondary to the dominant transit."
  ];

  if (!dominantTransit) {
    warnings.push("No dominant transit is available. Avoid overstating certainty.");
  }

  if (supportingTransits.length === 0) {
    warnings.push("No supporting transit stack is available. Keep the reading narrow.");
  }

  if (input.chart?.birth?.unknownBirthTime) {
    warnings.push("Birth time is unknown. Avoid overclaiming Rising-sign precision.");
  }

  return warnings;
}

function buildEditorialBrief(packet: InterpretationPacket): EditorialBrief {
  const readerPreparation = packet.practicalFocus.slice(0, 3);
  const emotionalGoal = buildEditorialBriefEmotionalGoal(packet);

  return {
    headline: buildEditorialBriefHeadline(packet),
    primaryNarrative: buildEditorialBriefNarrative(packet),
    emotionalGoal,
    readerPreparation,
    readerAction: buildEditorialBriefReaderAction(packet, readerPreparation),
    tone: deriveEditorialBriefTone(packet.confidence),
    confidenceLanguage: buildEditorialBriefConfidenceLanguage(packet.confidence),
    avoidLanguage: buildEditorialBriefAvoidLanguage(packet),
    closingPurpose: buildEditorialBriefClosingPurpose(emotionalGoal)
  };
}

function buildEditorialBriefHeadline(packet: InterpretationPacket) {
  return packet.primaryTheme;
}

function buildEditorialBriefNarrative(packet: InterpretationPacket) {
  const parts = [
    `Center the reading on ${packet.primaryTheme}.`
  ];

  if (packet.secondaryThemes[0]) {
    parts.push(`Use ${packet.secondaryThemes[0]} as the supporting context, not a competing storyline.`);
  }

  if (packet.frictionPoints[0]) {
    parts.push(`Keep the practical tension anchored in ${packet.frictionPoints[0]}.`);
  }

  return parts.join(" ");
}

function buildEditorialBriefEmotionalGoal(packet: InterpretationPacket) {
  if (packet.frictionPoints[0]) {
    return `Leave the reader clearer and less reactive around ${packet.frictionPoints[0]}.`;
  }

  if (packet.opportunities[0]) {
    return `Leave the reader better prepared to work with ${packet.opportunities[0]}.`;
  }

  return "Leave the reader steadier, clearer, and more prepared to make one grounded move.";
}

function buildEditorialBriefReaderAction(packet: InterpretationPacket, readerPreparation: string[]) {
  return readerPreparation[0] ?? packet.opportunities[0] ?? packet.primaryTheme;
}

function deriveEditorialBriefTone(confidence: InterpretationPacketConfidence): EditorialBriefTone {
  switch (confidence) {
    case "high":
      return "direct";
    case "medium":
      return "steady";
    case "low":
      return "gentle";
    case "limited":
      return "restrained";
  }
}

function buildEditorialBriefConfidenceLanguage(confidence: InterpretationPacketConfidence) {
  switch (confidence) {
    case "high":
      return "The astrological picture today is unusually clear.";
    case "medium":
      return "The pattern is clear enough to read directly without overstating it.";
    case "low":
      return "There are several subtle influences worth paying attention to.";
    case "limited":
      return "The available astrological signal is light, so the reading should stay modest and precise.";
  }
}

function buildEditorialBriefAvoidLanguage(packet: InterpretationPacket) {
  return [
    ...packet.editorialWarnings,
    "Do not introduce predictions, fate language, or dramatic certainty.",
    "Do not contradict the packet's confidence level or supporting evidence."
  ];
}

function buildEditorialBriefClosingPurpose(emotionalGoal: string) {
  return `${emotionalGoal} End by sending the reader back into the day with one concrete next move.`;
}

function isStructuredDailyBrief(value: unknown): value is StructuredDailyBrief {
  return Boolean(value && typeof value === "object");
}

function sanitizeBriefList(value: unknown, limit: number) {
  return Array.isArray(value) ? value.map(sanitizeReadingText).filter(Boolean).slice(0, limit) : [];
}

function validateStructuredDailyBrief(
  value: unknown,
  options: { allowDerivedNoticeWhen?: boolean; allowMissingLearnYourSky?: boolean } = {}
): StructuredDailyBrief {
  if (!isStructuredDailyBrief(value)) {
    throw new Error("Structured daily brief is missing.");
  }

  const headline = sanitizeReadingText(value.headline);
  const noticeWhen = sanitizeBriefList(value.noticeWhen, 3);
  const yourMove = sanitizeReadingText(value.yourMove);
  const whyTodayFeelsThisWay = sanitizeBriefList(value.whyTodayFeelsThisWay, 4);
  const learnYourSky = sanitizeReadingText(value.learnYourSky);

  if (!headline || !yourMove || !whyTodayFeelsThisWay.length) {
    throw new Error("Structured daily brief is incomplete.");
  }

  if (!options.allowDerivedNoticeWhen && noticeWhen.length !== 3) {
    throw new Error("Structured daily brief must contain exactly 3 Notice When items.");
  }

  if (headline.split(/\s+/).length > 12) {
    throw new Error("Structured daily brief headline is too long.");
  }

  return {
    headline,
    ...(learnYourSky || options.allowMissingLearnYourSky ? { learnYourSky: learnYourSky || undefined } : {}),
    noticeWhen,
    whyTodayFeelsThisWay,
    yourMove
  };
}

function renderStructuredDailyBriefParagraphs(brief: StructuredDailyBrief) {
  const paragraphs = [brief.headline];

  if (brief.noticeWhen.length) {
    paragraphs.push(["Notice When", ...brief.noticeWhen.map((item) => `- ${item}`)].join("\n"));
  }

  paragraphs.push(["Why Today Feels This Way", ...brief.whyTodayFeelsThisWay].join("\n"));

  if (brief.learnYourSky) {
    paragraphs.push(`Learn Your Sky\n${brief.learnYourSky}`);
  }

  return paragraphs;
}

function buildDefaultDailySignals(input: ReadingEngineGenerationInput) {
  const { moon, rising, sun } = readingEngineNames({
    chart: input.chart,
    displayName: input.displayName
  });

  const dominantTransitSummary = input.chart?.dominantTransit
    ? `${input.chart.dominantTransit.transitBody} ${normalizeTransitAspect(input.chart.dominantTransit.aspect)} ${input.chart.dominantTransit.natalBody}`
    : "current sky";

  return [sun.label, moon.label, rising.label, dominantTransitSummary].filter(Boolean);
}

function buildDailyReadingEngineV2Result(
  brief: StructuredDailyBrief,
  input: ReadingEngineGenerationInput,
  overrides: Partial<Pick<ReadingEngineV2Result, "dateLabel" | "signals" | "title">> = {}
): ReadingEngineV2Result {
  return {
    dateLabel: overrides.dateLabel ?? buildReadingEngineV2DateLabel("daily", input.effectiveDate),
    paragraphs: renderStructuredDailyBriefParagraphs(brief),
    signals: overrides.signals ?? buildDefaultDailySignals(input),
    structuredDailyBrief: brief,
    title: overrides.title ?? "Today's Brief",
    yourMove: brief.yourMove
  };
}

function deriveStructuredDailyBriefFromContent(content: string, fallbackHeadline?: string): StructuredDailyBrief | null {
  const normalizedContent = sanitizeReadingText(content).includes(" ") ? content.trim() : content;
  const paragraphs = splitForecastParagraphs(normalizedContent);
  if (!paragraphs.length) {
    return null;
  }

  const move = extractStructuredDailyMove(normalizedContent);
  const bodyWithoutMove = stripStructuredDailyMove(normalizedContent);
  const bodyParagraphs = splitForecastParagraphs(bodyWithoutMove);

  let headline = sanitizeReadingText(bodyParagraphs[0]);
  const noticeWhen: string[] = [];
  const whyTodayFeelsThisWay: string[] = [];
  let learnYourSky = "";

  for (let index = 1; index < bodyParagraphs.length; index += 1) {
    const paragraph = bodyParagraphs[index];
    const lines = paragraph
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      continue;
    }

    const heading = cleanStructuredDailyHeading(lines[0]);
    if (heading === "notice when" || heading === "watch for") {
      noticeWhen.push(
        ...lines
          .slice(1)
          .map((line) => line.replace(/^[-*•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
          .filter(Boolean)
      );
      continue;
    }

    if (heading === "why today feels this way" || heading === "why today") {
      whyTodayFeelsThisWay.push(...lines.slice(1).map(sanitizeReadingText).filter(Boolean));
      continue;
    }

    if (heading === "learn your sky") {
      learnYourSky = sanitizeReadingText(lines.slice(1).join(" "));
      continue;
    }

    if (!headline) {
      headline = sanitizeReadingText(paragraph);
    } else {
      whyTodayFeelsThisWay.push(sanitizeReadingText(paragraph));
    }
  }

  if (!headline) {
    headline =
      splitReadingSentences(bodyParagraphs[0] ?? "").find((sentence) => sentence.trim().length > 12) ??
      sanitizeReadingText(fallbackHeadline) ??
      "";
  }

  const derived = {
    headline,
    learnYourSky: learnYourSky || undefined,
    noticeWhen: noticeWhen.slice(0, 3),
    whyTodayFeelsThisWay: whyTodayFeelsThisWay.length ? whyTodayFeelsThisWay : bodyParagraphs.slice(1),
    yourMove: move
  };

  try {
    return validateStructuredDailyBrief(derived, {
      allowDerivedNoticeWhen: true,
      allowMissingLearnYourSky: true
    });
  } catch {
    return null;
  }
}

function cleanStructuredDailyHeading(text: string) {
  return text.replace(/^\*\*|\*\*$/g, "").replace(/:$/, "").trim().toLowerCase();
}

function splitReadingSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function stripStructuredDailyMove(text: string) {
  return text.replace(/\n*\s*\*\*Your move:\*\*[\s\S]*$/i, "").trim();
}

function extractStructuredDailyMove(text: string) {
  const match = text.match(/\*\*Your move:\*\*\s*([\s\S]*)$/i);
  return sanitizeReadingText(match?.[1]);
}

function buildReadingEngineV2PromptPayload(input: ReadingEngineGenerationInput): ReadingEngineV2PromptPayload | null {
  if (!input.chart?.bigThree?.sun || !input.chart.bigThree.moon || !input.chart.bigThree.rising) {
    return null;
  }

  const interpretationPacket = buildInterpretationPacket(input);
  if (!interpretationPacket) {
    return null;
  }

  const editorialBrief = buildEditorialBrief(interpretationPacket);

  const { firstName } = readingEngineNames({
    chart: input.chart,
    displayName: input.displayName
  });

  return {
    system:
      "You are the CosmoScope Reading Engine. Your job is to turn an approved Editorial Brief into calm, useful prose without adding new astrology.",
    task:
      "Generate one CosmoScope reading for the requested timeframe using only the provided chart, editorial brief, member, and timeframe context. Treat the Editorial Brief as fully authoritative and act only as the writer.",
    rules: [
      "Prepare, do not predict.",
      "Treat the Editorial Brief as authoritative. Do not infer, extend, or invent additional astrology beyond it.",
      "Use the member's Sun, Moon, Rising, and the Editorial Brief naturally. Do not mechanically list every field.",
      "Translate the Editorial Brief into concrete, recognizable daily-life situations.",
      "Explain what the reader may notice, why it may matter, and how to work with it.",
      "Use plain, natural language.",
      "Sound calm, intelligent, grounded, and human.",
      "Preserve uncertainty with phrases such as 'you may notice' or 'if this shows up.'",
      "Preserve member agency. Do not make guaranteed predictions.",
      "Do not imitate competitors, authors, celebrities, or famous-person personas.",
      "Do not output generic horoscope filler, generic wellness language, therapy jargon, mystical cliches, or impressive-sounding abstractions.",
      "Avoid these words and phrases unless directly required by the Editorial Brief: signal, pressure pattern, honest container, body-level clue, porous, nervous system, system wants, emotional charge, lower the noise, the universe wants, the stars are telling you.",
      "Prefer concrete CosmoScope wording such as: 'You may notice that small delays feel more personal than usual,' 'If this shows up in a conversation, slow the pace before you decide what it means,' or 'This may matter because it can turn a minor choice into a larger reaction.'",
      "Avoid abstract wording such as: 'The day carries a pressure pattern,' 'Your system wants a more honest container,' or 'Follow the signal until it becomes legible.'",
      "Do not mechanically reuse sign-tone fragments. Rewrite them naturally and grammatically.",
      "Avoid awkward constructions like 'the question of to find' or 'describes the central engine: to find'. If a sign drive begins with 'to', rewrite it as a natural noun phrase instead of inserting it mechanically.",
      "Do not mention being an AI, a model, a provider, or a system prompt.",
      "Keep the reading between 180 and 260 words."
    ],
    input: {
      displayName: input.displayName,
      firstName,
      timeframe: input.timeframe,
      effectiveDate: input.effectiveDate,
      chart: {
        sun: input.chart.bigThree.sun,
        moon: input.chart.bigThree.moon,
        rising: input.chart.bigThree.rising
      },
      editorialBrief
    },
    outputShape:
      input.timeframe === "daily"
        ? {
            structuredDailyBrief: {
              headline: "string",
              noticeWhen: ["string", "string", "string"],
              yourMove: "string",
              whyTodayFeelsThisWay: ["string"],
              learnYourSky: "string?"
            }
          }
        : {
            title: "string",
            dateLabel: "string",
            paragraphs: "string[]",
            signals: "string[]",
            yourMove: "string"
          }
  };
}

function buildReadingEngineV2Prompt(input: ReadingEngineGenerationInput): string | null {
  const payload = buildReadingEngineV2PromptPayload(input);
  if (!payload) {
    return null;
  }

  const timeframeSpecificRules =
    input.timeframe === "daily"
      ? [
          "For daily readings, return strict JSON matching the structuredDailyBrief shape exactly.",
          "Headline rules: maximum 12 words, no planet names, no sign names, no mystical cliches, one useful human truth.",
          "Notice When rules: return exactly 3 items, each concrete, observable, and specific.",
          "Your Move rules: one concrete action, doable in under five minutes, no vague mindset advice.",
          "Why Today Feels This Way rules: one or more concise explanatory paragraphs grounded in the member's Sun, Moon, Rising, and the Editorial Brief.",
          "Learn Your Sky is optional. Include it only when one brief educational sentence can be grounded in the chart concept already provided.",
          "Avoid these words and phrases in the daily brief unless directly required by the Editorial Brief: alignment, aligned, container, nervous system, pressure pattern, body-level clue, signal, noise, journey, embrace, manifest.",
          "Do not return title, dateLabel, paragraphs, signals, or a duplicated Your Move field for daily. Return only structuredDailyBrief."
        ]
      : [
          "Return valid JSON only with title, dateLabel, paragraphs, signals, and yourMove.",
          "End with one specific practical action labeled 'Your move:'."
        ];

  return [
    payload.system,
    "",
    `Task: ${payload.task}`,
    "",
    "Rules:",
    ...payload.rules.map((rule) => `- ${rule}`),
    ...timeframeSpecificRules.map((rule) => `- ${rule}`),
    "",
    "Input:",
    JSON.stringify(payload.input, null, 2),
    "",
    "Required output shape:",
    JSON.stringify(payload.outputShape, null, 2)
  ].join("\n");
}

type AiReadingProvider = {
  generate(input: ReadingEngineGenerationInput): Promise<AiReadingProviderResult>;
  name: string;
};

type GeminiUsageMetadata = {
  candidatesTokenCount?: unknown;
  promptTokenCount?: unknown;
  thoughtsTokenCount?: unknown;
  totalTokenCount?: unknown;
};

type GeminiUsageSummary = {
  candidatesTokenCount: number | null;
  estimatedCostUsd: number | null;
  promptTokenCount: number | null;
  thoughtsTokenCount: number | null;
  totalTokenCount: number | null;
};

type GeminiAttemptPhase = "before_headers" | "body_parse" | "response_processing" | "success";

type GeminiFailureKind = "http" | "network" | "parse" | "response" | "timeout";

type GeminiAttemptMetric = {
  attempt: number;
  elapsedMs: number;
  failureKind: GeminiFailureKind | null;
  phase: GeminiAttemptPhase;
  retried: boolean;
  status: number | null;
};

type GeminiGenerationTelemetry = {
  attempts: GeminiAttemptMetric[];
  retryOccurred: boolean;
  totalElapsedMs: number;
};

type AiReadingProviderResult = {
  reading: unknown;
  telemetry?: GeminiGenerationTelemetry;
  usage?: GeminiUsageSummary;
};

type ForecastBuildResult = {
  content: string;
  engine: "v1_fallback" | "v2_ai";
  provider: string | null;
  fallbackUsed: boolean;
  ok: boolean;
  errorMessage?: string;
  structuredDailyBrief?: StructuredDailyBrief;
  telemetry?: GeminiGenerationTelemetry;
  usage?: GeminiUsageSummary;
};

async function buildForecastContentResult(input: ReadingEngineGenerationInput): Promise<ForecastBuildResult> {
  const v1Content = buildForecastCopy({
    chart: input.chart,
    displayName: input.displayName,
    timeframe: input.timeframe,
    hasChart: input.hasChart
  });

  if (!isReadingEngineV2Enabled(input.env)) {
    return {
      content: v1Content,
      engine: "v1_fallback",
      provider: null,
      fallbackUsed: true,
      ok: false,
      errorMessage: "Reading Engine v2 is not enabled.",
      structuredDailyBrief: input.timeframe === "daily" ? deriveStructuredDailyBriefFromContent(v1Content) ?? undefined : undefined
    };
  }

  if (!input.hasChart || !hasUsableForecastPlacements(input.chart)) {
    return {
      content: v1Content,
      engine: "v1_fallback",
      provider: null,
      fallbackUsed: true,
      ok: false,
      errorMessage: "Chart placements are not complete enough for Reading Engine v2.",
      structuredDailyBrief: input.timeframe === "daily" ? deriveStructuredDailyBriefFromContent(v1Content) ?? undefined : undefined
    };
  }

  const provider = resolveAiReadingProvider(input.env);
  if (!provider) {
    return {
      content: v1Content,
      engine: "v1_fallback",
      provider: input.env.AI_READING_PROVIDER?.trim().toLowerCase() || null,
      fallbackUsed: true,
      ok: false,
      errorMessage: "No AI reading provider is available.",
      structuredDailyBrief: input.timeframe === "daily" ? deriveStructuredDailyBriefFromContent(v1Content) ?? undefined : undefined
    };
  }

  try {
    const providerResult = await provider.generate(input);
    const validated = validateReadingEngineV2Result(providerResult.reading, input);
    return {
      content: renderReadingEngineV2Result(validated),
      engine: "v2_ai",
      provider: provider.name,
      fallbackUsed: false,
      ok: true,
      structuredDailyBrief: validated.structuredDailyBrief,
      telemetry: providerResult.telemetry,
      usage: providerResult.usage
    };
  } catch (error) {
    console.warn("Reading Engine v2 failed; falling back to v1.", {
      error,
      provider: provider.name,
      timeframe: input.timeframe
    });
    return {
      content: v1Content,
      engine: "v1_fallback",
      provider: provider.name,
      fallbackUsed: true,
      ok: false,
      errorMessage: buildSafeForecastFallbackErrorMessage(error),
      structuredDailyBrief: input.timeframe === "daily" ? deriveStructuredDailyBriefFromContent(v1Content) ?? undefined : undefined,
      telemetry: (error as GeminiRequestError)?.telemetry
    };
  }
}

async function buildForecastContent(input: ReadingEngineGenerationInput) {
  const result = await buildForecastContentResult(input);
  return result.content;
}

function buildSafeForecastFallbackErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (!message) {
    return "Reading Engine v2 could not complete the request.";
  }

  if (/api key/i.test(message) || /auth/i.test(message) || /permission/i.test(message)) {
    return "Reading Engine v2 is not available with the current provider configuration.";
  }

  if (/json/i.test(message) || /extractable text/i.test(message) || /prompt data/i.test(message)) {
    return "Reading Engine v2 returned an unusable response.";
  }

  return "Reading Engine v2 could not complete the request.";
}

function isReadingEngineV2Enabled(env: Env) {
  return env.READING_ENGINE_VERSION?.toLowerCase() === "v2" || env.ENABLE_AI_READINGS?.toLowerCase() === "true";
}

function isPaidAiSmokeEnabled(env: Env) {
  return env.ENABLE_PAID_AI_SMOKE?.toLowerCase() === "true";
}

function isReadingEngineV2CachedContent(content: string) {
  const normalized = content.toLowerCase().replace(/[‘’]/g, "'");

  const explicitMockMarkers = [
    "watch for",
    "why today feels this way",
    "learn your sky",
    "the week's actual story",
    "the month's deeper structure",
    "the year's larger assignment"
  ];

  const providerMarkers = [
    "today's signal",
    "pressure pattern",
    "pressure point",
    "not one mood",
    "it is a sequence",
    "cleaner pattern",
    "better timing",
    "structurally honest",
    "hidden maintenance",
    "reduces hidden maintenance",
    "stronger container",
    "the aligned path",
    "path forward",
    "most aligned self",
    "honest architecture",
    "aligned priority",
    "filter, not a flood"
  ];

  const hasExplicitMockMarker = explicitMockMarkers.some((marker) => normalized.includes(marker));
  const hasProviderMarker = providerMarkers.some((marker) => normalized.includes(marker));
  const hasMove = normalized.includes("your move:");

  return hasExplicitMockMarker || (hasProviderMarker && hasMove);
}


function resolveAiReadingProvider(env: Env): AiReadingProvider | null {
  const provider = env.AI_READING_PROVIDER?.trim().toLowerCase();

  if (provider === "mock") {
    return createMockAiReadingProvider();
  }

  if (provider === "gemini" && env.GEMINI_API_KEY) {
    return createGeminiReadingProvider(env);
  }

  return null;
}

type GeminiTextPart = {
  text?: unknown;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiTextPart[];
  };
  output?: unknown;
  text?: unknown;
};

type GeminiInteractionResponse = {
  output_text?: unknown;
  text?: unknown;
  candidates?: GeminiCandidate[];
  error?: {
    message?: unknown;
  };
  usageMetadata?: GeminiUsageMetadata;
};

type GeminiRequestError = Error & {
  kind?: GeminiFailureKind;
  phase?: GeminiAttemptPhase;
  telemetry?: GeminiGenerationTelemetry;
  status?: number;
  retriable?: boolean;
  retryAfterMs?: number;
};

function extractGeminiOutputText(data: GeminiInteractionResponse): string {
  const directText = [data.output_text, data.text].find((value) => typeof value === "string" && value.trim().length > 0);

  if (typeof directText === "string") {
    return directText.trim();
  }

  const candidateText =
    data.candidates
      ?.flatMap((candidate) => {
        const candidateDirect = [candidate.text, candidate.output].filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0
        );
        const partText =
          candidate.content?.parts
            ?.map((part) => part.text)
            .filter((value): value is string => typeof value === "string" && value.trim().length > 0) ?? [];

        return [...candidateDirect, ...partText];
      })
      .join("\n")
      .trim() ?? "";

  return candidateText;
}

function createGeminiRequestError(
  message: string,
  details: Partial<Pick<GeminiRequestError, "kind" | "phase" | "retryAfterMs" | "retriable" | "status" | "telemetry">> = {}
): GeminiRequestError {
  return Object.assign(new Error(message), details);
}

function parseRetryAfterMs(value: string | null) {
  if (!value) {
    return null;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) {
    return numeric * 1000;
  }

  const retryDate = Date.parse(value);
  if (Number.isFinite(retryDate)) {
    return Math.max(0, retryDate - Date.now());
  }

  return null;
}

function isRetriableGeminiStatus(status: number) {
  return status === 429 || status >= 500;
}

function computeGeminiRetryDelayMs(
  attempt: number,
  retryAfterMs: number | null,
  kind: GeminiRequestError["kind"] | undefined
) {
  if (kind === "timeout") {
    return applyGeminiRetryJitter(attempt === 0 ? 900 : 1500);
  }

  if (retryAfterMs && retryAfterMs > 0) {
    return Math.min(applyGeminiRetryJitter(retryAfterMs), 5000);
  }

  return applyGeminiRetryJitter(500 * 2 ** attempt);
}

function applyGeminiRetryJitter(delayMs: number) {
  const jitterWindow = Math.max(75, Math.round(delayMs * 0.2));
  return delayMs + Math.floor(Math.random() * jitterWindow);
}

function summarizeGeminiError(error: unknown) {
  const geminiError = error as GeminiRequestError;

  return {
    kind: geminiError?.kind ?? "unknown",
    message: error instanceof Error ? error.message : String(error),
    phase: geminiError?.phase ?? null,
    retriable: geminiError?.retriable ?? false,
    retryAfterMs: geminiError?.retryAfterMs ?? null,
    status: geminiError?.status ?? null,
    timeoutMs: geminiError?.kind === "timeout" ? 45000 : null
  };
}

function isGeminiTimeoutError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  return error.name === "AbortError" || message.includes("gemini-timeout") || message.includes("timed out");
}

function normalizeGeminiUsageNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function estimateGeminiCostUsd(model: string, usage: GeminiUsageSummary) {
  const pricing = getGeminiModelPricing(model);
  if (!pricing) {
    return null;
  }

  const inputTokens = usage.promptTokenCount ?? 0;
  const outputTokens = (usage.candidatesTokenCount ?? 0) + (usage.thoughtsTokenCount ?? 0);
  const inputCost = (inputTokens / 1_000_000) * pricing.inputUsdPerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputUsdPerMillion;

  return Number((inputCost + outputCost).toFixed(8));
}

function getGeminiModelPricing(model: string) {
  const normalized = model.trim().toLowerCase();

  // Internal pricing table used only for dev smoke observability.
  if (
    normalized === "gemini-2.5-flash" ||
    normalized === "gemini-2.5-flash-standard" ||
    normalized === "gemini-3.5-flash"
  ) {
    return {
      inputUsdPerMillion: 0.3,
      outputUsdPerMillion: 2.5
    };
  }

  return null;
}

function buildGeminiUsageSummary(model: string, usageMetadata: GeminiUsageMetadata | undefined): GeminiUsageSummary | undefined {
  if (!usageMetadata) {
    return undefined;
  }

  const usage: GeminiUsageSummary = {
    candidatesTokenCount: normalizeGeminiUsageNumber(usageMetadata.candidatesTokenCount),
    estimatedCostUsd: null,
    promptTokenCount: normalizeGeminiUsageNumber(usageMetadata.promptTokenCount),
    thoughtsTokenCount: normalizeGeminiUsageNumber(usageMetadata.thoughtsTokenCount),
    totalTokenCount: normalizeGeminiUsageNumber(usageMetadata.totalTokenCount)
  };

  usage.estimatedCostUsd = estimateGeminiCostUsd(model, usage);
  return usage;
}

function buildGeminiGenerationConfig(model: string) {
  const normalized = model.trim().toLowerCase();
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: 512,
    responseMimeType: "application/json",
    temperature: 0.7
  };

  if (normalized === "gemini-3.5-flash") {
    generationConfig.thinkingLevel = "low";
  }

  return generationConfig;
}

function createGeminiReadingProvider(env: Env): AiReadingProvider {
  return {
    name: "gemini",
    async generate(input) {
      const promptPayload = buildReadingEngineV2PromptPayload(input);
      const prompt = buildReadingEngineV2Prompt(input);

      if (!promptPayload || !prompt) {
        throw new Error("Gemini provider requires usable Reading Engine v2 prompt data.");
      }

      const model = env.AI_READING_MODEL?.trim() || "gemini-3.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const requestBody = JSON.stringify({
        systemInstruction: {
          parts: [{ text: promptPayload.system }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: buildGeminiGenerationConfig(model)
      });

      const maxAttempts = 2;
      const timeoutMs = 45000;
      const attempts: GeminiAttemptMetric[] = [];
      const startedAtMs = Date.now();

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort("gemini-timeout"), timeoutMs);
        const attemptNumber = attempt + 1;
        const attemptStartedAtMs = Date.now();
        let phase: GeminiAttemptPhase = "before_headers";
        let responseStatus: number | null = null;

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY ?? ""
            },
            body: requestBody,
            signal: controller.signal
          });
          responseStatus = response.status;
          phase = "body_parse";

          let data: GeminiInteractionResponse;
          try {
            data = (await response.json()) as GeminiInteractionResponse;
          } catch {
            throw createGeminiRequestError("Gemini response body could not be parsed.", {
              kind: "parse",
              phase,
              retriable: false,
              status: responseStatus
            });
          }

          if (!response.ok) {
            const retryAfterMs = parseRetryAfterMs(response.headers.get("retry-after"));
            const message =
              typeof data.error?.message === "string" ? data.error.message : `Gemini request failed with ${response.status}`;
            throw createGeminiRequestError(message, {
              kind: "http",
              phase,
              retriable: isRetriableGeminiStatus(response.status),
              retryAfterMs: retryAfterMs ?? undefined,
              status: response.status
            });
          }

          phase = "response_processing";
          const outputText = extractGeminiOutputText(data);
          if (!outputText) {
            throw createGeminiRequestError("Gemini response did not include extractable text.", {
              kind: "response",
              phase,
              retriable: false,
              status: responseStatus
            });
          }

          const usage = buildGeminiUsageSummary(model, data.usageMetadata);
          const elapsedMs = Date.now() - attemptStartedAtMs;
          attempts.push({
            attempt: attemptNumber,
            elapsedMs,
            failureKind: null,
            phase: "success",
            retried: false,
            status: responseStatus
          });

          return {
            reading: parseReadingEngineV2ProviderOutput(outputText, input),
            telemetry: {
              attempts,
              retryOccurred: attempts.length > 1,
              totalElapsedMs: Date.now() - startedAtMs
            },
            usage
          };
        } catch (error) {
          const normalizedError = isGeminiTimeoutError(error)
            ? createGeminiRequestError("Gemini request timed out.", {
                phase,
                kind: "timeout",
                retriable: true
              })
            : error instanceof Error
              ? (error as GeminiRequestError)
              : createGeminiRequestError("Gemini request failed.", {
                  kind: "network",
                  phase,
                  retriable: true
                });

          const shouldRetry = Boolean(normalizedError.retriable) && attempt < maxAttempts - 1;
          const elapsedMs = Date.now() - attemptStartedAtMs;
          attempts.push({
            attempt: attemptNumber,
            elapsedMs,
            failureKind: normalizedError.kind ?? "network",
            phase: normalizedError.phase ?? phase,
            retried: shouldRetry,
            status: normalizedError.status ?? responseStatus
          });
          normalizedError.telemetry = {
            attempts: [...attempts],
            retryOccurred: attempts.some((entry) => entry.retried),
            totalElapsedMs: Date.now() - startedAtMs
          };

          console.warn("Gemini reading request failed.", {
            attempt: attemptNumber,
            maxAttempts,
            model,
            elapsedMs,
            ...summarizeGeminiError(normalizedError),
            timeoutMs,
            willRetry: shouldRetry
          });

          if (!shouldRetry) {
            throw normalizedError;
          }

          const delayMs = computeGeminiRetryDelayMs(
            attempt,
            normalizedError.retryAfterMs ?? null,
            normalizedError.kind
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } finally {
          clearTimeout(timeoutId);
        }
      }

      throw createGeminiRequestError("Gemini request failed after retry.", {
        kind: "network",
        retriable: false,
        telemetry: {
          attempts,
          retryOccurred: attempts.some((entry) => entry.retried),
          totalElapsedMs: Date.now() - startedAtMs
        }
      });
    }
  };
}

function parseReadingEngineV2ProviderOutput(outputText: string, input: ReadingEngineGenerationInput): unknown {
  try {
    return parseReadingEngineV2Json(outputText);
  } catch (error) {
    return convertReadingEngineV2ProseToResult(outputText, input);
  }
}

function convertReadingEngineV2ProseToResult(outputText: string, input: ReadingEngineGenerationInput): ReadingEngineV2Result {
  const trimmed = outputText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const rawParagraphs = trimmed
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  let yourMove = "";
  const paragraphs: string[] = [];

  for (const paragraph of rawParagraphs) {
    const moveMatch = paragraph.match(/^\*\*Your move:\*\*\s*(.+)$/is) ?? paragraph.match(/^Your move:\s*(.+)$/is);

    if (moveMatch?.[1]) {
      yourMove = moveMatch[1].trim();
    } else {
      paragraphs.push(paragraph);
    }
  }

  const { moon, rising, sun } = readingEngineNames({
    chart: input.chart,
    displayName: input.displayName
  });

  const fallbackSignals = buildDefaultDailySignals(input);
  const fallbackTitle =
    input.timeframe === "daily"
      ? "Today's Brief"
      : input.timeframe === "weekly"
        ? "Weekly breakdown"
        : input.timeframe === "monthly"
          ? "Monthly structure"
          : "Yearly blueprint";

  if (input.timeframe === "daily") {
    const derivedBrief = deriveStructuredDailyBriefFromContent(trimmed, paragraphs[0] ?? trimmed);
    if (derivedBrief) {
      return buildDailyReadingEngineV2Result(derivedBrief, input, {
        dateLabel: buildReadingEngineV2DateLabel("daily", input.effectiveDate),
        signals: fallbackSignals,
        title: fallbackTitle
      });
    }
  }

  return {
    title: fallbackTitle,
    dateLabel: buildReadingEngineV2DateLabel(input.timeframe, input.effectiveDate),
    paragraphs: paragraphs.length ? paragraphs : [trimmed],
    signals: fallbackSignals,
    yourMove:
      yourMove ||
      "Choose one concrete step that makes the day easier to move through with clarity."
  };
}

function parseReadingEngineV2Json(outputText: string): unknown {
  const trimmed = outputText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");
  const jsonCandidate = firstBrace >= 0 && lastBrace > firstBrace ? jsonText.slice(firstBrace, lastBrace + 1) : jsonText;

  try {
    return JSON.parse(jsonCandidate);
  } catch (error) {
    throw new Error("Provider response was not valid Reading Engine v2 JSON.");
  }
}

function createMockAiReadingProvider(): AiReadingProvider {
  return {
    name: "mock",
    async generate(input) {
      const { firstName, moon, rising, sun } = readingEngineNames({
        chart: input.chart,
        displayName: input.displayName
      });
      const signal = input.chart?.dominantTransit;
      const pressure = signal
        ? `${signal.transitBody} in ${signal.transitSign} pressing on your ${signal.natalBody}`
        : "the current sky asking for cleaner timing";
      const dateLabel = buildReadingEngineV2DateLabel(input.timeframe, input.effectiveDate);

      if (input.timeframe === "daily") {
        const headline =
          signal?.transitBody === "Mercury"
            ? "Clearer pacing keeps the day from tangling."
            : "Small pauses improve the day quickly.";
        const structuredDailyBrief = validateStructuredDailyBrief({
          headline,
          noticeWhen: [
            "You start drafting a reply before you have finished reading the message.",
            "A quick decision feels harder once a second opinion enters the room.",
            "You explain your point twice when one sentence would have done the job."
          ],
          yourMove: "Pause for one full minute before sending your next important message, then cut one unnecessary sentence.",
          whyTodayFeelsThisWay: [
            `${capitalizeFirst(sun.label)} keeps your attention moving toward what feels most important, while ${capitalizeFirst(moon.label)} affects how quickly the moment starts feeling personal.`,
            `${capitalizeFirst(rising.label)} shapes the tone other people meet first. ${signal ? `${signal.transitBody} in ${signal.transitSign} adds extra emphasis around timing and delivery, so careful wording does more for you than fast wording.` : "The current sky puts extra value on timing, so a slower response may be the stronger response."}`,
            "None of this predicts the day for you. It simply shows where steadier pacing can keep ordinary friction from growing into something larger."
          ],
          learnYourSky: "Your Rising sign affects first impressions, while the day’s transit layer changes how quickly conversations heat up or settle down."
        });

        return {
          reading: {
            dateLabel,
            signals: [sun.label, moon.label, rising.label, pressure, "clear communication", "timing"],
            structuredDailyBrief,
            title: "Today's Brief",
            yourMove: structuredDailyBrief.yourMove
          } satisfies Partial<ReadingEngineV2Result>
        };
      }

      if (input.timeframe === "weekly") {
        return {
          reading: {
            title: "Weekly breakdown",
            dateLabel,
            paragraphs: [
              `The week’s actual story is not the loudest event. It is the sequence underneath it, and ${firstName}, your best read comes from noticing where ${sun.label}, ${moon.label}, and ${rising.label} are asking you to stop performing certainty and start moving from alignment.`,
              `Early in the week, ${sun.label} wants ${sun.tone.drive}. That can be powerful, but only if you stop confusing motion with alignment. The first win is not a dramatic leap; it is refusing to spend your life force on a decision that has not earned it.`,
              `Midweek, ${moon.label} becomes the truth serum. It needs ${moon.tone.need}. Notice what gets louder when you are tired, rushed, or trying to keep everyone else comfortable.`,
              `By the end of the week, ${rising.label} becomes the re-entry point. Let ${rising.tone.style} help you return to the world with more signal and less residue. Your most aligned self does not need to drag the whole emotional weather system into every room.`,
              `${pressure} marks the week’s pressure point: the urge to dramatize friction instead of reading it. The path forward is to treat friction as information, not a verdict.`
            ],
            signals: [sun.label, moon.label, rising.label, pressure, "sequence", "emotional weather"],
            yourMove:
              "Choose the repeating situation that keeps asking for your attention. Decide whether it needs action, a boundary, or simply less performance from you."
          } satisfies ReadingEngineV2Result
        };
      }

      if (input.timeframe === "monthly") {
        return {
          reading: {
            title: "Monthly structure",
            dateLabel,
            paragraphs: [
              `${firstName}, the month’s deeper structure is not asking you to become someone else. It is asking you to notice where your current container no longer fits the life trying to come through.`,
              `${capitalizeFirst(sun.label)} shows where the month wants movement: ${sun.tone.drive}. But your most aligned self does not move just to prove growth is happening. It moves when the timing, truth, and next step begin to agree.`,
              `${capitalizeFirst(moon.label)} names the emotional term that cannot be skipped: ${moon.tone.need}. If that need is treated as optional, the month gets noisier. If it is honored, your choices start working with your energy instead of against it.`,
              `${capitalizeFirst(rising.label)} is the public-facing adjustment. This month, the path forward is not simply to be more visible. It is to become more legible to the right people, in the right rooms, for the right reasons.`,
              `${pressure} gives the month its repeating signal. When the same theme returns, do not call it failure. Call it evidence. The pattern is showing you what needs a stronger structure, a cleaner boundary, or a more honest belief.`
            ],
            signals: [sun.label, moon.label, rising.label, pressure, "structure", "legibility"],
            yourMove:
              "Name one structure you keep outgrowing and one structure you keep pretending still fits. Let that contrast set the month’s aligned priority."
          } satisfies ReadingEngineV2Result
        };
      }

      return {
        reading: {
          title: "Yearly blueprint",
          dateLabel,
          paragraphs: [
            `${firstName}, the year’s larger assignment is to build a life that can hold more truth without requiring constant emergency energy.`,
            `${capitalizeFirst(sun.label)} shows the direction of becoming: ${sun.tone.drive}. ${capitalizeFirst(moon.label)} shows the emotional term that cannot be skipped: ${moon.tone.need}. ${capitalizeFirst(rising.label)} shows how the world keeps asking you to become more legible without becoming less yourself.`,
            `This is not reinvention for spectacle. It is the construction of a cleaner container for the person you already know you are becoming. The old version of you may still be negotiating, but the future version needs practical advantages, not just hope.`,
            `${pressure} gives the year its pressure point. Pay attention to where the same lesson keeps wearing different clothes. That is where your life is asking for a more honest architecture: a choice, structure, or belief that lets your most aligned self become easier to live from.`
          ],
          signals: [sun.label, moon.label, rising.label, pressure, "larger assignment", "honest architecture"],
          yourMove:
            "Pick the area of life where the old version of you keeps negotiating with the future version. Give your most aligned self one practical advantage this week."
        } satisfies ReadingEngineV2Result
      };
    }
  };
}

function validateReadingEngineV2Result(value: unknown, input: ReadingEngineGenerationInput): ReadingEngineV2Result {
  if (!value || typeof value !== "object") {
    throw new Error("Reading Engine v2 returned a non-object payload.");
  }

  const record = value as Record<string, unknown>;

  if (input.timeframe === "daily" && record.structuredDailyBrief) {
    const structuredDailyBrief = validateStructuredDailyBrief(record.structuredDailyBrief);
    const result = buildDailyReadingEngineV2Result(structuredDailyBrief, input, {
      dateLabel: sanitizeReadingText(record.dateLabel) || buildReadingEngineV2DateLabel("daily", input.effectiveDate),
      signals: Array.isArray(record.signals)
        ? record.signals.map(sanitizeReadingText).filter(Boolean).slice(0, 8)
        : buildDefaultDailySignals(input),
      title: sanitizeReadingText(record.title) || "Today's Brief"
    });
    assertValidReadingEngineV2Copy(renderReadingEngineV2Result(result));
    return result;
  }

  const title = sanitizeReadingText(record.title);
  const dateLabel = sanitizeReadingText(record.dateLabel);
  const paragraphs = Array.isArray(record.paragraphs)
    ? record.paragraphs.map(sanitizeReadingText).filter(Boolean).slice(0, 6)
    : [];
  const signals = Array.isArray(record.signals)
    ? record.signals.map(sanitizeReadingText).filter(Boolean).slice(0, 8)
    : [];
  const yourMove = sanitizeReadingText(record.yourMove);

  if (!title || !dateLabel || paragraphs.length < 3 || !yourMove) {
    throw new Error("Reading Engine v2 returned an incomplete payload.");
  }

  const rendered = [...paragraphs, yourMove].join(" ");
  assertValidReadingEngineV2Copy(rendered);

  const result: ReadingEngineV2Result = {
    dateLabel,
    paragraphs,
    signals,
    title,
    yourMove
  };

  if (input.timeframe === "daily") {
    result.structuredDailyBrief = deriveStructuredDailyBriefFromContent(renderReadingEngineV2Result(result)) ?? undefined;
  }

  return result;
}

function renderReadingEngineV2Result(reading: ReadingEngineV2Result) {
  if (reading.structuredDailyBrief) {
    return `${renderStructuredDailyBriefParagraphs(reading.structuredDailyBrief).join("\n\n")}\n\n**Your move:** ${reading.structuredDailyBrief.yourMove}`;
  }

  return `${reading.paragraphs.join("\n\n")}\n\n**Your move:** ${reading.yourMove}`;
}

function assertValidReadingEngineV2Copy(content: string) {
  const banned = [/your your/i, /sun sun/i, /moon moon/i, /rising rising/i, /as an ai/i, /language model/i];

  for (const pattern of banned) {
    if (pattern.test(content)) {
      throw new Error("Reading Engine v2 copy failed hygiene validation.");
    }
  }
}

function sanitizeReadingText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function buildReadingEngineV2DateLabel(timeframe: ForecastTimeframe, effectiveDate: string) {
  if (timeframe === "daily") {
    return effectiveDate;
  }

  if (timeframe === "weekly") {
    return `Week of ${effectiveDate}`;
  }

  if (timeframe === "monthly") {
    return `Month of ${effectiveDate.slice(0, 7)}`;
  }

  return `Year of ${effectiveDate.slice(0, 4)}`;
}


async function handleStarScope(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<StarScopeRequest>(request);
  const question = requireString(body.question, "question");
  const entitlements = await loadEntitlements(env, auth.token);

  if (!hasProductAccess(env, entitlements, "starscope_unlock")) {
    throw new HttpError(402, "StarScope requires Cosmic Pass or the one-time unlock.", {
      requiredProductKey: "starscope_unlock"
    });
  }

  const profile = await loadProfile(env, auth.user.id);
  const chart = await loadChart(env, auth.user.id);
  const content = buildStarScopeCopy({
    chart: normalizeChartPayload(chart?.chart_json),
    displayName: resolveMemberDisplayName({ profile, user: auth.user }),
    hasChart: Boolean(chart),
    question
  });

  return json({
    content,
    productKey: entitlements.premium_active ? inferSubscriptionProductKey(entitlements) ?? "monthly_pass" : "starscope_unlock",
    question
  });
}

async function handleLoveScope(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<LoveScopeRequest>(request);
  const partnerName = requireString(body.partnerName, "partnerName");
  const relationshipType = requireString(body.relationshipType, "relationshipType");
  const situation = requireString(body.situation, "situation");
  const entitlements = await loadEntitlements(env, auth.token);

  if (!hasProductAccess(env, entitlements, "lovescope_unlock")) {
    throw new HttpError(402, "LoveScope requires Cosmic Pass or the one-time unlock.", {
      requiredProductKey: "lovescope_unlock"
    });
  }

  const profile = await loadProfile(env, auth.user.id);
  const chart = await loadChart(env, auth.user.id);
  const content = buildLoveScopeCopy({
    chart: normalizeChartPayload(chart?.chart_json),
    displayName: resolveMemberDisplayName({ profile, user: auth.user }),
    hasChart: Boolean(chart),
    partnerBirthDate: body.partnerBirthDate ?? null,
    partnerName,
    relationshipType,
    situation
  });

  return json({
    content,
    partnerName,
    productKey: entitlements.premium_active ? inferSubscriptionProductKey(entitlements) ?? "monthly_pass" : "lovescope_unlock",
    relationshipType
  });
}

async function handleVerifyAppleTransaction(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<VerifyAppleTransactionRequest>(request);
  const productKey = requireProductKey(body.productKey);
  const product = PREMIUM_PRODUCTS[productKey];

  if (!product.iosProductId) {
    throw new HttpError(400, "This product is not configured for Apple purchase verification.");
  }

  const entitlements = await applyEntitlementUpdate(env, {
    expiresAt: body.expiresAt ?? null,
    isActive: body.isActive ?? true,
    platform: "ios",
    productKey,
    purchasedAt: body.purchasedAt ?? null,
    source: "revenuecat",
    userId: auth.user.id
  });

  return json({
    entitlement: mapEntitlementsToSnapshot(entitlements),
    message: "Entitlements synced from Apple purchase data.",
    originalTransactionId: body.originalTransactionId ?? null,
    productKey
  });
}

async function handleAppleServerNotification(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const bearer = env.APPLE_SERVER_NOTIFICATION_BEARER?.trim();
  if (!bearer) {
    throw new HttpError(501, "Apple server notification bearer secret is not configured.");
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${bearer}`) {
    throw new HttpError(401, "Invalid Apple server notification bearer token.");
  }

  const body = await readJson<{
    expiresAt?: string | null;
    isActive?: boolean;
    platform?: "ios";
    productKey?: ProductKey;
    purchasedAt?: string | null;
    source?: EntitlementSyncSource;
    userId?: string;
  }>(request);
  const userId = requireString(body.userId, "userId");
  const productKey = requireProductKey(body.productKey);
  const source = body.source === "admin" ? "admin" : "revenuecat";

  const entitlements = await applyEntitlementUpdate(env, {
    expiresAt: body.expiresAt ?? null,
    isActive: body.isActive ?? true,
    platform: "ios",
    productKey,
    purchasedAt: body.purchasedAt ?? null,
    source,
    userId
  });

  return json({
    entitlement: mapEntitlementsToSnapshot(entitlements),
    message: "Entitlements synced from Apple server notification.",
    productKey,
    userId
  });
}

async function handleLogin(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const body = await readJson<LoginPayload>(request);
  const email = requireString(body.email, "email");
  const password = requireString(body.password, "password");

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    body: JSON.stringify({ email, password }),
    headers: jsonHeaders(env.SUPABASE_ANON_KEY),
    method: "POST"
  });
  const payload = (await readSupabasePayload(response)) as SupabaseAuthPayload;

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to log in.", payload);
  }

  return json(normalizeAuthPayload(payload), { status: 200 });
}

async function handleResetPassword(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const body = await readJson<LoginPayload>(request);
  const email = requireString(body.email, "email");
  const redirectTo = `${getAppOrigin(request, env).replace(/\/$/, "")}/reset`;

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/recover`, {
    body: JSON.stringify({ email, redirectTo }),
    headers: jsonHeaders(env.SUPABASE_ANON_KEY),
    method: "POST"
  });
  const payload = await readSupabasePayload(response);

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to send reset email.", payload);
  }

  return json({
    message: "If that account exists, a reset email is on the way."
  });
}

async function handleUpdatePassword(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<{ password?: string }>(request);
  const password = requireString(body.password, "password");

  if (password.length < 6) {
    throw new HttpError(400, "Choose a password with at least 6 characters.");
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    body: JSON.stringify({ password }),
    headers: {
      ...userHeaders(env, auth.token),
      "content-type": "application/json"
    },
    method: "PUT"
  });
  const payload = await readSupabasePayload(response);

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to update the password.", payload);
  }

  return json({
    message: "Password updated. You can return to your reading now."
  });
}

async function handleSignup(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const body = await readJson<SignupPayload>(request);
  const email = requireString(body.email, "email");
  const password = requireString(body.password, "password");
  const displayName = body.displayName?.trim() || email.split("@")[0];

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
    body: JSON.stringify({
      data: {
        birthDate: body.birthDate ?? null,
        birthPlace: body.birthPlace ?? null,
        birthTime: body.birthTime ?? null,
        birth_date: body.birthDate ?? null,
        birth_place: body.birthPlace ?? null,
        birth_time: body.birthTime ?? null,
        display_name: displayName,
        first_name: displayNameToFirstName(displayName),
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        timezone: body.timezone ?? null,
        timezoneOffset: body.timezoneOffset ?? null,
        timezone_offset: body.timezoneOffset ?? null,
        unknownBirthTime: body.unknownBirthTime ?? false,
        unknown_birth_time: body.unknownBirthTime ?? false
      },
      email,
      password
    }),
    headers: jsonHeaders(env.SUPABASE_ANON_KEY),
    method: "POST"
  });
  const payload = (await readSupabasePayload(response)) as SupabaseAuthPayload;

  if (!response.ok) {
    throw new HttpError(response.status, describeSignupError(payload), payload);
  }

  const userId = payload.user?.id ?? payload.session?.user?.id;
  if (userId) {
    await upsertProfile(env, userId, {
      birthDate: body.birthDate,
      birthPlace: body.birthPlace,
      birthTime: body.birthTime,
      displayName,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      timezoneOffset: body.timezoneOffset,
      unknownBirthTime: body.unknownBirthTime ?? false
    });
  }

  return json(normalizeAuthPayload(payload), { status: 200 });
}

async function upsertProfile(
  env: Env,
  userId: string,
  profile: {
    birthDate?: string;
    birthPlace?: string;
    birthTime?: string;
    displayName: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    timezoneOffset?: number;
    unknownBirthTime: boolean;
  }
) {
  const payload = {
    birth_date: profile.birthDate ?? null,
    birth_place: profile.birthPlace ?? null,
    birth_time: profile.birthTime ?? null,
    display_name: profile.displayName,
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null,
    timezone: profile.timezone ?? null,
    timezone_offset: profile.timezoneOffset ?? null,
    unknown_birth_time: profile.unknownBirthTime,
    updated_at: new Date().toISOString(),
    user_id: userId
  };

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/user_profiles`, {
    body: JSON.stringify(payload),
    headers: {
      ...serviceRoleHeaders(env),
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    method: "POST"
  });

  const result = await readSupabasePayload(response);
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to upsert the user profile.", result);
  }

  await ensureEntitlementRow(env, userId);
}

async function authenticateRequest(request: Request, env: Env) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token.");
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new HttpError(401, "Missing bearer token.");
  }

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: userHeaders(env, token)
  });
  const payload = (await readSupabasePayload(response)) as SupabaseUser;

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to authenticate the current member.", payload);
  }

  return { token, user: payload };
}

async function loadProfile(env: Env, userId: string) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${encodeURIComponent(userId)}&select=display_name,birth_date,birth_time,birth_place,latitude,longitude,timezone,timezone_offset,unknown_birth_time`,
    {
      headers: {
        ...serviceRoleHeaders(env),
        accept: "application/vnd.pgrst.object+json"
      }
    }
  );
  const payload = await readSupabasePayload(response);
  if (response.status === 406) {
    return null;
  }
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load the cached profile.", payload);
  }
  return firstSupabaseRow<ProfileRow>(payload);
}

async function loadEntitlements(env: Env, token: string) {
  const query =
    "select=premium_active,premium_source,stripe_active,revenuecat_active,lovescope_unlocked,starscope_unlocked,forecast_monthly_unlocked,yearly_blueprint_unlocked,active_until,updated_at";
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/app_entitlements?${query}`, {
    headers: {
      ...userHeaders(env, token),
      accept: "application/vnd.pgrst.object+json"
    }
  });
  const payload = await readSupabasePayload(response);
  if (response.status === 406) {
    return {
      active_until: null,
      forecast_monthly_unlocked: false,
      lovescope_unlocked: false,
      premium_active: false,
      premium_source: "none" as const,
      revenuecat_active: false,
      starscope_unlocked: false,
      stripe_active: false,
      updated_at: new Date(0).toISOString(),
      yearly_blueprint_unlocked: false
    } satisfies EntitlementsRow;
  }
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load entitlements.", payload);
  }
  return payload as EntitlementsRow;
}

async function loadEntitlementsByUserId(env: Env, userId: string) {
  const query =
    "select=premium_active,premium_source,stripe_active,revenuecat_active,lovescope_unlocked,starscope_unlocked,forecast_monthly_unlocked,yearly_blueprint_unlocked,active_until,updated_at";
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/app_entitlements?user_id=eq.${encodeURIComponent(userId)}&${query}`,
    {
      headers: {
        ...serviceRoleHeaders(env),
        accept: "application/vnd.pgrst.object+json"
      }
    }
  );
  const payload = await readSupabasePayload(response);
  if (response.status === 406) {
    return null;
  }
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load entitlements.", payload);
  }
  return payload as EntitlementsRow;
}

async function loadChart(env: Env, userId: string) {
  const response = await fetch(
    `${env.SUPABASE_URL}/rest/v1/natal_charts?user_id=eq.${encodeURIComponent(userId)}&select=chart_json,chart_summary,source_version,created_at,updated_at`,
    {
      headers: {
        ...serviceRoleHeaders(env),
        accept: "application/vnd.pgrst.object+json"
      }
    }
  );
  const payload = await readSupabasePayload(response);
  if (response.status === 406) {
    return null;
  }
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load the cached natal chart.", payload);
  }
  return firstSupabaseRow<ChartRow>(payload);
}

async function loadForecast(
  env: Env,
  userId: string,
  timeframe: ForecastTimeframe,
  effectiveDate: string,
  token: string
) {
  const params = new URLSearchParams({
    select: "content,effective_date,timeframe,created_at,refreshed_at",
    timeframe: `eq.${timeframe}`,
    effective_date: `eq.${effectiveDate}`,
    user_id: `eq.${userId}`
  });
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/forecast_cache?${params.toString()}`, {
    headers: {
      ...userHeaders(env, token),
      accept: "application/vnd.pgrst.object+json"
    }
  });
  const payload = await readSupabasePayload(response);
  if (response.status === 406) {
    return null;
  }
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to load the cached forecast.", payload);
  }
  return payload as ForecastRow;
}

function normalizeAuthPayload(payload: SupabaseAuthPayload) {
  const session = payload.session ?? payload;
  const user = payload.user ?? session.user ?? null;

  return {
    session: {
      accessToken: session.access_token ?? null,
      expiresAt: session.expires_at ?? null,
      expiresIn: session.expires_in ?? null,
      refreshToken: session.refresh_token ?? null
    },
    user
  };
}

function firstSupabaseRow<TRow>(payload: unknown): TRow | null {
  if (Array.isArray(payload)) {
    return (payload[0] as TRow | undefined) ?? null;
  }

  if (payload && typeof payload === "object") {
    return payload as TRow;
  }

  return null;
}

function asProductKey(value: string | null): ProductKey | null {
  if (value && value in PREMIUM_PRODUCTS) {
    return value as ProductKey;
  }

  return null;
}

function inferSubscriptionProductKey(entitlements: EntitlementsRow): ProductKey | null {
  if (!entitlements.premium_active) {
    return null;
  }

  if (entitlements.revenuecat_active || entitlements.stripe_active) {
    return "monthly_pass";
  }

  return null;
}

async function ensureEntitlementRow(env: Env, userId: string) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/app_entitlements`, {
    body: JSON.stringify({
      premium_active: false,
      premium_source: "none",
      revenuecat_active: false,
      stripe_active: false,
      updated_at: new Date().toISOString(),
      user_id: userId
    }),
    headers: {
      ...serviceRoleHeaders(env),
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal"
    },
    method: "POST"
  });

  const result = await readSupabasePayload(response);
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to seed the entitlement row.", result);
  }
}

function buildChartSnapshot(input: {
  birthDate: string | null;
  birthPlace: string | null;
  birthTime: string | null;
  displayName: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  unknownBirthTime: boolean;
}) {
  const birthDate = requireDateString(input.birthDate, "birthDate");
  const birthTime = input.unknownBirthTime ? "12:00" : requireTimeString(input.birthTime, "birthTime");
  const latitude = requireFiniteNumber(input.latitude, "latitude");
  const longitude = requireFiniteNumber(input.longitude, "longitude");
  const timezone = input.timezone?.trim() || "UTC";
  const birthInstant = zonedLocalTimeToUtc(birthDate, birthTime, timezone);
  const natalPlanets = buildPlanetSet(birthInstant);
  const transits = buildPlanetSet(new Date());
  const risingLongitude = input.unknownBirthTime ? null : calculateAscendantLongitude(birthInstant, latitude, longitude);
  const risingSign = risingLongitude === null ? "Solar chart" : zodiacAt(risingLongitude).sign;
  const strongestTransit = findStrongestTransit(natalPlanets, transits);
  const sun = requirePlacement(natalPlanets, "Sun");
  const moon = requirePlacement(natalPlanets, "Moon");
  const summary = `Your chart centers on ${sun.sign} drive, ${moon.sign} emotional timing, and ${risingSign} presentation. Together, these placements show how you pursue what matters, how you react under pressure, and how other people read you before you explain yourself.`;

  return {
    chart: {
      bigThree: {
        moon: moon.sign,
        rising: risingSign,
        sun: sun.sign
      },
      accuracy: {
        engine: "astronomy-engine",
        houses: input.unknownBirthTime ? "solar_chart_no_birth_time" : "ascendant_calculated_from_sidereal_time",
        planets: "geocentric_true_ecliptic_longitude"
      },
      birth: {
        date: input.birthDate,
        instantUtc: birthInstant.toISOString(),
        latitude,
        longitude,
        place: input.birthPlace,
        time: input.birthTime,
        timezone,
        unknownBirthTime: input.unknownBirthTime
      },
      dominantTransit: strongestTransit,
      planets: natalPlanets,
      transits,
      wheel: {
        ascendant: risingLongitude === null ? null : degreePayload(risingLongitude),
        midheaven: risingLongitude === null ? null : degreePayload(calculateMidheavenLongitude(birthInstant, longitude))
      }
    },
    sourceVersion: CHART_SOURCE_VERSION,
    summary
  };
}

type Placement = {
  body: string;
  degree: number;
  degreeInSign: number;
  retrograde: boolean;
  sign: string;
};

type DegreePoint = {
  degree: number;
  degreeInSign: number;
  sign: string;
};

type ChartPayload = {
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
    date?: string;
    instantUtc?: string;
    latitude?: number;
    longitude?: number;
    place?: string;
    time?: string;
    timezone?: string;
    unknownBirthTime?: boolean;
  };
  dominantTransit?: TransitSignal;
  transitSignals?: TransitSignal[];
  planets?: Placement[];
  transits?: Placement[];
  wheel?: {
    ascendant?: DegreePoint | null;
    midheaven?: DegreePoint | null;
  };
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

function displayNameToFirstName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, (match) => match.split("@")[0] ?? "Member")
    .split(/[@._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return cleaned.split(" ")[0] || "Member";
}

function resolveMemberDisplayName(input: { profile: ProfileRow | null; user: SupabaseUser }) {
  const metadata = input.user.user_metadata;
  const candidate =
    normalizeDisplayNameCandidate(input.profile?.display_name) ??
    normalizeDisplayNameCandidate(readMetadataString(metadata, "display_name")) ??
    normalizeDisplayNameCandidate(readMetadataString(metadata, "full_name")) ??
    normalizeDisplayNameCandidate(readMetadataString(metadata, "name")) ??
    normalizeDisplayNameCandidate(readMetadataString(metadata, "first_name"));

  if (candidate) {
    return candidate;
  }

  if (input.user.email) {
    return displayNameToFirstName(input.user.email);
  }

  return "Member";
}

function normalizeDisplayNameCandidate(value: string | null | undefined) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function readMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function readMetadataNumber(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readMetadataBoolean(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "boolean" ? value : null;
}

function resolveAuthBirthMetadata(user: SupabaseUser) {
  const metadata = user.user_metadata;
  return {
    birthDate: readMetadataString(metadata, "birthDate") ?? readMetadataString(metadata, "birth_date"),
    birthPlace: readMetadataString(metadata, "birthPlace") ?? readMetadataString(metadata, "birth_place"),
    birthTime: readMetadataString(metadata, "birthTime") ?? readMetadataString(metadata, "birth_time"),
    latitude: readMetadataNumber(metadata, "latitude"),
    longitude: readMetadataNumber(metadata, "longitude"),
    timezone: readMetadataString(metadata, "timezone"),
    timezoneOffset: readMetadataNumber(metadata, "timezoneOffset") ?? readMetadataNumber(metadata, "timezone_offset"),
    unknownBirthTime: readMetadataBoolean(metadata, "unknownBirthTime") ?? readMetadataBoolean(metadata, "unknown_birth_time") ?? false
  };
}

function normalizeBirthTimeValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const cleaned = value.trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(cleaned)) {
    return cleaned.slice(0, 5);
  }

  return cleaned || null;
}

const ASTROLOGY_BODIES = [
  Astronomy.Body.Sun,
  Astronomy.Body.Moon,
  Astronomy.Body.Mercury,
  Astronomy.Body.Venus,
  Astronomy.Body.Mars,
  Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn,
  Astronomy.Body.Uranus,
  Astronomy.Body.Neptune,
  Astronomy.Body.Pluto
] as const;

const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
] as const;

type ReadingEngineSignTone = {
  drive: string;
  gift: string;
  need: string;
  shadow: string;
  style: string;
};

const READING_ENGINE_SIGN_TONES: Record<string, ReadingEngineSignTone> = {
  Aries: {
    drive: "to act before the room has finished negotiating with itself",
    gift: "clean initiative",
    need: "directness, movement, and a clear place to put heat",
    shadow: "turning urgency into proof",
    style: "decisive presence"
  },
  Taurus: {
    drive: "to make life more stable, tangible, and worth inhabiting",
    gift: "endurance and practical taste",
    need: "consistency, physical ease, and evidence that something is real",
    shadow: "mistaking comfort for safety",
    style: "grounded steadiness"
  },
  Gemini: {
    drive: "to name the pattern, test the angle, and keep information moving",
    gift: "mental agility",
    need: "conversation, options, and enough room to change your mind honestly",
    shadow: "staying in motion to avoid choosing",
    style: "quick intelligence"
  },
  Cancer: {
    drive: "to protect what matters and build from emotional truth",
    gift: "devotion and memory",
    need: "belonging, privacy, and proof that care is being returned",
    shadow: "letting old weather make the present smaller",
    style: "protective sensitivity"
  },
  Leo: {
    drive: "to live from the part of you that refuses to be dimmed",
    gift: "creative authority",
    need: "warmth, recognition, and space to express the real self",
    shadow: "confusing visibility with validation",
    style: "expressive command"
  },
  Virgo: {
    drive: "to improve the system until it can actually hold real life",
    gift: "discernment",
    need: "usefulness, order, and a way to turn concern into craft",
    shadow: "using correction to manage anxiety",
    style: "precise attention"
  },
  Libra: {
    drive: "to create proportion, beauty, and terms people can actually live with",
    gift: "relational intelligence",
    need: "balance, reciprocity, and enough peace to hear yourself clearly",
    shadow: "over-accommodating until the truth becomes expensive",
    style: "social grace"
  },
  Scorpio: {
    drive: "to get beneath the surface and stop pretending the obvious is enough",
    gift: "emotional x-ray vision",
    need: "trust, depth, and a place where intensity does not have to perform",
    shadow: "holding power by withholding truth",
    style: "magnetic privacy"
  },
  Sagittarius: {
    drive: "to find the larger truth and move toward a life with more meaning",
    gift: "vision and courage",
    need: "freedom, honesty, and a horizon big enough to grow toward",
    shadow: "using certainty to outrun complexity",
    style: "restless candor"
  },
  Capricorn: {
    drive: "to build something real enough to survive pressure",
    gift: "strategy and responsibility",
    need: "respect, structure, and proof that effort is becoming substance",
    shadow: "treating softness like a liability",
    style: "earned authority"
  },
  Aquarius: {
    drive: "to see the system clearly and refuse the version that keeps people smaller",
    gift: "future-minded clarity",
    need: "space, perspective, and people who do not punish difference",
    shadow: "detaching before the feeling has finished speaking",
    style: "unusual perspective"
  },
  Pisces: {
    drive: "to feel the hidden current and translate what others miss",
    gift: "imagination and compassion",
    need: "spaciousness, meaning, and protection from emotional overexposure",
    shadow: "dissolving boundaries instead of choosing a form",
    style: "porous intuition"
  }
};

function readingEngineTone(sign: string | undefined): ReadingEngineSignTone {
  if (sign && READING_ENGINE_SIGN_TONES[sign]) {
    return READING_ENGINE_SIGN_TONES[sign];
  }

  return {
    drive: "to move toward what feels true",
    gift: "pattern recognition",
    need: "clarity, steadiness, and room to respond honestly",
    shadow: "reacting before the deeper signal is clear",
    style: "a distinctive presence"
  };
}

function readingEngineTransitLine(signal: ChartPayload["dominantTransit"] | undefined) {
  if (!signal) {
    return "The current sky is not giving one dramatic headline; it is asking for cleaner pacing, cleaner choices, and a better relationship with what your body already knows.";
  }

  return `${signal.transitBody} in ${signal.transitSign} is pressing on your ${signal.natalBody}, so the day has a specific pressure point: the part of you that wants movement is negotiating with the part of you that needs a more honest container.`;
}

type ReadingEnginePlacementDescriptor = {
  label: string;
  role: "Sun" | "Moon" | "Rising";
  sign?: string;
  tone: ReadingEngineSignTone;
};

function readingEngineNames(input: { chart: ChartPayload | null; displayName: string }) {
  const firstName = displayNameToFirstName(input.displayName);
  const sun = buildReadingEnginePlacement(input.chart?.bigThree?.sun, "Sun");
  const moon = buildReadingEnginePlacement(input.chart?.bigThree?.moon, "Moon");
  const rising = buildReadingEnginePlacement(
    input.chart?.bigThree?.rising,
    "Rising",
    input.chart?.birth?.unknownBirthTime ? "your solar chart horizon" : undefined
  );
  return {
    firstName,
    moon,
    rising,
    sun
  };
}

function buildForecastCopy(input: { chart: ChartPayload | null; displayName: string; timeframe: ForecastTimeframe; hasChart: boolean }) {
  if (!input.hasChart) {
    return `Your CosmoScope is open, but the chart record is not complete enough for a precise reading yet.\n\nAdd the exact birth date, time, and place so the system can calculate the pattern instead of giving you a generic interpretation.\n\n**Your move:** complete the birth record, then come back for the reading that is actually yours.`;
  }

  if (!hasUsableForecastPlacements(input.chart)) {
    return `Your CosmoScope chart is saved, but the core placements did not load cleanly enough for a precise reading.\n\nRefresh the chart so the system can read your actual Sun, Moon, and Rising instead of falling back to generic placeholders.\n\n**Your move:** regenerate the chart, then open the forecast again.`;
  }

  const signal = input.chart?.dominantTransit;
  const { firstName, moon, rising, sun } = readingEngineNames(input);
  const transitLine = readingEngineTransitLine(signal);

  if (input.timeframe === "daily") {
    return `${firstName}, today’s signal is not simply “good” or “bad.” It is a pressure pattern. ${capitalizeFirst(sun.label)} wants ${sun.tone.drive}, but the day works better when that drive is given shape instead of speed. ${transitLine}\n\n${capitalizeFirst(moon.label)} is the body-level clue. It usually needs ${moon.tone.need}, so if something feels louder than it should, treat that as information instead of an emergency. The emotional charge is not the instruction; it is the flare that shows you where the system wants care, limits, or a cleaner decision.\n\n${capitalizeFirst(rising.label)} is how the room meets you before you explain yourself. Let ${rising.tone.style} lead without turning it into performance. The cleanest use of today is to make your signal easier to read: fewer defensive explanations, fewer rushed commitments, and more attention to the choice that would actually lower the noise.\n\n**Your move:** choose one place where your nervous system wants instant certainty, then slow it down until the next right action becomes obvious.`;
  }

  if (input.timeframe === "weekly") {
    return `This week is not one mood. It is a sequence, and ${firstName}, your best read comes from noticing when the pressure changes form.\n\nEarly in the week, ${sun.label} wants ${sun.tone.drive}, but the first move should be restraint, not proof. Start by narrowing the field. The task is not to win the whole week at once; it is to stop leaking energy into decisions that do not deserve that much of you.\n\nMidweek brings the sharper signal. ${signal ? `${signal.transitBody} pressing on your ${signal.natalBody} can make urgency sound more convincing than wisdom.` : "The pattern becomes easier to see once the week has created enough friction to reveal it."} This is where ${moon.label} needs ${moon.tone.need}. If you override that need, the week gets noisier. If you honor it cleanly, you recover leverage.\n\nBy the end of the week, ${rising.label} matters more than you may expect. That ${rising.tone.style} can help you re-enter conversations without dragging the whole emotional weather system behind you. The win is not a dramatic resolution. The win is a cleaner pattern, better timing, and one decision that finally feels structurally honest.\n\n**Your move:** pick the one situation that keeps asking for your attention, then decide whether it needs action, a boundary, or simply less performance from you.`;
  }

  if (input.timeframe === "monthly") {
    return `${firstName}, this month is about structure: not the kind that makes life rigid, but the kind that lets your actual life hold more truth without spilling into constant reaction.\n\n${capitalizeFirst(sun.label)} is working through the deeper question underneath that drive. That desire is not wrong, but it needs a better container. The first part of the month shows you what has been running on habit, obligation, or old momentum. Pay attention to the places that look functional from the outside but feel expensive on the inside.\n\nThe middle of the month asks for a cleaner relationship with pressure. ${signal ? `${signal.transitBody} in ${signal.transitSign} activating your ${signal.natalBody} can make growth feel urgent, but urgency is not the same thing as readiness.` : "The live transit layer points toward consolidation rather than spectacle."} Let ${moon.label} name what it actually needs: ${moon.tone.need}. That need is not a weakness. It is a diagnostic tool.\n\nBy the final stretch of the month, the practical question becomes visible: what can stay, what has to be renegotiated, and what has only survived because you kept absorbing the cost? ${capitalizeFirst(rising.label)} shows the adjustment publicly through ${rising.tone.style}. People may notice the shift before they understand it.\n\nWork and money: choose the commitment that gives your effort a cleaner return. Love and family: stop translating your needs into hints. Body and energy: protect the rhythm that keeps you from confusing depletion with devotion.\n\n**Your move:** make one structural change this month that reduces hidden maintenance. The goal is not to make life smaller; it is to stop letting noise consume the energy meant for your actual growth.`;
  }

  return `${firstName}, the year is not asking you to become a different person. It is asking you to build a stronger container for the person you already are becoming.\n\n${capitalizeFirst(sun.label)} describes the central engine of the year. In the year ahead, that drive needs more than inspiration. It needs standards, timing, and a structure honest enough to hold the weight of what you say you want. Anything built only on mood will ask to be rebuilt later.\n\n${capitalizeFirst(moon.label)} names the emotional contract underneath the year. It needs ${moon.tone.need}, and when that need is ignored, your system will start sending signals through fatigue, sensitivity, resentment, or over-control. The emotional work of the year is not to become unaffected. It is to stop abandoning your own weather until it becomes a storm.\n\n${capitalizeFirst(rising.label)} describes the visible arc: ${rising.tone.style}. This is how the year teaches you to enter rooms, relationships, decisions, and opportunities with less distortion. You do not need to explain every layer of yourself to be legible. You need to make choices that let the right people read the signal clearly.\n\nThe first quarter is for clearing false urgency. The second quarter is for choosing the structure that can hold real growth. The third quarter tests whether the new rhythm works under pressure. The final quarter shows what becomes possible when your ambition, emotional truth, and public presentation stop competing with one another.\n\n${signal ? `The headline transit pattern — ${signal.transitBody} in ${signal.transitSign} pressing on your ${signal.natalBody} — gives the year its pressure point. It shows where growth will not come from forcing the issue, but from learning how to carry power with better timing.` : "The year’s strongest signal is steadiness: less performance, more discernment, fewer inherited obligations, and a cleaner relationship with what you are actually here to build."}\n\n**Your move:** choose the life structure that can still respect you when things get busy, emotional, or uncertain. That is the structure worth building the year around.`;
  }

function hasUsableForecastPlacements(chart: ChartPayload | null) {
  if (!chart?.bigThree?.sun || !chart?.bigThree?.moon) {
    return false;
  }

  if (chart.birth?.unknownBirthTime) {
    return true;
  }

  return Boolean(chart.bigThree.rising);
}

function buildReadingEnginePlacement(
  sign: string | undefined,
  role: "Sun" | "Moon" | "Rising",
  fallbackLabel?: string
): ReadingEnginePlacementDescriptor {
  const cleanedSign = normalizePlacementSign(sign, role);
  return {
    label: cleanedSign ? `your ${cleanedSign} ${role}` : fallbackLabel ?? `your ${role}`,
    role,
    sign: cleanedSign,
    tone: readingEngineTone(cleanedSign)
  };
}

function capitalizeFirst(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function buildStarScopeCopy(input: { chart: ChartPayload | null; displayName: string; hasChart: boolean; question: string }) {
  const questionMode = classifyQuestion(input.question);
  const signal = input.chart?.dominantTransit;
  const pressure = signal ? `${signal.transitBody}-${signal.natalBody}` : "current timing";
  const firstSentence =
    questionMode === "relationship"
      ? `${displayNameToFirstName(input.displayName)}, the clearest answer is to trust the consistency you can verify, especially while ${pressure} is amplifying the emotional stakes.`
      : questionMode === "decision"
        ? `${displayNameToFirstName(input.displayName)}, the better path is the option that reduces confusion fastest and gives you something concrete to verify while ${pressure} is active.`
        : `${displayNameToFirstName(input.displayName)}, treat this question as a cue to slow down and read the pattern in front of you through ${pressure}, not through hope alone.`;
  const secondSentence = input.hasChart
    ? `**Your move:** ask for one clear next step, one date, or one observable behavior, then decide from what actually comes back.`
    : `**Your move:** finish your chart setup, then write the question in one sentence so the next read can stay specific.`;
  const content = `${firstSentence} ${secondSentence}`;
  assertValidPremiumCopy(content);
  return content;
}

function buildLoveScopeCopy(input: {
  chart: ChartPayload | null;
  displayName: string;
  hasChart: boolean;
  partnerBirthDate: string | null;
  partnerName: string;
  relationshipType: string;
  situation: string;
}) {
  const closeness = classifyRelationship(input.relationshipType, input.situation);
  const moon = input.chart?.bigThree?.moon ?? "your emotional pattern";
  const firstSentence =
    closeness === "unclear"
      ? `${displayNameToFirstName(input.displayName)}, the dynamic with ${input.partnerName} feels emotionally real but structurally under-defined, which presses directly on ${moon}.`
      : closeness === "strained"
        ? `${displayNameToFirstName(input.displayName)}, the pattern with ${input.partnerName} looks strained because too much is being carried indirectly and ${moon} needs cleaner terms.`
        : `${displayNameToFirstName(input.displayName)}, the bond with ${input.partnerName} has traction, but ${moon} grows best when expectations stay explicit and the pace stays honest.`;
  const specificity = input.partnerBirthDate ? "Use the extra context to stay precise, not sentimental." : "You have enough context to act clearly without over-interpreting the gaps.";
  const secondSentence = input.hasChart
    ? `**Your move:** ${specificity.replace(/\.$/, ",")} then name one boundary, one need, or one invitation you can communicate directly this week.`
    : `**Your move:** finish your chart setup, then define the relationship in plain terms before asking for more from it.`;
  const content = `${firstSentence} ${secondSentence}`;
  assertValidPremiumCopy(content);
  return content;
}

function resolveStudioForecastTimeframe(
  readingType: StudioReadRequest["readingType"]
): ForecastTimeframe | null {
  if (readingType === "daily" || readingType === "weekly" || readingType === "monthly") {
    return readingType;
  }

  return null;
}

function buildStudioReadingResult(input: {
  audience: NonNullable<StudioReadRequest["audience"]>;
  chart: Awaited<ReturnType<typeof buildAstrologyChartSnapshot>>;
  forecast: string;
  label: string;
  question: string;
  readingType: StudioReadRequest["readingType"];
}): StudioReadingResult {
  const chartPayload = normalizeChartPayload(input.chart.chart as Record<string, unknown>);
  const sun = chartPayload?.bigThree?.sun ?? "Sun";
  const moon = chartPayload?.bigThree?.moon ?? "Moon";
  const rising = chartPayload?.bigThree?.rising ?? "Rising";
  const subject = input.label.trim() || "the member";
  const angle = buildAudienceAngle(input.audience, sun, moon, rising);
  const adHooks = buildAdHooks(input.readingType, subject, sun, moon, rising);
  const ctaIdeas = buildCtaIdeas(input.readingType);
  const moduleFit = buildModuleFit(input.readingType);
  const voiceReading = buildStudioVoiceReading({
    chartSummary: input.chart.summary,
    forecast: input.forecast,
    question: input.question,
    readingType: input.readingType
  });

  return {
    chartSummary: `${input.chart.summary} ${angle}`,
    ctaIdeas,
    forecast: input.forecast,
    hooks: adHooks,
    marketingVariants: [
      `${subject} is not looking for generic reassurance. ${sun}, ${moon}, and ${rising} together make the stronger promise: a reading precise enough to feel personal.`,
      `Built from exact birth data, this CosmoScope read translates ${sun} drive, ${moon} feeling, and ${rising} presentation into language people can actually use.`,
      `When the day feels noisy, CosmoScope narrows the signal. It gives ${subject} the pattern, the pressure point, and the next move without turning the moment into theater.`
    ],
    moduleFit,
    notes: `Best used for ${moduleFit.join(", ")}. Audience frame: ${input.audience.replace(/_/g, " ")}. ${input.question ? `Context entered: ${input.question}` : "No extra context entered."}`,
    voiceReading
  };
}

function buildStudioVoiceReading(input: {
  chartSummary: string;
  forecast: string;
  question: string;
  readingType: StudioReadRequest["readingType"];
}) {
  const intro =
    input.readingType === "social_post" || input.readingType === "ad_copy" || input.readingType === "landing_page_copy"
      ? input.forecast
      : `${input.chartSummary}\n\n${input.forecast}`;

  if (input.readingType === "ad_copy" || input.readingType === "landing_page_copy" || input.readingType === "social_post") {
    return intro;
  }

  return `${intro}${input.question ? `\n\nContext: ${input.question}.` : ""}\n\n**Your move:** use the clearest pressure point in this read as the single thing you respond to first.`;
}

function buildAudienceAngle(audience: NonNullable<StudioReadRequest["audience"]>, sun: string, moon: string, rising: string) {
  const label = audience.replace(/_/g, " ");
  return `For a ${label} audience, the strongest frame is the contrast between ${sun} direction, ${moon} feeling, and ${rising} presentation.`;
}

function buildAdHooks(
  readingType: StudioReadRequest["readingType"],
  subject: string,
  sun: string,
  moon: string,
  rising: string
) {
  const base = [
    `Exact birth data. A reading that sounds like ${subject}, not everyone else.`,
    `${sun}, ${moon}, and ${rising} are not trivia. They are the pattern underneath the noise.`,
    `When the day gets louder, CosmoScope gives the signal back in plain language.`
  ];

  if (readingType === "ad_copy" || readingType === "landing_page_copy") {
    return [
      ...base,
      "A private reading built from exact data, with enough precision to change what you do next."
    ];
  }

  return base;
}

function buildCtaIdeas(readingType: StudioReadRequest["readingType"]) {
  if (readingType === "ad_copy" || readingType === "landing_page_copy" || readingType === "social_post") {
    return ["Open your reading", "See today’s pattern", "Get the chart read back to you"];
  }

  return ["Stay with the clearest signal first", "Name the pressure point before you react", "Use this reading to choose the next clean move"];
}

function buildModuleFit(readingType: StudioReadRequest["readingType"]) {
  if (readingType === "lovescope") {
    return ["LoveScope", "Cosmic Pass", "email follow-up"];
  }
  if (readingType === "starscope") {
    return ["StarScope", "Cosmic Pass", "push copy"];
  }
  if (readingType === "ad_copy" || readingType === "landing_page_copy" || readingType === "social_post") {
    return ["front door", "paid social", "creator studio"];
  }
  return ["daily decoding", "weekly breakdown", "Cosmic Pass"];
}

function buildStudioMarketingLead(input: {
  audience: NonNullable<StudioReadRequest["audience"]>;
  chart: ChartPayload | null;
  label: string;
  readingType: StudioReadRequest["readingType"];
}) {
  const sun = normalizePlacementSign(input.chart?.bigThree?.sun, "Sun") ?? "the Sun";
  const moon = normalizePlacementSign(input.chart?.bigThree?.moon, "Moon") ?? "the Moon";
  const rising = normalizePlacementSign(input.chart?.bigThree?.rising, "Rising") ?? "the Rising sign";
  const audience = input.audience.replace(/_/g, " ");

  return `${input.label} does not need a vague horoscope. They need a reading that turns ${sun} direction, ${moon} feeling, and ${rising} presentation into language a ${audience} audience can actually use.`;
}

type AstrologyInput = {
  birthDate: string;
  birthPlace: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffsetHours: number;
  unknownBirthTime: boolean;
};

type AstrologyApiPlanet = {
  full_degree?: number;
  is_retro?: boolean | string;
  name?: string;
  sign?: string;
};

type AstrologyApiHouse = {
  end_degree?: number;
  house_id?: number;
  planets?: AstrologyApiPlanet[];
  sign?: string;
  start_degree?: number;
};

type AstrologyApiAspect = {
  aspecting_planet?: string;
  aspected_planet?: string;
  diff?: number;
  orb?: number;
  type?: string;
};

type AstrologyApiChartDataResponse = {
  aspects?: AstrologyApiAspect[];
  houses?: AstrologyApiHouse[];
};

type AstrologyApiTransitRelation = {
  aspect_type?: string;
  end_time?: string;
  exact_time?: string;
  is_retrograde?: boolean;
  natal_house?: number;
  natal_planet?: string;
  planet_in_signs?: string[];
  transit_planet?: string;
  transit_sign?: string;
};

type AstrologyApiDailyTransitResponse = {
  ascendant?: string;
  transit_date?: string;
  transit_relation?: AstrologyApiTransitRelation[];
};

type AstrologyApiWeeklyTransitResponse = {
  end_date?: string;
  natal_ascendant?: string;
  start_date?: string;
  transit_relation?: AstrologyApiTransitRelation[];
};

type AstrologyApiLifeForecastResponse = {
  life_forecast?: Array<{
    date?: string;
    forecast?: string;
    planet_position?: string;
  }>;
};

function mergeChartWithTransit(
  chart: unknown,
  dominantTransit: TransitSignal | null
) {
  const normalizedChart = toChartRecord(chart);
  if (!normalizedChart) {
    return dominantTransit ? { dominantTransit } : {};
  }

  if (!dominantTransit) {
    return normalizedChart;
  }

  return {
    ...normalizedChart,
    dominantTransit
  };
}

function resolveAstrologyProfileInput(input: {
  birthDate: string | null;
  birthPlace: string | null;
  birthTime: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  timezoneOffset: number | null;
  unknownBirthTime: boolean;
}): AstrologyInput {
  const birthDate = requireDateString(input.birthDate, "birthDate");
  const birthTime = input.unknownBirthTime ? "12:00" : requireTimeString(input.birthTime, "birthTime");
  const latitude = requireFiniteNumber(input.latitude, "latitude");
  const longitude = requireFiniteNumber(input.longitude, "longitude");
  const timezone = input.timezone?.trim() || "UTC";
  const timezoneOffsetHours =
    typeof input.timezoneOffset === "number" && Number.isFinite(input.timezoneOffset)
      ? input.timezoneOffset
      : getTimezoneOffsetMinutes(timezone, zonedLocalTimeToUtc(birthDate, birthTime, timezone)) / 60;

  return {
    birthDate,
    birthPlace: requireString(input.birthPlace ?? undefined, "birthPlace"),
    birthTime,
    latitude,
    longitude,
    timezone,
    timezoneOffsetHours,
    unknownBirthTime: input.unknownBirthTime
  };
}

async function buildAstrologyChartSnapshot(env: Env, input: AstrologyInput, displayName: string) {
  const chartResponse = await callAstrologyApi<AstrologyApiChartDataResponse>(env, "western_chart_data", {
    ...toAstrologyApiPayload(input),
    house_type: input.unknownBirthTime ? "whole_sign" : "placidus"
  });

  const normalizedChart = normalizeAstrologyChart(chartResponse, input);
  const sun = normalizedChart.bigThree?.sun ?? "your core pattern";
  const moon = normalizedChart.bigThree?.moon ?? "your emotional pattern";
  const rising = normalizedChart.bigThree?.rising ?? "your public presentation";
  const summary = `${displayNameToFirstName(displayName)}'s chart centers on ${sun} drive, ${moon} emotional timing, and ${rising} presentation. Together, these placements show how they pursue what matters, how they react under pressure, and how other people read them before much is explained.`;

  return {
    chart: normalizedChart,
    sourceVersion: CHART_SOURCE_VERSION,
    summary
  };
}

async function fetchTransitSignals(
  env: Env,
  input: AstrologyInput,
  mode: "daily" | "weekly" | "long_range"
): Promise<TransitSignal[]> {
  if (mode === "daily") {
    const response = await callAstrologyApi<AstrologyApiDailyTransitResponse>(env, "natal_transits/daily", {
      ...toAstrologyApiPayload(input),
      house_type: input.unknownBirthTime ? "whole_sign" : "placidus"
    });
    return selectTransitSignals(response.transit_relation ?? [], input);
  }

  if (mode === "weekly") {
    const response = await callAstrologyApi<AstrologyApiWeeklyTransitResponse>(env, "natal_transits/weekly", {
      ...toAstrologyApiPayload(input),
      house_type: input.unknownBirthTime ? "whole_sign" : "placidus"
    });
    return selectTransitSignals(response.transit_relation ?? [], input);
  }

  const response = await callAstrologyApi<AstrologyApiLifeForecastResponse>(env, "life_forecast_report/tropical", {
    ...toAstrologyApiPayload(input),
    house_type: input.unknownBirthTime ? "whole_sign" : "placidus"
  });
  return selectTransitSignalsFromLifeForecast(response.life_forecast ?? [], input);
}

async function fetchDominantTransitSignal(
  env: Env,
  input: AstrologyInput,
  mode: "daily" | "weekly" | "long_range"
): Promise<TransitSignal | null> {
  return fetchTransitSignals(env, input, mode).then((signals) => signals[0] ?? null);
}

function toAstrologyApiPayload(input: AstrologyInput) {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);
  return {
    day,
    hour,
    lat: input.latitude,
    lon: input.longitude,
    min: minute,
    month,
    tzone: input.timezoneOffsetHours,
    year
  };
}

async function callAstrologyApi<TResponse>(env: Env, endpoint: string, payload: Record<string, unknown>): Promise<TResponse> {
  const rawKey = env.ASTROLOGY_API_KEY?.trim();
  if (!rawKey) {
    throw new HttpError(503, "Astrology API is not configured yet.");
  }

  const headers: Record<string, string> = rawKey.includes(":")
    ? {
        authorization: `Basic ${btoa(rawKey)}`,
        "content-type": "application/json"
      }
    : {
        "content-type": "application/json",
        "x-astrologyapi-key": rawKey
      };

  const response = await fetch(`https://json.astrologyapi.com/v1/${endpoint}`, {
    body: JSON.stringify(payload),
    headers,
    method: "POST"
  });
  const result = (await response.json().catch(() => null)) as TResponse | { message?: string; error?: string } | null;

  if (!response.ok || !result) {
    throw new HttpError(response.status || 502, `Astrology API request failed for ${endpoint}.`, result);
  }

  return result as TResponse;
}

function normalizeAstrologyChart(response: AstrologyApiChartDataResponse, input: AstrologyInput) {
  const houses = (response.houses ?? []).filter((house): house is AstrologyApiHouse => Boolean(house.house_id));
  const flattenedPlanets = flattenAstrologyPlanets(houses);
  const sun = flattenedPlanets.find((planet) => planet.body === "Sun");
  const moon = flattenedPlanets.find((planet) => planet.body === "Moon");
  const firstHouse = houses.find((house) => house.house_id === 1);
  const tenthHouse = houses.find((house) => house.house_id === 10);

  return {
    accuracy: {
      engine: "astrologyapi",
      houses: input.unknownBirthTime ? "whole_sign_no_exact_birth_time" : "placidus_from_astrologyapi",
      planets: "western_chart_data"
    },
    bigThree: {
      moon: moon?.sign,
      rising: input.unknownBirthTime ? undefined : firstHouse?.sign,
      sun: sun?.sign
    },
    birth: {
      date: input.birthDate,
      instantUtc: zonedLocalTimeToUtc(input.birthDate, input.birthTime, input.timezone).toISOString(),
      latitude: input.latitude,
      longitude: input.longitude,
      place: input.birthPlace,
      time: input.birthTime,
      timezone: input.timezone,
      unknownBirthTime: input.unknownBirthTime
    },
    dominantTransit: undefined,
    transitSignals: [],
    planets: flattenedPlanets,
    transits: [],
    wheel: {
      ascendant:
        firstHouse?.start_degree !== undefined
          ? degreePayload(firstHouse.start_degree)
          : null,
      midheaven:
        tenthHouse?.start_degree !== undefined
          ? degreePayload(tenthHouse.start_degree)
          : null
    }
  };
}

function flattenAstrologyPlanets(houses: AstrologyApiHouse[]): Placement[] {
  const seen = new Set<string>();
  const planets: Placement[] = [];

  for (const house of houses) {
    for (const planet of house.planets ?? []) {
      const body = planet.name?.trim();
      const degree = typeof planet.full_degree === "number" ? planet.full_degree : null;
      const sign = planet.sign?.trim();
      if (!body || degree === null || !sign || seen.has(body)) {
        continue;
      }

      seen.add(body);
      planets.push({
        body,
        degree: roundDegree(degree),
        degreeInSign: roundDegree(normalizeDegrees(degree) % 30),
        retrograde: planet.is_retro === true || planet.is_retro === "true",
        sign
      });
    }
  }

  return planets.sort((left, right) => left.degree - right.degree);
}

function selectTransitSignals(relations: AstrologyApiTransitRelation[], input: AstrologyInput): TransitSignal[] {
  const chart = relations
    .map((relation) => {
      const transitBody = relation.transit_planet?.trim();
      const natalBody = relation.natal_planet?.trim();
      const transitSign = relation.transit_sign?.trim();
      if (!transitBody || !natalBody || !transitSign) {
        return null;
      }

      const weight = transitPriority(transitBody);
      const exactness = relation.exact_time && relation.exact_time !== "-" ? exactnessScore(relation.exact_time) : 0;
      return {
        aspect: relation.aspect_type?.trim() || "Aspect",
        exactness,
        natalBody,
        natalSign: inferNatalSignForBody(input, natalBody),
        orb: 0,
        transitBody,
        transitSign,
        weight: weight + exactness
      };
    })
    .filter((value): value is TransitSignal & { weight: number } => Boolean(value))
    .sort((left, right) => right.weight - left.weight);

  return chart.slice(0, 5).map(({ weight: _weight, ...signal }) => signal);
}

function selectTransitSignal(relations: AstrologyApiTransitRelation[], input: AstrologyInput): TransitSignal | null {
  return selectTransitSignals(relations, input)[0] ?? null;
}

function selectTransitSignalsFromLifeForecast(
  forecasts: Array<{ date?: string; forecast?: string; planet_position?: string }>,
  input: AstrologyInput
): TransitSignal[] {
  const signals: TransitSignal[] = [];

  for (const item of forecasts) {
    const match = item.planet_position?.match(/^Transiting\s+(.+?)\s+([A-Za-z ]+)\s+Natal\s+(.+)$/i);
    if (!match) {
      continue;
    }

    const transitBody = match[1]?.trim();
    const aspect = match[2]?.trim();
    const natalBody = match[3]?.trim();
    if (!transitBody || !aspect || !natalBody) {
      continue;
    }

    signals.push({
      aspect,
      exactness: 0,
      natalBody,
      natalSign: inferNatalSignForBody(input, natalBody),
      orb: 0,
      transitBody,
      transitSign: "current sky"
    });

    if (signals.length >= 5) {
      break;
    }
  }

  return signals;
}

function selectTransitSignalFromLifeForecast(
  forecasts: Array<{ date?: string; forecast?: string; planet_position?: string }>,
  input: AstrologyInput
): TransitSignal | null {
  return selectTransitSignalsFromLifeForecast(forecasts, input)[0] ?? null;
}

function transitPriority(body: string) {
  const order = ["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter", "Mars", "Venus", "Mercury", "Sun", "Moon"];
  const index = order.indexOf(body);
  return index === -1 ? 0 : order.length - index;
}

function exactnessScore(exactTime: string) {
  const parsed = new Date(exactTime.replace(" ", "T") + "Z");
  if (Number.isNaN(parsed.getTime())) {
    return 0;
  }

  const deltaHours = Math.abs(Date.now() - parsed.getTime()) / 36e5;
  return Math.max(0, 24 - Math.min(24, deltaHours));
}

function inferNatalSignForBody(input: AstrologyInput, natalBody: string) {
  return natalBody === "Ascendant" && !input.unknownBirthTime ? "Ascendant" : natalBody;
}

function buildPlanetSet(date: Date): Placement[] {
  return ASTROLOGY_BODIES.map((body) => {
    const longitude = getBodyLongitude(body, date);
    const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    const previousLongitude = getBodyLongitude(body, yesterday);
    return {
      body,
      ...degreePayload(longitude),
      retrograde: signedLongitudeDelta(previousLongitude, longitude) < 0
    };
  });
}

function getBodyLongitude(body: Astronomy.Body, date: Date) {
  if (body === Astronomy.Body.Moon) {
    return normalizeDegrees(Astronomy.EclipticGeoMoon(date).lon);
  }

  return normalizeDegrees(Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon);
}

function degreePayload(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const zodiac = zodiacAt(normalized);
  return {
    degree: roundDegree(normalized),
    degreeInSign: roundDegree(zodiac.degreeInSign),
    sign: zodiac.sign
  };
}

function zodiacAt(longitude: number) {
  const normalized = normalizeDegrees(longitude);
  const signIndex = Math.floor(normalized / 30) % 12;
  return {
    degreeInSign: normalized - signIndex * 30,
    sign: ZODIAC_SIGNS[signIndex]
  };
}

function findStrongestTransit(natalPlanets: Placement[], transits: Placement[]): TransitSignal {
  const aspectAngles = [
    { aspect: "conjunction", angle: 0, weight: 1 },
    { aspect: "opposition", angle: 180, weight: 0.95 },
    { aspect: "square", angle: 90, weight: 0.9 },
    { aspect: "trine", angle: 120, weight: 0.8 },
    { aspect: "sextile", angle: 60, weight: 0.68 }
  ];
  let strongest: TransitSignal | null = null;
  let strongestScore = Number.POSITIVE_INFINITY;

  for (const transit of transits.filter((item) => item.body !== "Moon")) {
    for (const natal of natalPlanets) {
      const separation = angularSeparation(transit.degree, natal.degree);
      for (const aspect of aspectAngles) {
        const orb = Math.abs(separation - aspect.angle);
        const allowedOrb = ["Sun", "Moon"].includes(natal.body) ? 6 : 4;
        if (orb <= allowedOrb) {
          const score = orb / aspect.weight;
          if (score < strongestScore) {
            strongestScore = score;
            strongest = {
              aspect: aspect.aspect,
              exactness: roundDegree(allowedOrb - orb),
              natalBody: natal.body,
              natalSign: natal.sign,
              orb: roundDegree(orb),
              transitBody: transit.body,
              transitSign: transit.sign
            };
          }
        }
      }
    }
  }

  return (
    strongest ?? {
      aspect: "proximity",
      exactness: 0,
      natalBody: natalPlanets[0]?.body ?? "Sun",
      natalSign: natalPlanets[0]?.sign ?? "Aries",
      orb: 0,
      transitBody: transits[0]?.body ?? "Sun",
      transitSign: transits[0]?.sign ?? "Aries"
    }
  );
}

function calculateAscendantLongitude(date: Date, latitude: number, longitude: number) {
  const obliquity = 23.4392911 * Astronomy.DEG2RAD;
  const localSidereal = normalizeDegrees(Astronomy.SiderealTime(date) * 15 + longitude) * Astronomy.DEG2RAD;
  const latitudeRad = latitude * Astronomy.DEG2RAD;
  const ascendant = Math.atan2(
    -Math.cos(localSidereal),
    Math.sin(localSidereal) * Math.cos(obliquity) + Math.tan(latitudeRad) * Math.sin(obliquity)
  );

  return normalizeDegrees(ascendant * Astronomy.RAD2DEG);
}

function calculateMidheavenLongitude(date: Date, longitude: number) {
  const obliquity = 23.4392911 * Astronomy.DEG2RAD;
  const localSidereal = normalizeDegrees(Astronomy.SiderealTime(date) * 15 + longitude) * Astronomy.DEG2RAD;
  const midheaven = Math.atan2(Math.sin(localSidereal), Math.cos(localSidereal) * Math.cos(obliquity));
  return normalizeDegrees(midheaven * Astronomy.RAD2DEG);
}

function zonedLocalTimeToUtc(date: string, time: string, timezone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let index = 0; index < 2; index += 1) {
    const offset = getTimezoneOffsetMinutes(timezone, new Date(utcMs));
    utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offset * 60_000;
  }

  return new Date(utcMs);
}

function getTimezoneOffsetMinutes(timezone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    year: "numeric"
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour === "24" ? "0" : lookup.hour),
    Number(lookup.minute),
    Number(lookup.second)
  );

  return (asUtc - date.getTime()) / 60_000;
}

function normalizeChartPayload(value: unknown): ChartPayload | null {
  const record = toChartRecord(value);
  if (!record) {
    return null;
  }

  const planets = normalizePlacementArray(record.planets);
  const transits = normalizePlacementArray(record.transits);
  const wheel = normalizeChartWheel(record.wheel);
  const birth = normalizeChartBirth(record.birth);
  const dominantTransit = normalizeTransitSignal(record.dominantTransit);
  const rawBigThree = asRecord(record.bigThree);
  const sun = normalizePlacementSign(rawBigThree?.sun, "Sun") ?? findPlacementSign(planets, "Sun");
  const moon = normalizePlacementSign(rawBigThree?.moon, "Moon") ?? findPlacementSign(planets, "Moon");
  const rising =
    normalizePlacementSign(rawBigThree?.rising, "Rising") ??
    normalizePlacementSign(wheel?.ascendant?.sign, "Rising");
  const bigThree = sun || moon || rising ? { moon, rising, sun } : undefined;

  return {
    accuracy: normalizeChartAccuracy(record.accuracy),
    bigThree,
    birth,
    dominantTransit,
    planets,
    transits,
    wheel
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function toChartRecord(value: unknown, depth = 0): Record<string, unknown> | null {
  if (depth > 3) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return toChartRecord(JSON.parse(value), depth + 1);
    } catch {
      return null;
    }
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  if ("chart" in record) {
    const nestedChart = toChartRecord(record.chart, depth + 1);
    if (nestedChart) {
      return nestedChart;
    }
  }

  return record;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function normalizePlacementSign(value: unknown, role: "Sun" | "Moon" | "Rising") {
  const source = readString(value);
  if (!source) {
    return undefined;
  }

  const cleaned = source
    .replace(/^your\s+/i, "")
    .replace(new RegExp(`\\b${role}\\b`, "gi"), "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return undefined;
  }

  const normalized = cleaned.toLowerCase();
  const exactMatch = ZODIAC_SIGNS.find((sign) => sign.toLowerCase() === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeGenericSign(value: unknown) {
  const source = readString(value);
  if (!source) {
    return undefined;
  }

  const normalized = source.trim().toLowerCase();
  const exactMatch = ZODIAC_SIGNS.find((sign) => sign.toLowerCase() === normalized);
  return exactMatch;
}

function normalizePlacementArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const placements = value
    .map((entry) => normalizePlacement(entry))
    .filter((entry): entry is Placement => Boolean(entry));

  return placements.length ? placements : undefined;
}

function normalizePlacement(value: unknown): Placement | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const body = readString(record.body)?.trim();
  const sign = normalizeGenericSign(record.sign);
  const degree = readNumber(record.degree);
  const degreeInSign = readNumber(record.degreeInSign);
  const retrograde = readBoolean(record.retrograde);

  if (!body || !sign || degree === null || degreeInSign === null || retrograde === null) {
    return null;
  }

  return {
    body,
    degree,
    degreeInSign,
    retrograde,
    sign
  };
}

function findPlacementSign(planets: Placement[] | undefined, body: string) {
  return planets?.find((planet) => planet.body === body)?.sign;
}

function normalizeChartWheel(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const ascendant = normalizeDegreePoint(record.ascendant);
  const midheaven = normalizeDegreePoint(record.midheaven);
  if (!ascendant && !midheaven) {
    return undefined;
  }

  return {
    ascendant,
    midheaven
  };
}

function normalizeDegreePoint(value: unknown): DegreePoint | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const degree = readNumber(record.degree);
  const degreeInSign = readNumber(record.degreeInSign);
  const sign = normalizeGenericSign(record.sign);
  if (degree === null || degreeInSign === null || !sign) {
    return null;
  }

  return {
    degree,
    degreeInSign,
    sign
  };
}

function normalizeChartBirth(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const date = readString(record.date) ?? undefined;
  const instantUtc = readString(record.instantUtc) ?? undefined;
  const latitude = readNumber(record.latitude) ?? undefined;
  const longitude = readNumber(record.longitude) ?? undefined;
  const place = readString(record.place) ?? undefined;
  const time = readString(record.time) ?? undefined;
  const timezone = readString(record.timezone) ?? undefined;
  const unknownBirthTime = readBoolean(record.unknownBirthTime) ?? undefined;

  if (!date && !instantUtc && latitude === undefined && longitude === undefined && !place && !time && !timezone && unknownBirthTime === undefined) {
    return undefined;
  }

  return {
    date,
    instantUtc,
    latitude,
    longitude,
    place,
    time,
    timezone,
    unknownBirthTime
  };
}

function normalizeChartAccuracy(value: unknown) {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const engine = readString(record.engine) ?? undefined;
  const houses = readString(record.houses) ?? undefined;
  const planets = readString(record.planets) ?? undefined;

  if (!engine && !houses && !planets) {
    return undefined;
  }

  return {
    engine,
    houses,
    planets
  };
}

function normalizeTransitSignal(value: unknown): TransitSignal | undefined {
  const record = asRecord(value);
  if (!record) {
    return undefined;
  }

  const aspect = readString(record.aspect)?.trim();
  const exactness = readNumber(record.exactness);
  const natalBody = readString(record.natalBody)?.trim();
  const natalSign = readString(record.natalSign)?.trim();
  const orb = readNumber(record.orb);
  const transitBody = readString(record.transitBody)?.trim();
  const transitSign = normalizeGenericSign(record.transitSign) ?? readString(record.transitSign)?.trim();

  if (!aspect || exactness === null || !natalBody || !natalSign || orb === null || !transitBody || !transitSign) {
    return undefined;
  }

  return {
    aspect,
    exactness,
    natalBody,
    natalSign,
    orb,
    transitBody,
    transitSign
  };
}

function requirePlacement(planets: Placement[], body: string) {
  const placement = planets.find((planet) => planet.body === body);
  if (!placement) {
    throw new HttpError(500, `Unable to calculate ${body} placement.`);
  }
  return placement;
}

function requireDateString(value: string | null, field: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${field} must use YYYY-MM-DD format.`);
  }

  return value;
}

function requireTimeString(value: string | null, field: string) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    throw new HttpError(400, `${field} must use HH:MM format.`);
  }

  return value;
}

function requireFiniteNumber(value: number | null, field: string) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HttpError(400, `${field} is required for an accurate chart.`);
  }

  return value;
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function angularSeparation(first: number, second: number) {
  const diff = Math.abs(normalizeDegrees(first) - normalizeDegrees(second));
  return diff > 180 ? 360 - diff : diff;
}

function signedLongitudeDelta(previous: number, current: number) {
  const diff = normalizeDegrees(current) - normalizeDegrees(previous);
  if (diff > 180) {
    return diff - 360;
  }
  if (diff < -180) {
    return diff + 360;
  }
  return diff;
}

function roundDegree(value: number) {
  return Math.round(value * 100) / 100;
}

function getEffectiveDate(timeframe: ForecastTimeframe) {
  const now = new Date();
  if (timeframe === "daily") {
    return now.toISOString().slice(0, 10);
  }
  if (timeframe === "weekly") {
    const day = now.getUTCDay();
    const distance = day === 0 ? 6 : day - 1;
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - distance));
    return monday.toISOString().slice(0, 10);
  }
  if (timeframe === "yearly") {
    return `${now.getUTCFullYear()}-01-01`;
  }
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function pickFrom(seed: string, values: string[]) {
  const index = stableHash(seed) % values.length;
  return values[index];
}

function stableHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hasProductAccess(env: Env, entitlements: EntitlementsRow, productKey: ProductKey) {
  if (env.PAYMENTS_DISABLED_PREVIEW === "true") {
    return true;
  }

  if (entitlements.premium_active) {
    return true;
  }

  if (productKey === "starscope_unlock") {
    return entitlements.starscope_unlocked;
  }

  if (productKey === "lovescope_unlock") {
    return entitlements.lovescope_unlocked;
  }

  if (productKey === "forecast_monthly") {
    return entitlements.forecast_monthly_unlocked;
  }

  if (productKey === "yearly_blueprint") {
    return entitlements.yearly_blueprint_unlocked;
  }

  return false;
}

function classifyQuestion(question: string) {
  const normalized = question.toLowerCase();
  if (/(love|relationship|dating|partner|text|call|him|her|them)/.test(normalized)) {
    return "relationship";
  }
  if (/(job|career|move|leave|stay|choose|decision|offer|work)/.test(normalized)) {
    return "decision";
  }
  return "general";
}

function classifyRelationship(relationshipType: string, situation: string) {
  const normalized = `${relationshipType} ${situation}`.toLowerCase();
  if (/(situationship|undefined|mixed|confused|unclear|on and off)/.test(normalized)) {
    return "unclear";
  }
  if (/(break|distance|stuck|fight|tension|avoid|silent)/.test(normalized)) {
    return "strained";
  }
  return "steady";
}

function assertValidPremiumCopy(content: string) {
  const validation = assertPromptOutput(content);
  if (!validation.hasRequiredCta || !validation.isWithinSentenceLimit) {
    throw new HttpError(500, "Generated premium copy failed output validation.");
  }
}

async function applyEntitlementUpdate(
  env: Env,
  input: {
    expiresAt: string | null;
    isActive: boolean;
    platform: "ios" | "web";
    productKey: ProductKey;
    purchasedAt: string | null;
    source: EntitlementSyncSource;
    userId: string;
  }
) {
  await ensureEntitlementRow(env, input.userId);
  const current = (await loadEntitlementsByUserId(env, input.userId)) ?? buildDefaultEntitlementsRow();
  const next = buildNextEntitlements(current, input);

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/app_entitlements`, {
    body: JSON.stringify({
      ...next,
      updated_at: new Date().toISOString(),
      user_id: input.userId
    }),
    headers: {
      ...serviceRoleHeaders(env),
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=representation"
    },
    method: "POST"
  });

  const payload = await readSupabasePayload(response);
  if (!response.ok) {
    throw new HttpError(response.status, "Unable to update entitlements.", payload);
  }

  const rows = Array.isArray(payload) ? payload : [payload];
  return (rows[0] as EntitlementsRow | undefined) ?? next;
}

function buildNextEntitlements(
  current: EntitlementsRow,
  input: {
    expiresAt: string | null;
    isActive: boolean;
    platform: "ios" | "web";
    productKey: ProductKey;
    purchasedAt: string | null;
    source: EntitlementSyncSource;
    userId: string;
  }
) {
  const next: EntitlementsRow = {
    ...current,
    active_until: resolveActiveUntil(current.active_until, input.expiresAt),
    premium_active: current.premium_active,
    premium_source: current.premium_source,
    revenuecat_active: current.revenuecat_active,
    stripe_active: current.stripe_active,
    updated_at: new Date().toISOString()
  };

  if (PREMIUM_PRODUCTS[input.productKey].kind === "subscription") {
    next.premium_active = input.isActive;
    next.premium_source = input.isActive ? input.source : "none";
    next.revenuecat_active = input.source === "revenuecat" ? input.isActive : false;
    next.stripe_active = input.source === "stripe" ? input.isActive : false;
    next.active_until = input.isActive ? resolveActiveUntil(current.active_until, input.expiresAt) : input.expiresAt ?? null;
    return next;
  }

  if (input.isActive) {
    if (input.productKey === "lovescope_unlock") {
      next.lovescope_unlocked = true;
    }
    if (input.productKey === "starscope_unlock") {
      next.starscope_unlocked = true;
    }
    if (input.productKey === "forecast_monthly") {
      next.forecast_monthly_unlocked = true;
    }
    if (input.productKey === "yearly_blueprint") {
      next.yearly_blueprint_unlocked = true;
    }
  }

  return next;
}

function buildDefaultEntitlementsRow(): EntitlementsRow {
  return {
    active_until: null,
    forecast_monthly_unlocked: false,
    lovescope_unlocked: false,
    premium_active: false,
    premium_source: "none",
    revenuecat_active: false,
    starscope_unlocked: false,
    stripe_active: false,
    updated_at: new Date(0).toISOString(),
    yearly_blueprint_unlocked: false
  };
}

function mapEntitlementsToSnapshot(entitlements: EntitlementsRow) {
  return {
    activeSubscriptionProductKey: entitlements.premium_active ? inferSubscriptionProductKey(entitlements) : null,
    expiresAt: entitlements.active_until,
    premiumActive: entitlements.premium_active,
    premiumSource: entitlements.premium_source,
    revenueCatActive: entitlements.revenuecat_active,
    sourceUpdatedAt: entitlements.updated_at,
    stripeActive: entitlements.stripe_active,
    unlocks: {
      forecastMonthly: entitlements.forecast_monthly_unlocked,
      lovescope: entitlements.lovescope_unlocked,
      starscope: entitlements.starscope_unlocked,
      yearlyBlueprint: entitlements.yearly_blueprint_unlocked
    }
  } satisfies EntitlementSnapshot & { activeSubscriptionProductKey: ProductKey | null; sourceUpdatedAt: string };
}

function resolveActiveUntil(current: string | null, incoming: string | null) {
  if (!incoming) {
    return current;
  }
  if (!current) {
    return incoming;
  }
  return new Date(incoming).getTime() >= new Date(current).getTime() ? incoming : current;
}

async function resolveStripePriceId(env: Env, lookupKey: string) {
  const params = new URLSearchParams();
  params.set("active", "true");
  params.append("lookup_keys[]", lookupKey);
  const response = await fetch(`https://api.stripe.com/v1/prices?${params.toString()}`, {
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY ?? ""}`
    }
  });
  const payload = (await response.json().catch(() => null)) as
    | { data?: Array<{ id: string }> }
    | { error?: { message?: string } }
    | null;

  const priceId = payload && "data" in payload ? payload.data?.[0]?.id ?? null : null;
  if (!response.ok || !priceId) {
    throw new HttpError(response.status || 502, `Stripe price lookup failed for ${lookupKey}.`, payload);
  }

  return priceId;
}

async function fetchStripeCheckoutSession(env: Env, sessionId: string) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY ?? ""}`
    }
  });
  const payload = (await response.json().catch(() => null)) as
    | {
        client_reference_id?: string | null;
        created?: number;
        metadata?: Record<string, string>;
        payment_status?: string;
        subscription?: string | null;
      }
    | { error?: { message?: string } }
    | null;

  if (!response.ok || !payload || !("payment_status" in payload)) {
    throw new HttpError(response.status || 502, "Unable to load the Stripe checkout session.", payload);
  }

  return payload;
}

async function fetchStripeSubscription(env: Env, subscriptionId: string) {
  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY ?? ""}`
    }
  });
  const payload = (await response.json().catch(() => null)) as
    | { current_period_end?: number; status?: string }
    | { error?: { message?: string } }
    | null;

  if (!response.ok || !payload || !("status" in payload)) {
    throw new HttpError(response.status || 502, "Unable to load the Stripe subscription.", payload);
  }

  return payload;
}

function assertSupabaseEnv(env: Env) {
  for (const key of ["SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_URL"] as const) {
    if (!env[key]) {
      throw new HttpError(500, `Missing required Worker environment variable: ${key}.`);
    }
  }
}

function assertStripeEnv(env: Env) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(503, "Stripe is not configured yet.");
  }
}

function hasSupabaseEnv(env: Env) {
  return Boolean(env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_URL);
}

function handleError(error: unknown, request: Request, env: Env) {
  if (error instanceof HttpError) {
    return json(
      {
        details: error.details ?? null,
        error: "request_failed",
        message: error.message
      },
      { status: error.status },
      request,
      env
    );
  }

  console.error("Unhandled worker error", error);
  return json(
    {
      error: "internal_error",
      message: "An unexpected error occurred."
    },
    { status: 500 },
    request,
    env
  );
}

function json(payload: unknown, init: ResponseInit = {}, request?: Request, env?: Env) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  for (const [key, value] of Object.entries(getCorsHeaders(request, env))) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(payload, null, 2), {
    ...init,
    headers
  });
}

function jsonHeaders(apiKey: string) {
  return {
    "apikey": apiKey,
    "content-type": "application/json"
  };
}

function stripeHeaders(env: Env) {
  return {
    "authorization": `Bearer ${env.STRIPE_SECRET_KEY ?? ""}`,
    "content-type": "application/x-www-form-urlencoded"
  };
}

function buildFormBody(values: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value) {
      params.set(key, value);
    }
  }
  return params.toString();
}

function getCorsHeaders(request?: Request, env?: Env) {
  const requestOrigin = request?.headers.get("origin") ?? "";
  const allowedOrigins = new Set(
    (env?.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  if (env?.APP_URL?.trim()) {
    allowedOrigins.add(env.APP_URL.trim());
  }

  const accessControlAllowOrigin =
    allowedOrigins.size > 0
      ? requestOrigin && allowedOrigins.has(requestOrigin)
        ? requestOrigin
        : Array.from(allowedOrigins)[0]
      : "*";

  return {
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-origin": accessControlAllowOrigin,
    "vary": "Origin"
  };
}

function getAppOrigin(request: Request, env: Env) {
  if (env.APP_URL?.trim()) {
    return env.APP_URL.trim();
  }

  const originHeader = request.headers.get("origin");
  if (originHeader) {
    return originHeader;
  }

  return new URL(request.url).origin;
}

function requireString(value: string | undefined, field: string) {
  if (!value?.trim()) {
    throw new HttpError(400, `Missing required field: ${field}.`);
  }

  return value.trim();
}

function requireProductKey(value: string | ProductKey | undefined) {
  const normalized = typeof value === "string" ? value.trim() : value;
  if (!normalized || !(normalized in PREMIUM_PRODUCTS)) {
    throw new HttpError(400, "Missing or invalid productKey.");
  }

  return normalized as ProductKey;
}

function describeSignupError(payload: unknown) {
  const errorCode =
    typeof payload === "object" && payload !== null && "error_code" in payload ? String((payload as { error_code?: unknown }).error_code) : "";
  const message =
    typeof payload === "object" && payload !== null && "msg" in payload ? String((payload as { msg?: unknown }).msg ?? "") : "";

  if (errorCode === "user_already_exists") {
    return "An account with this email already exists. Log in instead.";
  }

  if (message.toLowerCase().includes("password")) {
    return "Choose a stronger password and try again.";
  }

  if (message.toLowerCase().includes("email")) {
    return "Check the email address and try again.";
  }

  return "Unable to sign up.";
}

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

async function readSupabasePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function serviceRoleHeaders(env: Env) {
  return {
    "authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    "apikey": env.SUPABASE_SERVICE_ROLE_KEY
  };
}

function userHeaders(env: Env, token: string) {
  return {
    "authorization": `Bearer ${token}`,
    "apikey": env.SUPABASE_ANON_KEY
  };
}
