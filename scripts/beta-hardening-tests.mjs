import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

const { resolveTodaysBriefData } = await import(
  pathToFileURL(resolve(rootDir, "apps/web/app/components/todaysBriefData.ts")).href
);
const { resolveCosmoScopeApiBaseUrl } = await import(
  pathToFileURL(resolve(rootDir, "apps/web/app/lib/apiBaseUrl.ts")).href
);

function withBrowserHost(hostname, callback) {
  const previousWindow = globalThis.window;
  globalThis.window = { location: { hostname } };
  try {
    callback();
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
}

function withEnv(name, value, callback) {
  const previous = process.env[name];
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }

  try {
    callback();
  } finally {
    if (previous === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = previous;
    }
  }
}

{
  const brief = resolveTodaysBriefData({
    content: "",
    fallbackHeadline: "A clearer day starts with one specific choice.",
    structuredDailyBrief: {
      headline: "One small pause changes the day.",
      noticeWhen: [
        "You start answering before the question is fully clear.",
        "A routine message begins to feel more personal than it is.",
        "You want to solve the whole issue before naming the next step."
      ],
      whyTodayFeelsThisWay: ["The current brief keeps the emphasis on pacing, language, and one practical choice."],
      yourMove: "Wait one minute before sending the next important reply."
    }
  });

  assert.equal(brief.noticeWhen.length, 3);
  assert.deepEqual(brief.noticeWhen, [
    "You start answering before the question is fully clear.",
    "A routine message begins to feel more personal than it is.",
    "You want to solve the whole issue before naming the next step."
  ]);
}

{
  const brief = resolveTodaysBriefData({
    content: [
      "A practical headline opens the reading.",
      "Watch For\n- A cached reading still using the old label.\n- A second observable moment.\n- A third observable moment.",
      "Why Today Feels This Way\nOlder cached content should remain readable.",
      "Learn Your Sky\nThe parser can preserve the educational line.",
      "**Your move:** Keep compatibility while changing the live label."
    ].join("\n\n"),
    fallbackHeadline: "Fallback headline."
  });

  assert.equal(brief.noticeWhen.length, 3);
  assert.equal(brief.noticeWhen[0], "A cached reading still using the old label.");
  assert.equal(brief.yourMove, "Keep compatibility while changing the live label.");
}

{
  const workerSource = readFileSync(resolve(rootDir, "worker/src/index.ts"), "utf8");
  const smokeHandlers = workerSource.match(/async function handleDevReadingEngineV2Gemini(?:Smoke|Batch)[\s\S]*?(?=\nasync function|\nfunction|\nconst |\ntype |$)/g) ?? [];

  assert.equal(smokeHandlers.length, 2, "Expected both Gemini smoke handlers to exist.");
  for (const handler of smokeHandlers) {
    assert.match(handler, /if \(!isPaidAiSmokeEnabled\(env\)\)/);
    assert.match(handler, /ENABLE_PAID_AI_SMOKE=true/);
  }
}

withEnv("NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL", undefined, () => {
  withBrowserHost("cosmo.greenhenncollective.com", () => {
    assert.throws(
      () => resolveCosmoScopeApiBaseUrl(),
      /missing NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL/
    );
  });

  withBrowserHost("localhost", () => {
    assert.equal(resolveCosmoScopeApiBaseUrl(), "https://cosmoscope-api.jeff-green-5aa.workers.dev");
  });
});

withEnv("NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL", "https://api.example.com/", () => {
  withBrowserHost("cosmo.greenhenncollective.com", () => {
    assert.equal(resolveCosmoScopeApiBaseUrl(), "https://api.example.com");
  });
});

{
  const workerSource = readFileSync(resolve(rootDir, "worker/src/index.ts"), "utf8");
  assert.match(workerSource, /conjunction:\s*"conjunct"/);
  assert.match(workerSource, /opposition:\s*"opposite"/);
  assert.doesNotMatch(workerSource, /is \$\{aspect\} your natal/);
  assert.doesNotMatch(workerSource, /The astrological picture today is unusually clear/);
}

{
  const workerSource = readFileSync(resolve(rootDir, "worker/src/index.ts"), "utf8");
  const webSource = readFileSync(resolve(rootDir, "apps/web/app/app/LiveExperience.tsx"), "utf8");
  const wranglerConfig = readFileSync(resolve(rootDir, "worker/wrangler.jsonc"), "utf8");

  assert.match(workerSource, /birthDate:\s*profile\.birth_date/);
  assert.match(workerSource, /birth_input_hash:\s*astrologyInput\.birthInputHash/);
  assert.match(workerSource, /audit_metadata:\s*audit/);
  assert.match(workerSource, /structured_brief:\s*result\.structuredDailyBrief/);
  assert.match(workerSource, /Mock reading smoke is disabled/);
  assert.doesNotMatch(workerSource, /function createMockAiReadingProvider/);
  assert.match(wranglerConfig, /"AI_READING_PROVIDER":\s*"none"/);
  assert.doesNotMatch(webSource, /birthDate:\s*forecastBirthDate/);
  assert.doesNotMatch(webSource, /birthTime:\s*forecastBirthTime/);
  assert.match(webSource, /forecast_monthly:\s*"Week \+ Month Unlock"/);
  assert.match(workerSource, /productKey !== "forecast_monthly" && productKey !== "tip_jar"/);
  assert.match(workerSource, /timeframe === "weekly" \|\| timeframe === "monthly"/);
  assert.match(workerSource, /requiredProductKey:\s*"forecast_monthly"/);
}

console.log("Beta hardening tests passed.");
