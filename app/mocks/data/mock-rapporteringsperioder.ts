import { addDays, addWeeks, differenceInWeeks, format, startOfWeek, subWeeks } from "date-fns";
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
  innsendtEtterTilOgMed?: number;
  aktiviteter?: Array<null | Pick<IAktivitet, "type" | "timer">[]>;
};

// Beregn uker fra årsskiftet en gang ved oppstart
const UKER_FRA_AARSSKIFTE = beregnUkerFraAarsskifte();

// Scenario data configurations
const SCENARIO_CONFIGS: Record<ScenarioType, PeriodeConfig[]> = {
  [ScenarioType.BEREGNING_FEILET]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
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
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke04_05, // Uke 04-05
      innsendtEtterTilOgMed: 1,
      aktiviteter: lagArbeidUker("5"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
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
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 10,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "periode-korrigert-bruker-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "period-korrigert-bruker-2-correction",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Feil antall arbeidstimer. Hadde jobbet full tid",
        korrigering: {
          korrigererMeldekortId: "period-korrigert-bruker-2-original",
        },
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
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 10,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "period-korrigert-saksbehandler-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        id: "period-korrigert-saksbehandler-2-correction",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Feil antall arbeidstimer",
        korrigering: {
          korrigererMeldekortId: "period-korrigert-saksbehandler-2-original",
        },
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
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 5,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 7,
      innsendtEtterTilOgMed: 9, // 9 dager etter frist
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 9,
      innsendtEtterTilOgMed: 1,
    },
  ],

  [ScenarioType.IKKE_SENDT_INN]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Klar,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 2,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 4,
      innsendtEtterTilOgMed: 1,
      aktiviteter: lagAlternerendeArbeidsUker("2"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 6,
      innsendtEtterTilOgMed: 1,
      aktiviteter: lagArbeidUker("3"),
    },
  ],

  [ScenarioType.FLERE_BEREGNEDE]: [
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
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 4,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 6,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 8,
      innsendtEtterTilOgMed: 1,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
      },
      ukerFraIDag: 10,
      innsendtEtterTilOgMed: 1,
    },
  ],

  [ScenarioType.FULL_DEMO]: [
    // 1. Ferdig beregnet, uke 11-12, Arbeidet 4 timer hver dag begge ukene
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: lagArbeidUker("4"),
      ukerFraIDag: 58, // uke 11-12
      innsendtEtterTilOgMed: 0,
    },
    // 2. Ferdig beregnet, uke 13-14, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 56, // uke 13-14
      innsendtEtterTilOgMed: 0,
    },
    // 3. Ferdig beregnet, uke 15-16, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 54, // uke 15-16
      innsendtEtterTilOgMed: 0,
    },
    // 4. Ferdig beregnet, uke 17-18, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null, // mandag uke 1
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // tirsdag uke 1
        [{ type: AKTIVITET_TYPE.Utdanning }], // onsdag uke 1
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // torsdag uke 1
        null, // fredag uke 1
        null,
        null, // helg
        null, // mandag uke 2
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // tirsdag uke 2
        [{ type: AKTIVITET_TYPE.Utdanning }], // onsdag uke 2
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // torsdag uke 2
        [{ type: AKTIVITET_TYPE.Syk }], // fredag uke 2
        null,
        null, // helg
      ],
      ukerFraIDag: 52, // uke 17-18
      innsendtEtterTilOgMed: 0,
    },
    // 5. Ferdig beregnet, uke 19-20, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null, // mandag uke 1
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // tirsdag uke 1
        [{ type: AKTIVITET_TYPE.Utdanning }], // onsdag uke 1
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // torsdag uke 1
        null, // fredag uke 1
        null,
        null, // helg
        null, // mandag uke 2
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // tirsdag uke 2
        [{ type: AKTIVITET_TYPE.Utdanning }], // onsdag uke 2
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }], // torsdag uke 2
        [{ type: AKTIVITET_TYPE.Syk }], // fredag uke 2
        null,
        null, // helg
      ],
      ukerFraIDag: 50, // uke 19-20
      innsendtEtterTilOgMed: 0,
    },
    // 6. Ferdig beregnet, uke 21-22, Syk torsdag uke 22, Sendt inn en dag etter fristen
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
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
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
        null,
      ],
      ukerFraIDag: 48, // uke 21-22
      innsendtEtterTilOgMed: 1,
    },
    // 7. Korrigering Innsendt, uke 23-24, Glemt å føre aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Glemt å føre aktiviteter.",
        korrigering: {
          korrigererMeldekortId: "period-korrigert-bruker-2-original",
        },
        innsendtTidspunkt: null, // Vil bli satt automatisk basert på perioden
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 46, // uke 23-24 (samme som over, korrigering)
      innsendtEtterTilOgMed: 4,
    },
    // 8. Ferdig beregnet, uke 23-24, Ferie hele uke 23
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
        [{ type: AKTIVITET_TYPE.Fravaer }],
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
      ukerFraIDag: 46, // uke 23-24
      innsendtEtterTilOgMed: 0,
    },
    // 9. Ferdig beregnet, uke 25-26, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 44, // uke 25-26
      innsendtEtterTilOgMed: 0,
    },
    // 10. Ferdig beregnet, uke 27-28, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 42, // uke 27-28
      innsendtEtterTilOgMed: 0,
    },
    // 11. Ferdig beregnet, uke 29-30, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 40, // uke 29-30
      innsendtEtterTilOgMed: 0,
    },
    // 12. Ferdig beregnet, uke 31-32, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
      ],
      ukerFraIDag: 38, // uke 31-32
      innsendtEtterTilOgMed: 0,
    },
    // 13. Ferdig beregnet, uke 33-34, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
      ],
      ukerFraIDag: 36, // uke 33-34
      innsendtEtterTilOgMed: 0,
    },
    // 14. Ferdig beregnet, uke 35-36, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 34, // uke 35-36
      innsendtEtterTilOgMed: 0,
    },
    // 15. Ferdig beregnet, uke 37-38, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 32, // uke 37-38
      innsendtEtterTilOgMed: 0,
    },
    // 16. Korrigering Innsendt, uke 39-40, Glemt å føre aktiviteter, Saksbehandler
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Glemt å føre aktiviteter.",
        korrigering: {
          korrigererMeldekortId: "period-korrigert-bruker-2-original",
        },
        innsendtTidspunkt: null, // Vil bli satt automatisk basert på perioden
        kilde: { rolle: "Saksbehandler" as const, ident: "Z993298" },
      },
      ukerFraIDag: 30, // uke 39-40 (samme som under, korrigering)
      innsendtEtterTilOgMed: 1,
    },
    // 17. Ferdig beregnet, uke 39-40, Arbeid 4h onsdag, Syk torsdag-fredag uke 40
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        [{ type: AKTIVITET_TYPE.Syk }],
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
      ],
      ukerFraIDag: 30, // uke 39-40
      innsendtEtterTilOgMed: 0,
    },
    // 18. Ferdig beregnet, uke 41-42, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 28, // uke 41-42
      innsendtEtterTilOgMed: 0,
    },
    // 19. Ferdig beregnet, uke 43-44, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 26, // uke 43-44
      innsendtEtterTilOgMed: 0,
    },
    // 20. Ferdig beregnet, uke 45-46, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 24, // uke 45-46
      innsendtEtterTilOgMed: 0,
    },
    // 21. Ferdig beregnet, uke 47-48, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 22, // uke 47-48
      innsendtEtterTilOgMed: 0,
    },
    // 22. Ferdig beregnet, uke 49-50, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 20, // uke 49-50
      innsendtEtterTilOgMed: 0,
    },
    // 23. Ferdig beregnet, uke 51-52, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
      ],
      ukerFraIDag: 18, // uke 51-52
      innsendtEtterTilOgMed: 0,
    },
    // 24. Ferdig beregnet, uke 1-2, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
      ],
      ukerFraIDag: 16, // uke 1-2
      innsendtEtterTilOgMed: 0,
    },
    // 25. Ferdig beregnet, uke 3-4, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Utdanning }],
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT2H" }],
        [{ type: AKTIVITET_TYPE.Syk }],
        null,
        null,
      ],
      ukerFraIDag: 14, // uke 3-4
      innsendtEtterTilOgMed: 0,
    },
    // 26. Ferdig beregnet, uke 5-6, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      aktiviteter: [
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
        null,
        null,
        [{ type: AKTIVITET_TYPE.Arbeid, timer: "PT4H" }],
        null,
        null,
        null,
        null,
      ],
      ukerFraIDag: 12, // uke 5-6
      innsendtEtterTilOgMed: 0,
    },
    // 27. Feilet, uke 7-8
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 10, // uke 7-8
      innsendtEtterTilOgMed: 0,
    },
    // 28. Opprettet, uke 9-10, ikke registrert arbeidssøker
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Klar,
        status: RAPPORTERINGSPERIODE_STATUS.Opprettet,
        kanSendes: false,
        registrertArbeidssoker: false,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 8, // uke 9-10
    },
    // 29. Opprettet, uke 11-12, ingen data ennå
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Klar,
        kanSendes: false,
      },
      ukerFraIDag: 6, // uke 11-12
    },
  ],
};

/**
 * Bygger komplette rapporteringsperioder fra periode-konfigurasjon
 */
function byggRapporteringsperioderFraKonfigurasjon(
  person: IPerson,
  periodedefinisjon: PeriodeConfig[],
): IRapporteringsperiode[] {
  const rapporteringsperioder: IRapporteringsperiode[] = [];

  periodedefinisjon.forEach(({ periode, ukerFraIDag, innsendtEtterTilOgMed, aktiviteter }) => {
    const dagensDato = new Date();
    const startDato =
      ukerFraIDag >= 0
        ? subWeeks(dagensDato, ukerFraIDag)
        : addWeeks(dagensDato, Math.abs(ukerFraIDag));
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
        ...periode,
        periode: { fraOgMed, tilOgMed },
        dager,
        innsendtTidspunkt: periode.innsendtTidspunkt
          ? periode.innsendtTidspunkt
          : innsendtEtterTilOgMed !== undefined
            ? format(addDays(new Date(tilOgMed), innsendtEtterTilOgMed), "yyyy-MM-dd")
            : null,
      },
      person,
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
  scenario: ScenarioType,
): IRapporteringsperiode[] {
  const config = SCENARIO_CONFIGS[scenario];
  if (!config) {
    console.warn(`Unknown scenario: ${scenario}, falling back to BEREGNING_FEILET`);
    return byggRapporteringsperioderFraKonfigurasjon(
      person,
      SCENARIO_CONFIGS[ScenarioType.BEREGNING_FEILET],
    );
  }

  return byggRapporteringsperioderFraKonfigurasjon(person, config);
}
