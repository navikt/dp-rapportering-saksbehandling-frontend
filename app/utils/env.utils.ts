import type { IEnv } from "./types";

// Client side environment cache - populeres av EnvProvider under hydration
let clientEnv: Partial<IEnv> = {};

export function setClientEnv(env: Partial<IEnv>) {
  clientEnv = env;
}

function getEnvVariables() {
  // Server side eller test-miljø
  if (
    typeof window === "undefined" ||
    (typeof process !== "undefined" && process?.env.NODE_ENV === "test")
  ) {
    return process.env;
  }

  // Client side: bruk cached env fra context, med import.meta.env som fallback
  // import.meta.env er alltid tilgjengelig på klient, også utenfor EnvProvider context
  // EnvProvider er fortsatt nyttig for runtime config og for å eksplisitt definere hvilke verdier som er safe å eksponere
  return {
    ...import.meta.env,
    ...clientEnv, // clientEnv overstyrer import.meta.env hvis tilgjengelig (for runtime verdier)
  };
}

export function getEnv<T>(key: keyof IEnv): T {
  const env = getEnvVariables() as Record<string, string | undefined>;

  const defaultEnv: IEnv = {
    IS_LOCALHOST: "false",
    USE_MSW: env.NODE_ENV === "test" ? "true" : "false",
    DP_MELDEKORTREGISTER_URL: "https://dp-meldekortregister.intern.dev.nav.no",
    DP_PERSONREGISTER_URL: "https://dp-rapportering-personregister.intern.dev.nav.no",
    DP_BEHANDLING_URL: "https://dp-behandling.intern.dev.nav.no",
    FARO_URL: "http://localhost:12347/collect",
    RUNTIME_ENVIRONMENT: "production",
  };

  const value = (env[key] || env[`VITE_${key}`] || defaultEnv[key] || "") as unknown as T;
  return value;
}

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";

export const usesMsw = getEnv("USE_MSW") === "true";

export const isLocalOrDemo = isLocalhost || usesMsw;
