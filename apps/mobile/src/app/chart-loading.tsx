import { useEffect } from "react";
import { router } from "expo-router";
import { ScreenScaffold } from "@/components/ScreenScaffold";
import { FeaturePanel } from "@/components/FeaturePanel";
import { fetchChart, fetchForecast } from "@/lib/api";
import { buildLocalChartSnapshot, buildLocalDailySignal, useAppSession } from "@/lib/app-session";

export default function ChartLoadingScreen() {
  const { auth, birthDraft, setChartSnapshot, setDailySignal, setLastError } = useAppSession();

  useEffect(() => {
    if (!birthDraft || !auth.accessToken) {
      router.replace(birthDraft ? "/sign-in" : "/birth-data");
      return;
    }

    const draft = birthDraft;
    const accessToken = auth.accessToken;

    const timeoutId = setTimeout(() => {
      void hydrate(draft, accessToken);
    }, 1200);

    return () => clearTimeout(timeoutId);
    async function hydrate(
      currentDraft: NonNullable<typeof birthDraft>,
      currentAccessToken: NonNullable<typeof auth.accessToken>
    ) {
      try {
        const [chartResponse, forecastResponse] = await Promise.all([
          fetchChart(currentAccessToken, {
            birthDate: currentDraft.birthDate,
            birthPlace: currentDraft.birthPlace,
            birthTime: currentDraft.birthTime,
            latitude: 0,
            longitude: 0,
            timezone: currentDraft.timezone,
            timezoneOffset: 0
          }),
          fetchForecast(currentAccessToken, { timeframe: "daily" })
        ]);

        const chart = {
          bigThree: {
            moon: chartResponse.chart.bigThree?.moon ?? "private",
            rising: chartResponse.chart.bigThree?.rising ?? "measured",
            sun: chartResponse.chart.bigThree?.sun ?? "steady"
          },
          summary: chartResponse.summary ?? buildLocalChartSnapshot(currentDraft).summary
        };

        setChartSnapshot(chart);
        setDailySignal(forecastResponse.content || buildLocalDailySignal(chart));
        setLastError(null);
      } catch (error) {
        const chart = buildLocalChartSnapshot(currentDraft);
        setChartSnapshot(chart);
        setDailySignal(buildLocalDailySignal(chart));
        setLastError(error instanceof Error ? error.message : "Live chart loading failed.");
      } finally {
        router.replace("/chart");
      }
    }
  }, [auth.accessToken, birthDraft, setChartSnapshot, setDailySignal, setLastError]);

  return (
    <ScreenScaffold
      eyebrow="Chart loading"
      title="The chart should feel composed, not instant."
      subtitle="This screen is the trust bridge between data entry and the first personalized reveal."
    >
      <FeaturePanel
        title="Behavior"
        body="Locating the emotional pattern, calibrating the timing layer, and composing the first clear read."
      />
    </ScreenScaffold>
  );
}
