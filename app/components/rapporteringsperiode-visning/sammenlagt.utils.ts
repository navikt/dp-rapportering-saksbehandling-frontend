import { AKTIVITET_TYPE } from "~/utils/constants";
import { konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

export function beregnTotalt(periode: IRapporteringsperiode, type: string) {
  return periode.dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((aktivitet) => aktivitet.type === type);
    if (!aktivitet) return sum;

    if (type === AKTIVITET_TYPE.Arbeid) {
      return sum + (konverterFraISO8601Varighet(aktivitet.timer || "PT0H") || 0);
    }

    return sum + 1;
  }, 0);
}
