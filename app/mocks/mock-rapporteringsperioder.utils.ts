import { addDays, format, startOfWeek, subDays } from "date-fns";

import { KORT_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IPeriode, IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

export function createId(): string {
  return String(Math.floor(Math.random() * 10_000_000_000));
}

export function formatereDato(dato: Date): string {
  return format(dato, "yyyy-MM-dd");
}

export function lagPeriodeDatoFor(dato: Date): IPeriode {
  const startDato = startOfWeek(new Date(dato), { weekStartsOn: 1 });

  return {
    fraOgMed: formatereDato(startDato),
    tilOgMed: formatereDato(addDays(startDato, 13)),
  };
}

export function beregnNåværendePeriodeDato(): IPeriode {
  return lagPeriodeDatoFor(new Date());
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
