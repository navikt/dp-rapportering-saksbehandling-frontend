import { Theme } from "@navikt/ds-react";
import type { PropsWithChildren } from "react";
import { createContext, useCallback, useLayoutEffect, useMemo, useState } from "react";

type Tema = "light" | "dark";

interface ISaksbehandlerContext {
  aktivtOppgaveSok: string;
  setAktivtOppgaveSok: (sok: string) => void;
  skjulSensitiveOpplysninger: boolean;
  setSkjulSensitiveOpplysninger: (verdi: boolean) => void;
  tema: Tema;
  setTema: (tema: Tema) => void;
}

export const SaksbehandlerContext = createContext<ISaksbehandlerContext | undefined>(undefined);

interface SaksbehandlerProviderProps extends PropsWithChildren {
  serverTema?: string | null;
}

export function SaksbehandlerProvider({ children, serverTema }: SaksbehandlerProviderProps) {
  const [aktivtOppgaveSok, setAktivtOppgaveSok] = useState<string>("");

  /**
   * Initialiserer med sensitive data skjult av sikkerhetshensyn.
   * Vil bli oppdatert fra localStorage etter mount hvis bruker har valgt å vise dem.
   * Dette forhindrer at sensitive data kort vises før de skjules.
   */
  const [skjulSensitiveOpplysninger, setSkjulSensitiveOpplysninger] = useState<boolean>(true);

  /**
   * Tema-initialiseringsstrategi for å forhindre feil tema ved lasting (FOUC):
   *
   * 1. Server-side (SSR): Les tema fra cookie og send til klient
   * 2. Client-side (første besøk): Inline script i <head> setter data-theme før React hydrerer
   * 3. Lazy initialization: Les fra serverTema → data-theme → fallback til "light"
   *
   * Dette sikrer at server og klient renderer med samme tema, og unngår hydration mismatch.
   */
  const [tema, setTemaState] = useState<Tema>(() => {
    // Prioritet 1: Bruk server tema hvis tilgjengelig (fra cookie)
    if (serverTema === "light" || serverTema === "dark") {
      return serverTema;
    }

    // Prioritet 2: På klient, les fra data-theme attributt satt av inline script
    if (typeof window !== "undefined") {
      const dataTheme = document.documentElement.getAttribute("data-theme");
      if (dataTheme === "light" || dataTheme === "dark") {
        return dataTheme;
      }
    }

    // Prioritet 3: Fallback til light (matcher server default)
    return "light";
  });

  // Les fra localStorage etter mount (unngår hydration mismatch)
  useLayoutEffect(() => {
    const storedSensitiv = localStorage.getItem("skjul-sensitive-opplysninger");
    if (storedSensitiv !== null) {
      const verdi = JSON.parse(storedSensitiv);
      setSkjulSensitiveOpplysninger(verdi);
      // Synkroniser med cookie for server-side maskering
      document.cookie = `skjul-sensitive-opplysninger=${JSON.stringify(verdi)}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, []);

  const handleSetSkjulSensitiveOpplysninger = useCallback((verdi: boolean) => {
    setSkjulSensitiveOpplysninger(verdi);
    localStorage.setItem("skjul-sensitive-opplysninger", JSON.stringify(verdi));
    // Sett også cookie slik at serveren kan lese verdien for server-side maskering
    document.cookie = `skjul-sensitive-opplysninger=${JSON.stringify(verdi)}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  /**
   * Oppdater tema i alle lagringslokasjoner samtidig for å holde dem synkronisert:
   * - React state: For komponent re-rendering
   * - localStorage: Client-side persistens (leses av inline script)
   * - Cookie: Server-side persistens (leses av SSR loader)
   * - DOM attributt: Umiddelbar visuell oppdatering (CSS bruker data-theme selector)
   */
  const setTema = useCallback((nyttTema: Tema) => {
    setTemaState(nyttTema);
    localStorage.setItem("tema", nyttTema);
    document.cookie = `tema=${nyttTema}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute("data-theme", nyttTema);
  }, []);

  const contextValue = useMemo(
    () => ({
      aktivtOppgaveSok,
      setAktivtOppgaveSok,
      skjulSensitiveOpplysninger,
      setSkjulSensitiveOpplysninger: handleSetSkjulSensitiveOpplysninger,
      tema,
      setTema,
    }),
    [
      aktivtOppgaveSok,
      skjulSensitiveOpplysninger,
      handleSetSkjulSensitiveOpplysninger,
      tema,
      setTema,
    ],
  );

  return (
    <SaksbehandlerContext.Provider value={contextValue}>
      {/* Bruker tema fra server eller klient */}
      <Theme theme={tema} className="main-container">
        {children}
      </Theme>
    </SaksbehandlerContext.Provider>
  );
}
