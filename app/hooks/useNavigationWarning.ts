import { useEffect, useRef } from "react";

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
  const isDisabledRef = useRef(false);

  const disableWarning = () => {
    isDisabledRef.current = true;
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges && !isDisabledRef.current) {
        event.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  return { disableWarning };
}
