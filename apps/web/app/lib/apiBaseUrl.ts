const DEVELOPMENT_API_BASE_URL = "https://cosmoscope-api.jeff-green-5aa.workers.dev";

function isLocalDevelopmentHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local")
  );
}

export function resolveCosmoScopeApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && !isLocalDevelopmentHost(window.location.hostname)) {
    throw new Error(
      "CosmoScope is missing NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL. Configure the production API URL before using the live app."
    );
  }

  return DEVELOPMENT_API_BASE_URL;
}
