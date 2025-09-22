import type { PropsWithChildren } from "react";
import { createContext, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

interface ISaksbehandlerContext {
  aktivtOppgaveSok: string;
  setAktivtOppgaveSok: (sok: string) => void;
  skjulSensitiveOpplysninger: boolean;
  setSkjulSensitiveOpplysninger: (verdi: boolean) => void;
}

export const SaksbehandlerContext = createContext<ISaksbehandlerContext | undefined>(undefined);

export function SaksbehandlerProvider({ children }: PropsWithChildren) {
  const [aktivtOppgaveSok, setAktivtOppgaveSok] = useState<string>("");
  const [skjulSensitiveOpplysninger, setSkjulSensitiveOpplysninger] = useLocalStorage<boolean>(
    "skjul-sensitive-opplysninger",
    false,
  );

  return (
    <SaksbehandlerContext.Provider
      value={{
        aktivtOppgaveSok,
        setAktivtOppgaveSok,
        skjulSensitiveOpplysninger,
        setSkjulSensitiveOpplysninger,
      }}
    >
      {children}
    </SaksbehandlerContext.Provider>
  );
}
