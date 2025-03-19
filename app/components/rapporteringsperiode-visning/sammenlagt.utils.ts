import { konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

export function beregnTotalt(periode: IRapporteringsperiode, type: string, erDager: boolean) {
  return periode.dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((aktivitet) => aktivitet.type === type);
    if (!aktivitet) return sum;
    return erDager ? sum + 1 : sum + (konverterFraISO8601Varighet(aktivitet.timer) || 0);
  }, 0);
}
