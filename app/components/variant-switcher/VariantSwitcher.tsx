import { ActionMenu, Button } from "@navikt/ds-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { useNavigationWarningContextOptional } from "~/context/navigation-warning-context";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import type { DemoAction, DemoStatus } from "~/utils/demo-params.utils";

import styles from "./variantSwitcher.module.css";

export function VariantSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigationWarningContext = useNavigationWarningContextOptional();

  const currentVariant = (searchParams.get("variant") as ABTestVariant) || null;
  const currentStatus = (searchParams.get("status") as DemoStatus) || null;
  const currentAction = (searchParams.get("action") as DemoAction) || null;

  // Variant A er når variant er "A" eller null
  const isVariantA = currentVariant === "A" || currentVariant === null;

  // Sjekk hvilke sider vi er på for betinget visning av parametere
  const isKorrigerPage = location.pathname.includes("/korriger");
  const isFyllUtPage = location.pathname.includes("/fyll-ut");
  const isActionPage = isKorrigerPage || isFyllUtPage; // Sider hvor man sender inn data

  const handleParamChange = (param: string, value: string) => {
    // Deaktiver navigasjonsadvarsel før vi endrer demo-parametere
    navigationWarningContext?.disableWarning();
    const url = new URL(location.pathname + location.search, window.location.origin);
    const isRemovingParam = value === "none";

    if (isRemovingParam) {
      url.searchParams.delete(param);
    } else {
      url.searchParams.set(param, value);
    }

    // For status og action params: full page reload for å trigge loader på nytt
    // For variant: klient-side navigasjon er ok
    if (param === "status" || param === "action") {
      // Hvis vi fjerner en feilsimulering mens vi er på error boundary,
      // må vi først oppdatere URL og deretter reloade
      if (isRemovingParam) {
        window.history.replaceState({}, "", url.pathname + url.search);
        window.location.reload();
      } else {
        window.location.href = url.pathname + url.search;
      }
    } else {
      navigate(url.pathname + url.search);
    }
  };

  return (
    <div className={styles.variantButtonContainer}>
      <ActionMenu>
        <ActionMenu.Trigger>
          <Button data-color="neutral" variant="primary" size="small">
            Verktøy
          </Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          {!isActionPage && (
            <>
              <ActionMenu.Group label="Variant:">
                <ActionMenu.Item onSelect={() => handleParamChange("variant", "A")}>
                  Variant A {isVariantA && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("variant", "B")}>
                  Variant B {currentVariant === "B" && "✓"}
                </ActionMenu.Item>
              </ActionMenu.Group>

              <ActionMenu.Divider />

              <ActionMenu.Group label="Simuler feil:">
                <ActionMenu.Item onSelect={() => handleParamChange("status", "none")}>
                  Ingen feil {!currentStatus && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("status", "404-person")}>
                  Fant ikke personen {currentStatus === "404-person" && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("status", "404-perioder")}>
                  Fant ingen meldekort {currentStatus === "404-perioder" && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("status", "404-page")}>
                  Siden eksisterer ikke {currentStatus === "404-page" && "✓"}
                </ActionMenu.Item>
              </ActionMenu.Group>
            </>
          )}

          {isActionPage && (
            <>
              <ActionMenu.Group label="Variant:">
                <ActionMenu.Item onSelect={() => handleParamChange("variant", "A")}>
                  Variant A {isVariantA && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("variant", "B")}>
                  Variant B {currentVariant === "B" && "✓"}
                </ActionMenu.Item>
              </ActionMenu.Group>

              <ActionMenu.Divider />

              <ActionMenu.Group label="Simuler feil ved innsending:">
                <ActionMenu.Item onSelect={() => handleParamChange("action", "none")}>
                  Ingen feil {!currentAction && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("action", "fail")}>
                  Innsending skal feile {currentAction === "fail" && "✓"}
                </ActionMenu.Item>
              </ActionMenu.Group>

              <ActionMenu.Divider />

              <ActionMenu.Group label="Simuler feil ved lasting:">
                <ActionMenu.Item onSelect={() => handleParamChange("status", "none")}>
                  Ingen feil {!currentStatus && "✓"}
                </ActionMenu.Item>
                <ActionMenu.Item onSelect={() => handleParamChange("status", "404-periode")}>
                  Fant ikke meldekortet {currentStatus === "404-periode" && "✓"}
                </ActionMenu.Item>
              </ActionMenu.Group>
            </>
          )}
        </ActionMenu.Content>
      </ActionMenu>
    </div>
  );
}
