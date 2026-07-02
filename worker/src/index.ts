import {
  API_PATHS,
  type ChartRequest,
  type EntitlementSyncSource,
  EntitlementSnapshot,
  type ForecastRequest,
  type ForecastTimeframe,
  ProductKey,
  type VerifyAppleTransactionRequest
} from "@cosmoscope/api/contracts";
import { assertPromptOutput } from "@cosmoscope/api/prompts";
import { PREMIUM_PRODUCTS } from "@cosmoscope/api/products";
import type { EntitlementRow } from "@cosmoscope/db/types";
import { WORKER_ROUTE_MANIFEST } from "./contracts";

type LoginPayload = {
  email?: string;
  password?: string;
};

type StarScopeRequest = {
  question?: string;
};

type LoveScopeRequest = {
  partnerBirthDate?: string | null;
  partnerName?: string;
  relationshipType?: string;
  situation?: string;
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
  chart_json: Record<string, unknown>;
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
  APP_ENV?: string;
  APPLE_SERVER_NOTIFICATION_BEARER?: string;
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

const corsHeaders = {
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-origin": "*"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: corsHeaders,
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
          if (routeKey === `POST ${API_PATHS.forecast}`) {
            return await handleForecast(request, env);
          }
        case `POST ${API_PATHS.verifyAppleTransaction}`:
          return await handleVerifyAppleTransaction(request, env);
        case `POST ${API_PATHS.appleServerNotification}`:
          return await handleAppleServerNotification(request, env);
          return json(
            {
              error: "not_implemented",
              message: "This route is reserved in the flagship foundation but the live engine is not wired yet.",
              route: routeKey
            },
            { status: 501 }
          );
        default:
          return json(
            {
              error: "not_found",
              message: "Route not found."
            },
            { status: 404 }
          );
      }
    } catch (error) {
      return handleError(error);
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
    headers: corsHeaders,
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

async function handleChart(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<ChartRequest>(request);
  const profileRow = await loadProfile(env, auth.user.id);
  const cachedChart = await loadChart(env, auth.user.id);

  if (cachedChart) {
    return json({
      cached: true,
      chart: cachedChart.chart_json,
      summary: cachedChart.chart_summary,
      updatedAt: cachedChart.updated_at
    });
  }

  const chart = buildChartSnapshot({
    birthDate: body.birthDate ?? profileRow?.birth_date ?? null,
    birthPlace: body.birthPlace ?? profileRow?.birth_place ?? null,
    birthTime: body.birthTime ?? profileRow?.birth_time ?? null,
    displayName: profileRow?.display_name ?? auth.user.email ?? "Member",
    timezone: body.timezone ?? profileRow?.timezone ?? null,
    unknownBirthTime: profileRow?.unknown_birth_time ?? false
  });

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
    chart: chart.chart,
    summary: chart.summary,
    updatedAt: new Date().toISOString()
  });
}

async function handleForecast(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<ForecastRequest>(request);
  const timeframe = body.timeframe;

  if (!["daily", "weekly", "monthly"].includes(timeframe)) {
    throw new HttpError(400, "Unsupported timeframe.");
  }

  const effectiveDate = getEffectiveDate(timeframe);
  const cached = await loadForecast(env, auth.user.id, timeframe, effectiveDate, auth.token);
  if (cached) {
    return json({
      cached: true,
      content: cached.content,
      effectiveDate: cached.effective_date,
      timeframe: cached.timeframe
    });
  }

  const profile = await loadProfile(env, auth.user.id);
  const chart = await loadChart(env, auth.user.id);
  const content = buildForecastCopy({
    displayName: profile?.display_name ?? auth.user.email ?? "Member",
    timeframe,
    hasChart: Boolean(chart)
  });

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
    timeframe
  });
}

async function handleStarScope(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const auth = await authenticateRequest(request, env);
  const body = await readJson<StarScopeRequest>(request);
  const question = requireString(body.question, "question");
  const entitlements = await loadEntitlements(env, auth.token);

  if (!hasProductAccess(entitlements, "starscope_unlock")) {
    throw new HttpError(402, "StarScope requires Cosmic Pass or the one-time unlock.", {
      requiredProductKey: "starscope_unlock"
    });
  }

  const profile = await loadProfile(env, auth.user.id);
  const chart = await loadChart(env, auth.user.id);
  const content = buildStarScopeCopy({
    displayName: profile?.display_name ?? auth.user.email ?? "Member",
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

  if (!hasProductAccess(entitlements, "lovescope_unlock")) {
    throw new HttpError(402, "LoveScope requires Cosmic Pass or the one-time unlock.", {
      requiredProductKey: "lovescope_unlock"
    });
  }

  const profile = await loadProfile(env, auth.user.id);
  const chart = await loadChart(env, auth.user.id);
  const content = buildLoveScopeCopy({
    displayName: profile?.display_name ?? auth.user.email ?? "Member",
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

async function handleSignup(request: Request, env: Env) {
  assertSupabaseEnv(env);
  const body = await readJson<SignupPayload>(request);
  const email = requireString(body.email, "email");
  const password = requireString(body.password, "password");
  const displayName = body.displayName?.trim() || email.split("@")[0];

  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/signup`, {
    body: JSON.stringify({ email, password }),
    headers: jsonHeaders(env.SUPABASE_ANON_KEY),
    method: "POST"
  });
  const payload = (await readSupabasePayload(response)) as SupabaseAuthPayload;

  if (!response.ok) {
    throw new HttpError(response.status, "Unable to sign up.", payload);
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
    `${env.SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${encodeURIComponent(userId)}&select=display_name,birth_date,birth_time,birth_place,timezone,timezone_offset,unknown_birth_time`,
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
  return payload as ProfileRow;
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
  return payload as ChartRow;
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
  timezone: string | null;
  unknownBirthTime: boolean;
}) {
  const seed = `${input.birthDate ?? "unknown"}|${input.birthTime ?? "12:00"}|${input.birthPlace ?? "unknown"}|${input.timezone ?? "utc"}`;
  const sun = pickFrom(seed, ["Radiant", "Steady", "Electric", "Introspective", "Magnetic"]);
  const moon = pickFrom(`${seed}|moon`, ["private", "protective", "sensory", "composed", "immediate"]);
  const rising = pickFrom(`${seed}|rising`, ["direct", "soft-spoken", "commanding", "curious", "measured"]);
  const summary = `${input.displayName.split(" ")[0]} moves with a ${sun.toLowerCase()} center, a ${moon} inner rhythm, and a ${rising} first impression.`;

  return {
    chart: {
      bigThree: {
        moon,
        rising,
        sun
      },
      birth: {
        date: input.birthDate,
        place: input.birthPlace,
        time: input.birthTime,
        timezone: input.timezone,
        unknownBirthTime: input.unknownBirthTime
      }
    },
    sourceVersion: "phase1-cached-foundation",
    summary
  };
}

function buildForecastCopy(input: { displayName: string; timeframe: ForecastTimeframe; hasChart: boolean }) {
  const prefix =
    input.timeframe === "daily"
      ? "Today favors deliberate choices over emotional drift."
      : input.timeframe === "weekly"
        ? "This week rewards cleaner priorities and fewer reactive moves."
        : "This month works best when you narrow your focus and protect your pace.";
  const second = input.hasChart
    ? `**Your move:** let ${input.displayName.split(" ")[0]}'s next step be smaller, clearer, and harder to misread.`
    : `**Your move:** finish your chart setup so the next read can be sharper and more personal.`;

  return `${prefix} ${second}`;
}

function buildStarScopeCopy(input: { displayName: string; hasChart: boolean; question: string }) {
  const questionMode = classifyQuestion(input.question);
  const firstSentence =
    questionMode === "relationship"
      ? `${input.displayName.split(" ")[0]}, the clearest answer is to trust what the other person's consistency is already showing you instead of waiting for a dramatic signal.`
      : questionMode === "decision"
        ? `${input.displayName.split(" ")[0]}, the better path is the option that reduces confusion fastest and gives you something concrete to verify within a week.`
        : `${input.displayName.split(" ")[0]}, treat this question as a cue to slow down and read the pattern in front of you rather than the fantasy around it.`;
  const secondSentence = input.hasChart
    ? `**Your move:** ask for one clear next step, one date, or one observable behavior, then decide from what actually comes back.`
    : `**Your move:** finish your chart setup, then write the question in one sentence so the next read can stay specific.`;
  const content = `${firstSentence} ${secondSentence}`;
  assertValidPremiumCopy(content);
  return content;
}

function buildLoveScopeCopy(input: {
  displayName: string;
  hasChart: boolean;
  partnerBirthDate: string | null;
  partnerName: string;
  relationshipType: string;
  situation: string;
}) {
  const closeness = classifyRelationship(input.relationshipType, input.situation);
  const firstSentence =
    closeness === "unclear"
      ? `${input.displayName.split(" ")[0]}, the dynamic with ${input.partnerName} feels emotionally real but structurally under-defined, which is why it can feel intense and unstable at the same time.`
      : closeness === "strained"
        ? `${input.displayName.split(" ")[0]}, the pattern with ${input.partnerName} looks strained because too much is being carried indirectly and too little is being said in plain terms.`
        : `${input.displayName.split(" ")[0]}, the bond with ${input.partnerName} has traction, but it grows best when expectations stay explicit and the pace stays honest.`;
  const specificity = input.partnerBirthDate ? "Use the extra context to stay precise, not sentimental." : "You have enough context to act clearly without over-interpreting the gaps.";
  const secondSentence = input.hasChart
    ? `**Your move:** ${specificity} Name one boundary, one need, or one invitation you can communicate directly this week.`
    : `**Your move:** finish your chart setup, then define the relationship in plain terms before asking for more from it.`;
  const content = `${firstSentence} ${secondSentence}`;
  assertValidPremiumCopy(content);
  return content;
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

function hasProductAccess(entitlements: EntitlementsRow, productKey: ProductKey) {
  if (entitlements.premium_active) {
    return true;
  }

  if (productKey === "starscope_unlock") {
    return entitlements.starscope_unlocked;
  }

  if (productKey === "lovescope_unlock") {
    return entitlements.lovescope_unlocked;
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

function assertSupabaseEnv(env: Env) {
  for (const key of ["SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_URL"] as const) {
    if (!env[key]) {
      throw new HttpError(500, `Missing required Worker environment variable: ${key}.`);
    }
  }
}

function hasSupabaseEnv(env: Env) {
  return Boolean(env.SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_URL);
}

function handleError(error: unknown) {
  if (error instanceof HttpError) {
    return json(
      {
        details: error.details ?? null,
        error: "request_failed",
        message: error.message
      },
      { status: error.status }
    );
  }

  console.error("Unhandled worker error", error);
  return json(
    {
      error: "internal_error",
      message: "An unexpected error occurred."
    },
    { status: 500 }
  );
}

function json(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  for (const [key, value] of Object.entries(corsHeaders)) {
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

async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

async function readSupabasePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
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
