import { AKTIVITET_TYPE } from "~/utils/constants";
import { konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

/**
 * Beregner totalt antall timer eller dager for en gitt aktivitetstype i en periode
 * For arbeid: returnerer totalt antall timer
 * For andre aktiviteter: returnerer antall dager
 */
export function beregnTotalt(periode: IRapporteringsperiode, type: string): number {
  return periode.dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((aktivitet) => aktivitet.type === type);
    if (!aktivitet) return sum;

    if (type === AKTIVITET_TYPE.Arbeid) {
      return sum + (konverterFraISO8601Varighet(aktivitet.timer || "PT0H") || 0);
    }

    return sum + 1;
  }, 0);
}
