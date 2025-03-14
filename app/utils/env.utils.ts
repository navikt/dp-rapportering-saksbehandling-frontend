import type { IEnv } from "./types";

export function getEnv<T>(key: keyof IEnv): T {
  const env = typeof window !== "undefined" ? window.env : process.env;

  const defaultEnv: IEnv = {
    IS_LOCALHOST: "false",
    USE_MSW: env.NODE_ENV === "test" ? "true" : "false",
    DP_RAPPORTERING_URL: "https://dp-rapportering.intern.dev.navn.no",
  };

  // @ts-expect-error IEnv inneholder ikke VITE_ prefix
  const value = (env[key] || env[`VITE_${key}`] || defaultEnv[key] || "") as unknown as T;
  return value;
}

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";
