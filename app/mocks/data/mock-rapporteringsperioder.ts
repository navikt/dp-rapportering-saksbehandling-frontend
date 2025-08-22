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

// Typedefinisjon for periodekonfigurasjon
type PeriodeConfig = {
  periode: Partial<IRapporteringsperiode>;
  ukerFraIDag: number;
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
        innsendtTidspunkt: "2024-02-13", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke06_07, // Uke 06-07 (nyest)
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
        innsendtTidspunkt: "2024-01-29", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke04_05, // Uke 04-05
      aktiviteter: lagArbeidUker("5"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-01-15", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke02_03, // Uke 02-03 (beregning feilet)
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
        innsendtTidspunkt: "2024-01-01", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke52_01, // Uke 52-01 (eldst, fra årsskiftet)
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
        innsendtTidspunkt: "2024-06-17", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 10,
    },
    {
      periode: {
        id: "periode-korrigert-bruker-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-06-29", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 8,
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
        innsendtTidspunkt: "2024-07-01", // 3 dager etter tilOgMed (korrigering sendt inn senere)
      },
      ukerFraIDag: 8,
      aktiviteter: lagArbeidUker("7.5"), // Korrigert: 7.5 timer/dag
    },
  ],

  [ScenarioType.KORRIGERT_AV_SAKSBEHANDLER]: [
    {
      periode: {
        id: "period-korrigert-saksbehandler-1",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-06-17", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 10,
    },
    {
      periode: {
        id: "period-korrigert-saksbehandler-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-06-29", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 8,
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
        innsendtTidspunkt: "2024-07-03", // 5 dager etter tilOgMed (saksbehandlerkorrigering)
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
    },
  ],

  [ScenarioType.SENDT_FOR_SENT]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-07-22", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 5,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2025-08-20", // Nylig dato - sen innlevering
        sisteFristForTrekk: "2025-08-19", // Dagen før innlevering - skal vises som sen
      },
      ukerFraIDag: 7,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-06-24", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 9,
    },
  ],

  [ScenarioType.IKKE_SENDT_INN]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Klar,
        registrertArbeidssoker: true,
        // Merk: Klar-status perioder har ikke innsendtTidspunkt ennå
      },
      ukerFraIDag: 2,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-08-05", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 4,
      aktiviteter: lagAlternerendeArbeidsUker("2"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-07-22", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 6,
      aktiviteter: lagArbeidUker("3"),
    },
  ],

  [ScenarioType.FLERE_BEREGNEDE]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-08-19", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 2,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-08-05", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 4,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-07-22", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 6,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-07-08", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 8,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        innsendtTidspunkt: "2024-06-24", // 1 dag etter tilOgMed (eksempeldato)
      },
      ukerFraIDag: 10,
    },
  ],

  [ScenarioType.FULL_DEMO]: [
    // 1. Ferdig beregnet, uke 11-12, Arbeidet 4 timer hver dag begge ukene
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: "2023-03-26", // Samme dag som tilOgMed (i tide)
      },
      aktiviteter: lagArbeidUker("4"),
      ukerFraIDag: 58, // uke 11-12
    },
    // 2. Ferdig beregnet, uke 13-14, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: "2023-04-09", // Samme dag som tilOgMed (i tide)
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
    },
    // 3. Ferdig beregnet, uke 15-16, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: "2023-04-23", // Samme dag som tilOgMed (i tide)
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
    },
    // 4. Ferdig beregnet, uke 17-18, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: "2023-05-07", // Samme dag som tilOgMed (i tide)
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
    },
    // 5. Ferdig beregnet, uke 19-20, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: "2023-05-21", // Samme dag som tilOgMed (i tide)
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
    },
    // 6. Ferdig beregnet, uke 21-22, Syk torsdag uke 22, Sendt inn en dag etter fristen
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: "2025-08-22", // Sen innlevering - etter sisteFristForTrekk
        sisteFristForTrekk: "2025-08-21", // Tilpasset frist - skal vises som rød tag
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
        innsendtTidspunkt: "2023-06-09", // 4 dager etter tilOgMed (korrigering)
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
      },
      ukerFraIDag: 46, // uke 23-24 (samme som over, korrigering)
    },
    // 8. Ferdig beregnet, uke 23-24, Ferie hele uke 23
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 9. Ferdig beregnet, uke 25-26, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 10. Ferdig beregnet, uke 27-28, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 11. Ferdig beregnet, uke 29-30, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 40, // uke 29-30
    },
    // 12. Ferdig beregnet, uke 31-32, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 13. Ferdig beregnet, uke 33-34, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 14. Ferdig beregnet, uke 35-36, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 34, // uke 35-36
    },
    // 15. Ferdig beregnet, uke 37-38, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 32, // uke 37-38
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
        innsendtTidspunkt: "2023-10-03", // 1 dag etter tilOgMed (saksbehandlerkorrigering)
        kilde: { rolle: "Saksbehandler" as const, ident: "Z993298" },
      },
      ukerFraIDag: 30, // uke 39-40 (samme som under, korrigering)
    },
    // 17. Ferdig beregnet, uke 39-40, Arbeid 4h onsdag, Syk torsdag-fredag uke 40
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 18. Ferdig beregnet, uke 41-42, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 28, // uke 41-42
    },
    // 19. Ferdig beregnet, uke 43-44, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 20. Ferdig beregnet, uke 45-46, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 24, // uke 45-46
    },
    // 21. Ferdig beregnet, uke 47-48, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 22. Ferdig beregnet, uke 49-50, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 20, // uke 49-50
    },
    // 23. Ferdig beregnet, uke 51-52, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 24. Ferdig beregnet, uke 1-2, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 25. Ferdig beregnet, uke 3-4, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 26. Ferdig beregnet, uke 5-6, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
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
    },
    // 27. Feilet, uke 7-8
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        innsendtTidspunkt: null, // Blir beregnet dynamisk basert på periode.tilOgMed
      },
      ukerFraIDag: 10, // uke 7-8
    },
    // 28. Opprettet, uke 9-10, ikke registrert arbeidssøker
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Klar,
        kanSendes: true,
        registrertArbeidssoker: false,
        kilde: { rolle: "Bruker" as const, ident: "1234567891011" },
        // Merk: Ikke sendt ennå, så ingen innsendtTidspunkt
      },
      ukerFraIDag: 8, // uke 9-10
    },
    // 29. Opprettet, uke 11-12, ingen data ennå
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Opprettet,
        kanSendes: false,
        // Merk: Ikke opprettet ennå, så ingen innsendtTidspunkt
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

  periodedefinisjon.forEach(({ periode, ukerFraIDag, aktiviteter }) => {
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
        innsendtTidspunkt:
          periode.innsendtTidspunkt === null ? tilOgMed : periode.innsendtTidspunkt,
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
