import type { IEnv } from "./types";

export function getEnv<T>(value: keyof IEnv): T {
  const env = typeof window !== "undefined" ? window.env : process.env;

  // @ts-ignore
  return (env[value] || env[`VITE_${value}`] || "") as unknown as T;
}

export const isLocalhost = getEnv("IS_LOCALHOST") === "true";
