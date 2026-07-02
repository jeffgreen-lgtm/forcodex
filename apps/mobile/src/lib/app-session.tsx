import {
  createContext,
  ReactNode,
  useCallback,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { ProductKey } from "@cosmoscope/api/contracts";

import { storage } from "./storage";

type BirthDraft = {
  birthDate: string;
  birthPlace: string;
  birthTime: string;
  displayName: string;
  timezone: string;
  unknownBirthTime: boolean;
};

type ChartSnapshot = {
  bigThree: {
    moon: string;
    rising: string;
    sun: string;
  };
  summary: string;
};

type AuthSession = {
  accessToken: string | null;
  email: string | null;
  expiresAt: number | null;
  refreshToken: string | null;
  userId: string | null;
};

type EntitlementState = {
  activeSubscriptionProductKey: ProductKey | null;
  premiumActive: boolean;
  sourceUpdatedAt: string | null;
  unlocks: {
    forecastMonthly: boolean;
    lovescope: boolean;
    starscope: boolean;
    yearlyBlueprint: boolean;
  };
};

type SessionState = {
  auth: AuthSession;
  birthDraft: BirthDraft | null;
  chart: ChartSnapshot | null;
  dailySignal: string | null;
  entitlements: EntitlementState;
  isHydrated: boolean;
  lastError: string | null;
};

type SessionContextValue = SessionState & {
  clearSession: () => void;
  clearTransientError: () => void;
  setAuthSession: (auth: Partial<AuthSession>) => void;
  setBirthDraft: (draft: BirthDraft) => void;
  setChartSnapshot: (chart: ChartSnapshot) => void;
  setDailySignal: (signal: string) => void;
  setEntitlements: (entitlements: Partial<EntitlementState>) => void;
  setLastError: (message: string | null) => void;
};

const STORAGE_KEY = "cosmoscope.phase1.session";

const defaultState: SessionState = {
  auth: {
    accessToken: null,
    email: null,
    expiresAt: null,
    refreshToken: null,
    userId: null
  },
  birthDraft: null,
  chart: null,
  dailySignal: null,
  entitlements: {
    activeSubscriptionProductKey: null,
    premiumActive: false,
    sourceUpdatedAt: null,
    unlocks: {
      forecastMonthly: false,
      lovescope: false,
      starscope: false,
      yearlyBlueprint: false
    }
  },
  isHydrated: false,
  lastError: null
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);

  useEffect(() => {
    const raw = storage.getString(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SessionState;
      startTransition(() => {
        setState({
          ...defaultState,
          ...parsed,
          auth: { ...defaultState.auth, ...(parsed.auth ?? {}) },
          entitlements: {
            ...defaultState.entitlements,
            ...(parsed.entitlements ?? {}),
            unlocks: {
              ...defaultState.entitlements.unlocks,
              ...(parsed.entitlements?.unlocks ?? {})
            }
          },
          isHydrated: true
        });
      });
    } catch {
      storage.delete(STORAGE_KEY);
      setState((current) => ({ ...current, isHydrated: true }));
    }
  }, []);

  useEffect(() => {
    if (!state.isHydrated) {
      return;
    }

    storage.set(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const clearSession = useCallback(() => {
    setState({ ...defaultState, isHydrated: true });
  }, []);

  const clearTransientError = useCallback(() => {
    setState((current) => ({ ...current, lastError: null }));
  }, []);

  const setAuthSession = useCallback((auth: Partial<AuthSession>) => {
    setState((current) => ({
      ...current,
      auth: {
        ...current.auth,
        ...auth
      }
    }));
  }, []);

  const setBirthDraft = useCallback((draft: BirthDraft) => {
    setState((current) => ({ ...current, birthDraft: draft }));
  }, []);

  const setChartSnapshot = useCallback((chart: ChartSnapshot) => {
    setState((current) => ({ ...current, chart }));
  }, []);

  const setDailySignal = useCallback((signal: string) => {
    setState((current) => ({ ...current, dailySignal: signal }));
  }, []);

  const setEntitlements = useCallback((entitlements: Partial<EntitlementState>) => {
    setState((current) => ({
      ...current,
      entitlements: {
        ...current.entitlements,
        ...entitlements,
        unlocks: {
          ...current.entitlements.unlocks,
          ...(entitlements.unlocks ?? {})
        }
      }
    }));
  }, []);

  const setLastError = useCallback((message: string | null) => {
    setState((current) => ({ ...current, lastError: message }));
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      clearSession,
      clearTransientError,
      setAuthSession,
      setBirthDraft,
      setChartSnapshot,
      setDailySignal,
      setEntitlements,
      setLastError
    }),
    [clearSession, clearTransientError, setAuthSession, setBirthDraft, setChartSnapshot, setDailySignal, setEntitlements, setLastError, state]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useAppSession must be used inside AppSessionProvider");
  }
  return context;
}

export function buildLocalChartSnapshot(draft: BirthDraft): ChartSnapshot {
  const seed = `${draft.birthDate}|${draft.birthTime}|${draft.birthPlace}|${draft.timezone}`;
  const sun = pickFrom(seed, ["Radiant", "Steady", "Electric", "Introspective", "Magnetic"]);
  const moon = pickFrom(`${seed}|moon`, ["private", "protective", "sensory", "composed", "immediate"]);
  const rising = pickFrom(`${seed}|rising`, ["direct", "soft-spoken", "commanding", "curious", "measured"]);

  return {
    bigThree: { moon, rising, sun },
    summary: `${draft.displayName.split(" ")[0]} leads with a ${sun.toLowerCase()} center, a ${moon} inner rhythm, and a ${rising} first impression.`
  };
}

export function buildLocalDailySignal(chart: ChartSnapshot) {
  return `Today favors a ${chart.bigThree.rising.toLowerCase()} pace and cleaner emotional timing.`;
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
