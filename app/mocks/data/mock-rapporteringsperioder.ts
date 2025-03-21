import { addDays, format, getWeek, getYear, subWeeks } from "date-fns";
import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IAktivitet, IRapporteringsperiode } from "~/utils/types";

import {
  createId,
  lagDager,
  lagPeriodeDatoFor,
  lagRapporteringsperiode,
} from "../mock-rapporteringsperioder.utils";

/**

Ingenting fylt ut, alt fylt ut og noe fylt ut

BeregningFeilet -> huket av for utdanning, men bruker har ikke tiltak

Må vise at det er korrigert

Tooltip på aktivitet
 */

const id = createId();

const perioder: {
  periode: Partial<IRapporteringsperiode>;
  ukerFraIDag: number;
  innsendtEtterTilOgMed: number;
  aktiviteter?: Array<null | Pick<IAktivitet, "type" | "timer">[]>;
}[] = [
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling },
    ukerFraIDag: -2,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Innsendt, registrertArbeidssoker: true },
    ukerFraIDag: 0,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 2,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 4,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 6,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      originalId: id,
      begrunnelseEndring: "Feil annet fravær",
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 8,
    innsendtEtterTilOgMed: 1,
  }, // Saksbehandler har tatt vekk utdanning
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Feilet,
      id,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 8,
    innsendtEtterTilOgMed: 1,
    aktiviteter: [null, null, [{ type: AKTIVITET_TYPE.Utdanning }]],
  }, // Bruker har ført utdanning
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 10,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 12,
    innsendtEtterTilOgMed: 18,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 14,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
      bruttoBelop: 3056,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 16,
    innsendtEtterTilOgMed: 1,
  },
];

export default perioder.map(({ periode, ukerFraIDag, innsendtEtterTilOgMed, aktiviteter }) => {
  const dagensDato = new Date();
  const startDato = subWeeks(dagensDato, ukerFraIDag);

  const { fraOgMed, tilOgMed } = lagPeriodeDatoFor(
    getWeek(startDato, { weekStartsOn: 1 }) - 2,
    getYear(startDato)
  );

  const dager = lagDager().map((dag, index) => {
    const dato = format(addDays(new Date(fraOgMed), index), "yyyy-MM-dd");

    return {
      ...dag,
      dato,
      aktiviteter:
        aktiviteter && aktiviteter[index]
          ? aktiviteter[index].map(({ type, timer = "" }: Pick<IAktivitet, "type" | "timer">) => ({
              id: uuidv7(),
              type,
              dato,
              timer,
            }))
          : [],
    };
  });

  return lagRapporteringsperiode({
    periode: { fraOgMed, tilOgMed },
    dager,
    mottattDato:
      periode.mottattDato ?? format(addDays(tilOgMed, innsendtEtterTilOgMed), "yyyy-MM-dd"),
    ...periode,
  });
});
