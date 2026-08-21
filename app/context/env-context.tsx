import { createContext, useContext, useEffect } from "react";

import { initFaro } from "~/faro";
import { setClientEnv } from "~/utils/env.utils";
import type { IEnv } from "~/utils/types";

interface EnvContextType {
  env: Partial<IEnv>;
}

const EnvContext = createContext<EnvContextType | null>(null);

export function EnvProvider({ children, env }: { children: React.ReactNode; env: Partial<IEnv> }) {
  // Må settes under render, ikke i useEffect, ellers ser første klient-render andre verdier enn SSR
  setClientEnv(env);

  useEffect(() => {
    initFaro();
  }, [env]);

  return <EnvContext.Provider value={{ env }}>{children}</EnvContext.Provider>;
}

export function useEnv() {
  const context = useContext(EnvContext);
  if (!context) {
    return { env: {} };
  }
  return context;
}
