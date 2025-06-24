import { addDays, differenceInWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { konverterTilISO8601Varighet } from "~/utils/dato.utils";
import { ScenarioType } from "~/utils/scenario.types";
import type { IAktivitet, IPerson, IRapporteringsperiode } from "~/utils/types";

import {
  lagAlternerendeArbeidsUker,
  lagArbeidUker,
  lagDager,
  lagPeriodeDatoFor,
  lagRapporteringsperiode,
} from "../mock.utils";

/**
 * Beregner antall uker fra uke 52 i fjor til i dag
 * Sikrer at vi alltid starter fra årsskiftet (uke 52-01)
 */
function beregnUkerFraAarsskifte(): {
  uke52_01: number;
  uke02_03: number;
  uke04_05: number;
  uke06_07: number;
} {
  const iDag = new Date();
  const innevarendeAar = iDag.getFullYear();

  // Finn første mandag i uke 52 i fjor (rundt 23. desember)
  const forrigeAar = innevarendeAar - 1;
  const uke52Start = new Date(forrigeAar, 11, 23); // 23. desember i fjor
  const forsteMandag52 = startOfWeek(uke52Start, { weekStartsOn: 1 });

  // Beregn uker fra første mandag i uke 52 til i dag
  const ukerFraUke52 = differenceInWeeks(iDag, forsteMandag52);

  return {
    uke52_01: ukerFraUke52, // Uke 52-01 (eldst)
    uke02_03: ukerFraUke52 - 2, // 2 uker senere (en meldekortperiode)
    uke04_05: ukerFraUke52 - 4, // 4 uker senere (to meldekortperioder)
    uke06_07: ukerFraUke52 - 6, // 6 uker senere (tre meldekortperioder)
  };
}

// Type definition for periode configuration
type PeriodeConfig = {
  periode: Partial<IRapporteringsperiode>;
  ukerFraIDag: number;
  innsendtEtterTilOgMed: number;
  aktiviteter?: Array<null | Pick<IAktivitet, "type" | "timer">[]>;
};

// Beregn uker fra årsskiftet en gang ved oppstart
const UKER_FRA_AARSSKIFTE = beregnUkerFraAarsskifte();

// Scenario data configurations
const SCENARIO_CONFIGS: Record<ScenarioType, PeriodeConfig[]> = {
  [ScenarioType.BEREGNING_FEILET]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 3150,
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke06_07, // Uke 06-07 (nyest)
      innsendtEtterTilOgMed: 1,
      aktiviteter: [
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("3") }],
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("7.5") }],
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("3") }],
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("7.5") }],
        null,
        null,
      ],
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 4250,
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke04_05, // Uke 04-05
      innsendtEtterTilOgMed: 1,
      aktiviteter: lagArbeidUker("5"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Feilet,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke02_03, // Uke 02-03 (beregning feilet)
      innsendtEtterTilOgMed: 1,
      aktiviteter: [
        [{ type: AKTIVITET_TYPE.Utdanning }], // Mandag
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("7.5") }], // Torsdag
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("7.5") }], // Torsdag uke 2
        null,
        null,
        null,
      ],
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke52_01, // Uke 52-01 (eldst, fra årsskiftet)
      innsendtEtterTilOgMed: 1,
      aktiviteter: [
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("3") }], // Mandag
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("7.5") }], // Torsdag
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    },
  ],

  [ScenarioType.KORRIGERT_AV_BRUKER]: [
    {
      periode: {
        id: "period-korrigert-bruker-1",
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 8750,
      },
      ukerFraIDag: 10,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "periode-korrigert-bruker-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 6500,
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "period-korrigert-bruker-2-correction",
        status: RAPPORTERINGSPERIODE_STATUS.Korrigert,
        registrertArbeidssoker: true,
        begrunnelseEndring: "Feil antall arbeidstimer. Hadde jobbet full tid",
        bruttoBelop: 0,
        originalId: "periode-korrigert-bruker-2-original",
        kilde: {
          rolle: "Bruker" as const,
          ident: "987654321",
        },
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 3, // Korrigert 3 dager senere
      aktiviteter: lagArbeidUker("7.5"), // Korrigert: 7.5 timer/dag
    },
  ],

  [ScenarioType.KORRIGERT_AV_SAKSBEHANDLER]: [
    {
      periode: {
        id: "period-korrigert-saksbehandler-1",
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 8750,
      },
      ukerFraIDag: 10,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "period-korrigert-saksbehandler-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 2800,
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "period-korrigert-saksbehandler-2-correction",
        status: RAPPORTERINGSPERIODE_STATUS.Korrigert,
        registrertArbeidssoker: true,
        begrunnelseEndring: "Feil antall arbeidstimer",
        bruttoBelop: 1200,
        originalId: "period-korrigert-saksbehandler-2-original",
        kilde: {
          rolle: "Saksbehandler" as const,
          ident: "Z123456",
        },
      },
      aktiviteter: [
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("2") }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: konverterTilISO8601Varighet("2") }],
        null,
        null,
        null,
      ],
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 5, // Saksbehandler korrigerte 5 dager senere
    },
  ],

  [ScenarioType.SENDT_FOR_SENT]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 6800,
      },
      ukerFraIDag: 5,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 6800,
      },
      ukerFraIDag: 7,
      innsendtEtterTilOgMed: 9, // 9 dager etter frist
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 6800,
      },
      ukerFraIDag: 9,
      innsendtEtterTilOgMed: 1,
    },
  ],

  [ScenarioType.IKKE_SENDT_INN]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 2,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 1800,
      },
      ukerFraIDag: 4,
      innsendtEtterTilOgMed: 1,
      aktiviteter: lagAlternerendeArbeidsUker("2"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 2700,
      },
      ukerFraIDag: 6,
      innsendtEtterTilOgMed: 1,
      aktiviteter: lagArbeidUker("3"),
    },
  ],

  [ScenarioType.FLERE_BEREGNEDE]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 4750,
      },
      ukerFraIDag: 2,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 4900,
      },
      ukerFraIDag: 4,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 4673,
      },
      ukerFraIDag: 6,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 4800,
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        bruttoBelop: 5200,
      },
      ukerFraIDag: 10,
      innsendtEtterTilOgMed: 1,
    },
  ],

  [ScenarioType.FULL_DEMO]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
      },
      aktiviteter: lagArbeidUker("4"), // 4 timer hver onsdag
      ukerFraIDag: 28, // tilsvarer uke 11-12
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
      },
      aktiviteter: lagArbeidUker("4"),
      ukerFraIDag: 26, // uke 13-14
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
      },
      aktiviteter: lagArbeidUker("4"),
      ukerFraIDag: 24, // uke 15-16
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 22,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 20,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
        begrunnelseEndring: "Sendt inn en dag etter fristen",
      },
      aktiviteter: [null, null, null, [{ type: AKTIVITET_TYPE.Syk }]],
      ukerFraIDag: 18,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Ferdig,
        registrertArbeidssoker: true,
      },
      aktiviteter: [
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
      ],
      ukerFraIDag: 16,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Korrigert,
        registrertArbeidssoker: true,
        begrunnelseEndring: "Glemt å føre aktiviteter.",
        kilde: {
          rolle: "Bruker" as const,
          ident: "1234567891011",
        },
      },
      ukerFraIDag: 16,
      innsendtEtterTilOgMed: 4,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Feilet,
        registrertArbeidssoker: false,
      },
      ukerFraIDag: 2, // uke 7-8
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 0, // uke 9-10
      innsendtEtterTilOgMed: 0,
    },
  ],
};

/**
 * Bygger komplette rapporteringsperioder fra periode-konfigurasjon
 */
function byggRapporteringsperioderFraKonfigurasjon(
  person: IPerson,
  periodedefinisjon: PeriodeConfig[]
): IRapporteringsperiode[] {
  const rapporteringsperioder: IRapporteringsperiode[] = [];

  periodedefinisjon.forEach(({ periode, ukerFraIDag, innsendtEtterTilOgMed, aktiviteter }) => {
    const dagensDato = new Date();
    const startDato = subWeeks(dagensDato, Math.abs(ukerFraIDag));
    const { fraOgMed, tilOgMed } = lagPeriodeDatoFor(startDato);

    const dager = lagDager().map((dag, index) => {
      const dato = format(addDays(new Date(fraOgMed), index), "yyyy-MM-dd");

      return {
        ...dag,
        dato,
        aktiviteter:
          aktiviteter?.[index]?.map(({ type, timer = "" }) => ({
            id: uuidv7(),
            type,
            dato,
            timer,
          })) ?? [],
      };
    });

    const rapporteringsperiode = lagRapporteringsperiode(
      {
        periode: { fraOgMed, tilOgMed },
        dager,
        mottattDato:
          periode.mottattDato ??
          format(addDays(new Date(tilOgMed), innsendtEtterTilOgMed), "yyyy-MM-dd"),
        ...periode,
      },
      person
    );

    rapporteringsperioder.push(rapporteringsperiode);
  });

  return rapporteringsperioder;
}

/**
 * Hent rapporteringsperioder for person basert på scenario-type
 */
export function hentRapporteringsperioderForScenario(
  person: IPerson,
  scenario: ScenarioType
): IRapporteringsperiode[] {
  const config = SCENARIO_CONFIGS[scenario];
  if (!config) {
    console.warn(`Unknown scenario: ${scenario}, falling back to BEREGNING_FEILET`);
    return byggRapporteringsperioderFraKonfigurasjon(
      person,
      SCENARIO_CONFIGS[ScenarioType.BEREGNING_FEILET]
    );
  }

  return byggRapporteringsperioderFraKonfigurasjon(person, config);
}
