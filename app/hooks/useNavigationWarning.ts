import { useEffect } from "react";

import { useNavigationWarningContextOptional } from "~/context/navigation-warning-context";

interface UseNavigationWarningOptions {
  hasChanges: boolean;
}

/**
 * Custom hook som håndterer advarsler ved navigering når det finnes ulagrede endringer
 * Bruker browserens standard navigasjonsadvarsel
 *
 * @param hasChanges - Om det finnes ulagrede endringer
 * @returns disableWarning - Funksjon for å midlertidig deaktivere advarselen
 */
export function useNavigationWarning({ hasChanges }: UseNavigationWarningOptions) {
  const context = useNavigationWarningContextOptional();

  // Bruk context hvis tilgjengelig, ellers lag lokal ref (fallback)
  const isDisabledRef = context?.isDisabledRef;

  const disableWarning = () => {
    if (context) {
      context.disableWarning();
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const isDisabled = isDisabledRef?.current ?? false;
      if (hasChanges && !isDisabled) {
        event.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges, isDisabledRef]);

  return { disableWarning };
}
