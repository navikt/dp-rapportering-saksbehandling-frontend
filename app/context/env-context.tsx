import { createContext, useContext, useEffect } from "react";

import { setClientEnv } from "~/utils/env.utils";
import type { IEnv } from "~/utils/types";

interface EnvContextType {
  env: Partial<IEnv>;
}

const EnvContext = createContext<EnvContextType | null>(null);

export function EnvProvider({ children, env }: { children: React.ReactNode; env: Partial<IEnv> }) {
  // Set client env cache on mount and when env changes
  useEffect(() => {
    setClientEnv(env);
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
