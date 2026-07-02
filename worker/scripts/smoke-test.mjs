const baseUrl = (process.env.COSMOSCOPE_API_URL ?? "https://cosmoscope-api.jeff-green-5aa.workers.dev").replace(/\/$/, "");

const checks = [
  {
    name: "health endpoint",
    path: "/health",
    method: "GET",
    expectStatus: 200,
    validate: async (response) => {
      const payload = await response.json();
      assert(payload.ok === true, "expected ok=true");
      assert(payload.service === "cosmoscope-api", "expected service=cosmoscope-api");
      assert(payload.supabaseConfigured === true, "expected supabaseConfigured=true");
    }
  },
  {
    name: "manifest endpoint",
    path: "/api/manifest",
    method: "GET",
    expectStatus: 200,
    validate: async (response) => {
      const payload = await response.json();
      assert(Array.isArray(payload.routes), "expected routes array");
      assert(payload.routes.length >= 11, "expected at least 11 routes");
    }
  },
  {
    name: "login validation",
    path: "/api/login",
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({}),
    expectStatus: 400,
    validate: async (response) => {
      const payload = await response.json();
      assert(payload.error === "request_failed", "expected request_failed error");
      assert(
        payload.message === "Missing required field: email.",
        "expected missing email validation message"
      );
    }
  },
  {
    name: "entitlements auth gate",
    path: "/api/entitlements",
    method: "GET",
    expectStatus: 401,
    validate: async (response) => {
      const payload = await response.json();
      assert(payload.error === "request_failed", "expected request_failed error");
      assert(payload.message === "Missing bearer token.", "expected missing bearer token message");
    }
  }
];

async function main() {
  let failed = false;

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    const response = await fetch(url, {
      method: check.method,
      headers: check.headers,
      body: check.body
    });

    try {
      assert(
        response.status === check.expectStatus,
        `expected status ${check.expectStatus}, got ${response.status}`
      );
      await check.validate(response);
      console.log(`PASS ${check.name}: ${response.status} ${url}`);
    } catch (error) {
      failed = true;
      console.error(`FAIL ${check.name}: ${response.status} ${url}`);
      console.error(String(error instanceof Error ? error.message : error));
    }
  }

  if (failed) {
    process.exitCode = 1;
    return;
  }

  console.log(`Worker smoke test passed for ${baseUrl}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

await main();
