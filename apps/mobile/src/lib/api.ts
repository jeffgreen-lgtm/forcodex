import {
  API_PATHS,
  type ChartRequest,
  type EntitlementSnapshot,
  type ForecastRequest,
  type ProductKey,
  type VerifyAppleTransactionRequest
} from "@cosmoscope/api/contracts";
import { getRuntimeConfig } from "./runtime-config";

type AuthPayload = {
  accessToken: string | null;
  expiresAt: number | null;
  expiresIn: number | null;
  refreshToken: string | null;
  user: {
    email?: string;
    id: string;
  } | null;
};

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = LoginPayload & {
  birthDate?: string;
  birthPlace?: string;
  birthTime?: string;
  displayName?: string;
  timezone?: string;
  timezoneOffset?: number;
  unknownBirthTime?: boolean;
};

type ChartResponse = {
  cached: boolean;
  chart: {
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
  timeframe: ForecastRequest["timeframe"];
};

export type StarScopeResponse = {
  content: string;
  productKey: ProductKey;
  question: string;
};

export type LoveScopeResponse = {
  content: string;
  partnerName: string;
  productKey: ProductKey;
  relationshipType: string;
};

export type EntitlementResponse = EntitlementSnapshot & {
  activeSubscriptionProductKey: ProductKey | null;
  sourceUpdatedAt: string;
};

export type VerifyAppleTransactionResponse = {
  entitlement: EntitlementResponse;
  message: string;
  originalTransactionId: string | null;
  productKey: ProductKey;
};

const API_BASE_URL = getRuntimeConfig().apiBaseUrl.replace(/\/$/, "");

export async function login(payload: LoginPayload) {
  return request<AuthPayload>(API_PATHS.login, {
    body: JSON.stringify(payload),
    method: "POST"
  });
}

export async function signup(payload: SignupPayload) {
  return request<AuthPayload>(API_PATHS.signup, {
    body: JSON.stringify(payload),
    method: "POST"
  });
}

export async function fetchEntitlements(accessToken: string) {
  return request<EntitlementResponse>(API_PATHS.entitlements, {
    headers: authHeaders(accessToken),
    method: "GET"
  });
}

export async function fetchChart(accessToken: string, payload: ChartRequest) {
  return request<ChartResponse>(API_PATHS.chart, {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: "POST"
  });
}

export async function fetchForecast(accessToken: string, payload: ForecastRequest) {
  return request<ForecastResponse>(API_PATHS.forecast, {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: "POST"
  });
}

export async function fetchStarScope(accessToken: string, payload: { question: string }) {
  return request<StarScopeResponse>(API_PATHS.starscope, {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: "POST"
  });
}

export async function fetchLoveScope(
  accessToken: string,
  payload: {
    partnerBirthDate?: string | null;
    partnerName: string;
    relationshipType: string;
    situation: string;
  }
) {
  return request<LoveScopeResponse>(API_PATHS.lovescope, {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: "POST"
  });
}

export async function deleteAccount(accessToken: string) {
  await request<void>(API_PATHS.deleteAccount, {
    headers: authHeaders(accessToken),
    method: "POST"
  });
}

export async function verifyAppleTransaction(accessToken: string, payload: VerifyAppleTransactionRequest) {
  return request<VerifyAppleTransactionResponse>(API_PATHS.verifyAppleTransaction, {
    body: JSON.stringify(payload),
    headers: authHeaders(accessToken),
    method: "POST"
  });
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

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return payload as T;
}
