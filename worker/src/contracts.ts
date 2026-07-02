import { API_PATHS } from "@cosmoscope/api/contracts";

export const WORKER_ROUTE_MANIFEST = [
  { method: "POST", path: API_PATHS.login, purpose: "Authenticate existing members" },
  { method: "POST", path: API_PATHS.signup, purpose: "Create members and seed birth data" },
  { method: "POST", path: API_PATHS.deleteAccount, purpose: "Delete member account from inside the app" },
  { method: "POST", path: API_PATHS.chart, purpose: "Generate or sync verified natal chart data" },
  { method: "POST", path: API_PATHS.starscope, purpose: "Generate paid StarScope answers" },
  { method: "POST", path: API_PATHS.lovescope, purpose: "Generate paid LoveScope readings" },
  { method: "POST", path: API_PATHS.forecast, purpose: "Generate daily, weekly, monthly, or yearly forecasts" },
  { method: "GET", path: API_PATHS.entitlements, purpose: "Return current balance and membership state" },
  { method: "GET", path: API_PATHS.ledger, purpose: "Return transaction history for audit and support" },
  { method: "POST", path: API_PATHS.verifyAppleTransaction, purpose: "Verify StoreKit transactions server-side" },
  { method: "POST", path: API_PATHS.appleServerNotification, purpose: "Ingest App Store Server Notifications" }
] as const;
