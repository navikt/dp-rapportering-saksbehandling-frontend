import type { IEnv } from "./types";

function getEnvVariables() {
  return typeof window === "undefined" ||
    (typeof process !== "undefined" && process?.env.NODE_ENV === "test")
    ? process.env
    : window.env;
}

export function getEnv<T>(key: keyof IEnv): T {
  const env = getEnvVariables();

  const defaultEnv: IEnv = {
    IS_LOCALHOST: "false",
    USE_MSW: env.NODE_ENV === "test" ? "true" : "false",
    DP_MELDEKORTREGISTER_URL: "https://dp-meldekortregister.intern.dev.navn.no",
    FARO_URL: "http://localhost:12347/collect",
  };

  // @ts-expect-error IEnv inneholder ikke VITE_ prefix
  const value = (env[key] || env[`VITE_${key}`] || defaultEnv[key] || "") as unknown as T;
  return value;
}

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";

export const usesMsw = getEnv("USE_MSW") === "true";

export const isLocalOrDemo = isLocalhost || usesMsw;
