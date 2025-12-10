import dagStyles from "~/components/tabeller/kalender/components/dag.module.css";
import aktiviteterStyles from "~/styles/aktiviteter.module.css";

import type { ABTestVariant } from "./ab-test.utils";
import { AKTIVITET_PRIORITET, AKTIVITET_TYPE } from "./constants";
import type { TAktivitetType } from "./types";

export const AKTIVITET_KLASSER = {
  [AKTIVITET_TYPE.Arbeid]: {
    datoColor: aktiviteterStyles.arbeid,
    bgColor: dagStyles.arbeidBg,
    dotColor: dagStyles.arbeidDot,
  },
  [AKTIVITET_TYPE.Syk]: {
    datoColor: aktiviteterStyles.syk,
    bgColor: dagStyles.sykBg,
    dotColor: dagStyles.sykDot,
  },
  [AKTIVITET_TYPE.Fravaer]: {
    datoColor: aktiviteterStyles.fravaer,
    bgColor: dagStyles.fravaerBg,
    dotColor: dagStyles.fravaerDot,
  },
  [AKTIVITET_TYPE.Utdanning]: {
    datoColor: aktiviteterStyles.utdanning,
    bgColor: dagStyles.utdanningBg,
    dotColor: dagStyles.utdanningDot,
  },
} as const;

export const AKTIVITET_KLASSER_VARIANT_A = {
  [AKTIVITET_TYPE.Arbeid]: {
    datoColor: aktiviteterStyles.arbeidVariantA,
    bgColor: dagStyles.arbeidBgVariantA,
    dotColor: dagStyles.arbeidDotVariantA,
  },
  [AKTIVITET_TYPE.Syk]: {
    datoColor: aktiviteterStyles.sykVariantA,
    bgColor: dagStyles.sykBgVariantA,
    dotColor: dagStyles.sykDotVariantA,
  },
  [AKTIVITET_TYPE.Fravaer]: {
    datoColor: aktiviteterStyles.fravaerVariantA,
    bgColor: dagStyles.fravaerBgVariantA,
    dotColor: dagStyles.fravaerDotVariantA,
  },
  [AKTIVITET_TYPE.Utdanning]: {
    datoColor: aktiviteterStyles.utdanningVariantA,
    bgColor: dagStyles.utdanningBgVariantA,
    dotColor: dagStyles.utdanningDotVariantA,
  },
} as const;

/**
 * Hent CSS-klasser for en aktivitet basert på prioritet
 * Når flere aktiviteter finnes, bestemmer aktiviteten med høyest prioritet fargen
 * Prioriteringsrekkefølge: Syk > Fravaer > Arbeid > Utdanning
 */
export const getActivityClasses = (
  aktiviteter?: Array<{ type: string }>,
  variant?: ABTestVariant,
): { datoColor: string; bgColor: string } => {
  if (!aktiviteter || aktiviteter.length === 0) {
    return { datoColor: "", bgColor: "" };
  }

  const types = aktiviteter.map((a) => a.type);

  // Finn aktivitetstypen med høyest prioritet
  const priorityType = AKTIVITET_PRIORITET.find((type) => types.includes(type));

  // Variant B bruker Aksel farger, andre bruker gamle farger (light) / Aksel (dark)
  const klasseMapping = variant === "B" ? AKTIVITET_KLASSER : AKTIVITET_KLASSER_VARIANT_A;

  if (priorityType && priorityType in klasseMapping) {
    const klasser = klasseMapping[priorityType as TAktivitetType];
    return { datoColor: klasser.datoColor, bgColor: klasser.bgColor };
  }

  return { datoColor: "", bgColor: "" };
};

/**
 * Hent CSS-farge for prikkene til en spesifikk aktivitetstype
 * Brukes for pseudo-elementet (::before) når flere aktiviteter vises
 */
export const getActivityDotColor = (type: string, variant?: ABTestVariant): string => {
  // Variant B bruker Aksel farger, andre bruker gamle farger (light) / Aksel (dark)
  const klasseMapping = variant === "B" ? AKTIVITET_KLASSER : AKTIVITET_KLASSER_VARIANT_A;

  if (type in klasseMapping) {
    return klasseMapping[type as TAktivitetType].dotColor;
  }
  return "";
};
