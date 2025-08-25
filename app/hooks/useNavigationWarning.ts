import { useEffect } from "react";

interface UseNavigationWarningOptions {
  hasChanges: boolean;
}

/**
 * Custom hook som håndterer advarsler ved navigering når det finnes ulagrede endringer
 * Bruker browserens standard navigasjonsadvarsel
 *
 * @param hasChanges - Om det finnes ulagrede endringer
 */
export function useNavigationWarning({ hasChanges }: UseNavigationWarningOptions) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);
}
