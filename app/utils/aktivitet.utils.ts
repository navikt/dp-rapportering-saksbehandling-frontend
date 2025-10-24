import dagStyles from "~/components/tabeller/kalender/components/dag.module.css";
import aktiviteterStyles from "~/styles/aktiviteter.module.css";

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

/**
 * Hent CSS-klasser for en aktivitet basert på prioritet
 * Når flere aktiviteter finnes, bestemmer aktiviteten med høyest prioritet fargen
 * Prioriteringsrekkefølge: Syk > Fravaer > Arbeid > Utdanning
 */
export const getActivityClasses = (
  aktiviteter?: Array<{ type: string }>,
): { datoColor: string; bgColor: string } => {
  if (!aktiviteter || aktiviteter.length === 0) {
    return { datoColor: "", bgColor: "" };
  }

  const types = aktiviteter.map((a) => a.type);

  // Finn aktivitetstypen med høyest prioritet
  const priorityType = AKTIVITET_PRIORITET.find((type) => types.includes(type));

  if (priorityType && priorityType in AKTIVITET_KLASSER) {
    const klasser = AKTIVITET_KLASSER[priorityType as TAktivitetType];
    return { datoColor: klasser.datoColor, bgColor: klasser.bgColor };
  }

  return { datoColor: "", bgColor: "" };
};

/**
 * Hent CSS-farge for prikkene til en spesifikk aktivitetstype
 * Brukes for pseudo-elementet (::before) når flere aktiviteter vises
 */
export const getActivityDotColor = (type: string): string => {
  if (type in AKTIVITET_KLASSER) {
    return AKTIVITET_KLASSER[type as TAktivitetType].dotColor;
  }
  return "";
};
