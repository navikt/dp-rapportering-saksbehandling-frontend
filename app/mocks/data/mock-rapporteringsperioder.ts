import { addDays, format, subWeeks } from "date-fns";
import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { konverterTilISO8601Varighet } from "~/utils/dato.utils";
import type { IAktivitet, IPerson, IRapporteringsperiode } from "~/utils/types";

import { createId, lagDager, lagPeriodeDatoFor, lagRapporteringsperiode } from "../mock.utils";

const id = createId();

const perioder: {
  periode: Partial<IRapporteringsperiode>;
  ukerFraIDag: number;
  innsendtEtterTilOgMed: number;
  aktiviteter?: Array<null | Pick<IAktivitet, "type" | "timer">[]>;
}[] = [
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Ferdig },
    ukerFraIDag: 14,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Ferdig },
    ukerFraIDag: 12,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Ferdig },
    ukerFraIDag: 10,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Innsendt },
    ukerFraIDag: 8,
    innsendtEtterTilOgMed: 1,
    aktiviteter: [
      ...new Array(3).fill(null),
      [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("5") }],
      ...new Array(3).fill(null),
      [{ type: AKTIVITET_TYPE.Syk }],
      [{ type: AKTIVITET_TYPE.Fravaer }],
      ...new Array(6).fill(null),
    ],
  },
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Innsendt },
    ukerFraIDag: 6,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: { status: RAPPORTERINGSPERIODE_STATUS.Innsendt },
    ukerFraIDag: 4,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      originalId: id,
      begrunnelseEndring: "Feil annet fravær",
      registrertArbeidssoker: true,
      kilde: {
        rolle: "Saksbehandler",
        ident: "123456789",
      },
    },
    ukerFraIDag: 2,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      registrertArbeidssoker: true,
    },
    ukerFraIDag: 2,
    innsendtEtterTilOgMed: 1,
  },
  {
    periode: {
      status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
    },
    ukerFraIDag: 0,
    innsendtEtterTilOgMed: 1,
  },
];

export function lagRapporteringsperioder(person: IPerson) {
  return perioder.map(({ periode, ukerFraIDag, innsendtEtterTilOgMed, aktiviteter }) => {
    const dagensDato = new Date();
    const startDato = subWeeks(dagensDato, Math.abs(ukerFraIDag));

    const { fraOgMed, tilOgMed } = lagPeriodeDatoFor(startDato);

    const dager = lagDager().map((dag, index) => {
      const dato = format(addDays(new Date(fraOgMed), index), "yyyy-MM-dd");

      return {
        ...dag,
        dato,
        aktiviteter:
          aktiviteter && aktiviteter[index]
            ? aktiviteter[index].map(
                ({ type, timer = "" }: Pick<IAktivitet, "type" | "timer">) => ({
                  id: uuidv7(),
                  type,
                  dato,
                  timer,
                })
              )
            : [],
      };
    });

    return lagRapporteringsperiode(
      {
        periode: { fraOgMed, tilOgMed },
        dager,
        mottattDato:
          periode.mottattDato ?? format(addDays(tilOgMed, innsendtEtterTilOgMed), "yyyy-MM-dd"),
        ...periode,
      },
      person
    );
  });
}
