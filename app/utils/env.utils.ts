import type { IEnv } from "./types";

export function getEnv<T>(value: keyof IEnv): T {
  const env = typeof window !== "undefined" ? window.env : process.env;

  const defaultEnv: IEnv = {
    IS_LOCALHOST: "false",
    USE_MSW: env.NODE_ENV === "test" ? "true" : "false",
    DP_RAPPORTERING_URL: "https://dp-rapportering.intern.dev.navn.no",
    BASE_PATH: "/rapportering",
  };

  // @ts-expect-error IEnv inneholder ikke VITE_ prefix
  return (env[value] || env[`VITE_${value}`] || defaultEnv[value] || "") as unknown as T;
}

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";
