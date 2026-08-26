import { QUERY_PARAMS } from "~/utils/constants";
import { ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

export function hentOppdaterteNokler(searchParams: URLSearchParams): string[] {
  return searchParams.get(QUERY_PARAMS.OPPDATERT)?.split(",") ?? [];
}

export function erOppdatertPeriode(
  periode: IRapporteringsperiode,
  oppdaterteNokler: string[],
): boolean {
  const periodeNokkel = `${periode.periode.fraOgMed}_${periode.periode.tilOgMed}`;
  return oppdaterteNokler.includes(periode.id) || oppdaterteNokler.includes(periodeNokkel);
}

export function finnOppdatertePerioder(
  perioder: IRapporteringsperiode[],
  oppdaterteNokler: string[],
): IRapporteringsperiode[] {
  return perioder.filter((periode) => erOppdatertPeriode(periode, oppdaterteNokler));
}

export function finnOppdaterteAar(
  perioder: IRapporteringsperiode[],
  oppdaterteNokler: string[],
): number[] {
  return finnOppdatertePerioder(perioder, oppdaterteNokler).map((periode) =>
    Number(periode.periode.fraOgMed.slice(0, 4)),
  );
}

export function byggOppdateringsmelding(
  oppdatertePerioder: IRapporteringsperiode[],
  erOpprettelse: boolean,
): string | null {
  if (oppdatertePerioder.length === 0) return null;

  if (erOpprettelse) {
    const antall = oppdatertePerioder.length;
    return `${antall} ${antall === 1 ? "nytt meldekort ble" : "nye meldekort ble"} opprettet`;
  }

  const periode = oppdatertePerioder[0];
  return periode.originalMeldekortId
    ? `Meldekort for uke ${ukenummer(periode)} ble korrigert og oppdatert`
    : `Meldekort for uke ${ukenummer(periode)} ble sendt inn`;
}
