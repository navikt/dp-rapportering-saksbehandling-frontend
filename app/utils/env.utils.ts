import type { IEnv } from "./types";

const defaultEnv: IEnv = {
  IS_LOCALHOST: "false",
  USE_MSW: "false",
  DP_RAPPORTERING_URL: "https://dp-rapportering.intern.dev.navn.no",
  BASE_PATH: "/rapportering",
};

export function getEnv<T>(value: keyof IEnv): T {
  const env = typeof window !== "undefined" ? window.env : process.env;

  // @ts-ignore
  return (env[value] || env[`VITE_${value}`] || defaultEnv[value] || "") as unknown as T;
}

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";
