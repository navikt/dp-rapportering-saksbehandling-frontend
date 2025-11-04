import { Radio, RadioGroup } from "@navikt/ds-react";
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

  return (
    <div className={styles.variantSwitcher}>
      <RadioGroup
        legend="Demo"
        size="small"
        value={currentVariant || "none"}
        onChange={handleVariantChange}
      >
        <Radio value="none">Standard</Radio>
        <Radio value="B">Variant B</Radio>
        {isKorrigerPage && <Radio value="C">Variant C</Radio>}
      </RadioGroup>
    </div>
  );
}
