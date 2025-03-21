import { addDays, addWeeks, format, getWeek, getYear, startOfWeek, subDays } from "date-fns";

import { KORT_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IPeriode, IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

export function createId(): string {
  return String(Math.floor(Math.random() * 10_000_000_000));
}

export function formatereDato(dato: Date): string {
  return format(dato, "yyyy-MM-dd");
}

export function lagPeriodeDatoFor(uke: number, år: number): IPeriode {
  const startdato = addWeeks(
    startOfWeek(new Date(Date.UTC(år, 0, 1)), { weekStartsOn: 1 }),
    uke - 1
  );

  return {
    fraOgMed: formatereDato(startdato),
    tilOgMed: formatereDato(addDays(startdato, 13)),
  };
}

export function beregnNåværendePeriodeDato(): IPeriode {
  const uke = getWeek(new Date(), { weekStartsOn: 1 }) - 2;
  const år = getYear(new Date());

  return lagPeriodeDatoFor(uke, år);
}

export function lagDager(): IRapporteringsperiodeDag[] {
  return new Array(14).fill(null).map((_, i) => ({
    dagIndex: i,
    dato: "",
    aktiviteter: [],
  }));
}

export function lagRapporteringsperiode(
  props: Partial<IRapporteringsperiode> = {}
): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: createId(),
    type: KORT_TYPE.Elektronisk,
    periode: {
      fraOgMed,
      tilOgMed,
    },
    dager: lagDager(),
    sisteFristForTrekk: null,
    kanSendesFra: "",
    kanSendes: true,
    kanEndres: true,
    bruttoBelop: null,
    begrunnelseEndring: "",
    status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
    mottattDato: null,
    registrertArbeidssoker: null,
    originalId: null,
    html: null,
    rapporteringstype: null,
    ...props,
  };

  meldekort.kanSendesFra = format(subDays(new Date(meldekort.periode.tilOgMed), 1), "yyyy-MM-dd");
  meldekort.sisteFristForTrekk = format(
    addDays(new Date(meldekort.periode.tilOgMed), 8),
    "yyyy-MM-dd"
  );

  if (!props.dager) {
    meldekort.dager = meldekort.dager.map((dag, index) => ({
      ...dag,
      dato: format(addDays(new Date(meldekort.periode.fraOgMed), index), "yyyy-MM-dd"),
    }));
  }

  return meldekort;
}
