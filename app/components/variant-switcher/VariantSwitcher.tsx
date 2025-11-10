import { ActionMenu, Button } from "@navikt/ds-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import type { ABTestVariant } from "~/utils/ab-test.utils";

import styles from "./variantSwitcher.module.css";

export function VariantSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentVariant = (searchParams.get("variant") as ABTestVariant) || null;
  const isKorrigerPage = location.pathname.includes("/korriger");

  const handleVariantChange = (variant: string) => {
    const url = new URL(location.pathname + location.search, window.location.origin);

    if (variant === "none") {
      url.searchParams.delete("variant");
    } else {
      url.searchParams.set("variant", variant);
    }

    navigate(url.pathname + url.search);
  };

  const getVariantLabel = () => {
    if (currentVariant === "B") return "Variant B";
    if (currentVariant === "C") return "Variant C";
    return "Variant A";
  };

  return (
    <div className={styles.variantButtonContainer}>
      <ActionMenu>
        <ActionMenu.Trigger>
          <Button variant="primary-neutral" size="small">
            Demo: {getVariantLabel()}
          </Button>
        </ActionMenu.Trigger>
        <ActionMenu.Content>
          <ActionMenu.Group label="Velg variant">
            <ActionMenu.Item onSelect={() => handleVariantChange("none")}>
              Variant A {!currentVariant && "✓"}
            </ActionMenu.Item>
            <ActionMenu.Item onSelect={() => handleVariantChange("B")}>
              Variant B {currentVariant === "B" && "✓"}
            </ActionMenu.Item>
            {isKorrigerPage && (
              <ActionMenu.Item onSelect={() => handleVariantChange("C")}>
                Variant C {currentVariant === "C" && "✓"}
              </ActionMenu.Item>
            )}
          </ActionMenu.Group>
        </ActionMenu.Content>
      </ActionMenu>
    </div>
  );
}
