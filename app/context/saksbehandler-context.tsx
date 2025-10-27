import type { PropsWithChildren } from "react";
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

interface ISaksbehandlerContext {
  aktivtOppgaveSok: string;
  setAktivtOppgaveSok: (sok: string) => void;
  skjulSensitiveOpplysninger: boolean;
  setSkjulSensitiveOpplysninger: (verdi: boolean) => void;
}

export const SaksbehandlerContext = createContext<ISaksbehandlerContext | undefined>(undefined);

export function SaksbehandlerProvider({ children }: PropsWithChildren) {
  const [aktivtOppgaveSok, setAktivtOppgaveSok] = useState<string>("");
  const [skjulSensitiveOpplysninger, setSkjulSensitiveOpplysninger] = useState<boolean>(false);

  // Les fra localStorage etter mount (unngår hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem("skjul-sensitive-opplysninger");
    if (stored !== null) {
      setSkjulSensitiveOpplysninger(JSON.parse(stored));
    }
  }, []);

  const handleSetSkjulSensitiveOpplysninger = useCallback((verdi: boolean) => {
    setSkjulSensitiveOpplysninger(verdi);
    localStorage.setItem("skjul-sensitive-opplysninger", JSON.stringify(verdi));
  }, []);

  const contextValue = useMemo(
    () => ({
      aktivtOppgaveSok,
      setAktivtOppgaveSok,
      skjulSensitiveOpplysninger,
      setSkjulSensitiveOpplysninger: handleSetSkjulSensitiveOpplysninger,
    }),
    [aktivtOppgaveSok, skjulSensitiveOpplysninger, handleSetSkjulSensitiveOpplysninger],
  );

  return (
    <SaksbehandlerContext.Provider value={contextValue}>{children}</SaksbehandlerContext.Provider>
  );
}
