import { addDays, addWeeks, differenceInWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { konverterTilISO8601Varighet } from "~/utils/dato.utils";
import { ScenarioType } from "~/utils/scenario.types";
import type { IAktivitet, IPerson, IRapporteringsperiode, ISaksbehandler } from "~/utils/types";

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
  meldedatoRelativTilPeriodeSlutt?: number | null;
  innsendtTidspunktRelativTilPeriodeSlutt?: number | null;
  aktiviteter?: Array<null | Pick<IAktivitet, "type" | "timer">[]>;
  rolle?: "Bruker" | "Saksbehandler";
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
        kanSendes: false,
        kanEndres: true,
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
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: UKER_FRA_AARSSKIFTE.uke04_05, // Uke 04-05
      aktiviteter: lagArbeidUker("5"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
        kanSendes: false,
        kanEndres: true,
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
        id: "periode-korrigert-bruker-1",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 10,
    },
    {
      periode: {
        id: "periode-korrigert-bruker-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: false, // Kan ikke endres fordi det finnes en korrigering av denne
      },
      ukerFraIDag: 8,
    },
    {
      periode: {
        id: "periode-korrigert-bruker-2-correction",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Feil antall arbeidstimer. Hadde jobbet full tid",
        originalMeldekortId: "periode-korrigert-bruker-2-original",
        kilde: {
          rolle: "Bruker" as const,
          ident: "987654321",
        },
        kanSendes: false,
        kanEndres: true, // Korrigering kan endres
      },
      meldedatoRelativTilPeriodeSlutt: 1,
      innsendtTidspunktRelativTilPeriodeSlutt: 3,
      ukerFraIDag: 8,
      aktiviteter: lagArbeidUker("7.5"), // Korrigert: 7.5 timer/dag
    },
  ],

  [ScenarioType.KORRIGERT_AV_SAKSBEHANDLER]: [
    {
      periode: {
        id: "periode-korrigert-saksbehandler-1",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 10,
    },
    {
      periode: {
        id: "periode-korrigert-saksbehandler-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: false, // Kan ikke endres fordi det finnes en korrigering av denne
      },
      ukerFraIDag: 8,
    },
    {
      periode: {
        id: "periode-korrigert-saksbehandler-2-correction",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Feil antall arbeidstimer",
        originalMeldekortId: "periode-korrigert-saksbehandler-2-original",
        kilde: {
          rolle: "Saksbehandler" as const,
          ident: "Z123456",
        },
        kanSendes: false,
        kanEndres: true,
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
      meldedatoRelativTilPeriodeSlutt: 1,
      innsendtTidspunktRelativTilPeriodeSlutt: 5,
      ukerFraIDag: 8,
    },
  ],

  [ScenarioType.SENDT_FOR_SENT]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 5,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      innsendtTidspunktRelativTilPeriodeSlutt: 9, // 1 dag etter sisteFristForTrekk
      ukerFraIDag: 7,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 9,
    },
  ],

  [ScenarioType.IKKE_SENDT_INN]: [
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        registrertArbeidssoker: true,
        kanSendes: true,
        kanEndres: false, // Kan ikke endres fordi den ikke er innsendt ennå
      },
      ukerFraIDag: 2,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 4,
      aktiviteter: lagAlternerendeArbeidsUker("2"),
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 2,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 4,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 6,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 8,
    },
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 10,
    },
  ],

  [ScenarioType.FULL_DEMO]: [
    // 1. Ferdig beregnet
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      aktiviteter: lagArbeidUker("4"),
      ukerFraIDag: 58,
    },
    // 2. Ferdig beregnet
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 56,
    },
    // 3. Ferdig beregnet, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      innsendtTidspunktRelativTilPeriodeSlutt: 6,
      ukerFraIDag: 54,
    },
    // 4. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      innsendtTidspunktRelativTilPeriodeSlutt: 9, // 1 dag etter sisteFrist
      ukerFraIDag: 52,
    },
    // 5. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      innsendtTidspunktRelativTilPeriodeSlutt: 0,
      ukerFraIDag: 50,
    },
    // 6. Ferdig beregnet, Syk torsdag uke 22, Sendt inn en dag etter fristen
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      innsendtTidspunktRelativTilPeriodeSlutt: 5,
      ukerFraIDag: 48,
    },
    // 7. Korrigering Innsendt, Glemt å føre aktiviteter
    {
      periode: {
        id: "periode-korrigert-av-saksbehandler-1-korrigert-1",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Glemt å føre aktiviteter.",
        originalMeldekortId: "periode-korrigert-av-saksbehandler-1-original",
        kanSendes: false,
        kanEndres: true,
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
      meldedatoRelativTilPeriodeSlutt: 1,
      innsendtTidspunktRelativTilPeriodeSlutt: 4,
      rolle: "Saksbehandler",
      ukerFraIDag: 46, // samme som under, korrigering
    },
    // 8. Ferdig beregnet
    {
      periode: {
        id: "periode-korrigert-av-saksbehandler-1-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 46,
    },
    // 9. Ferdig beregnet, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 44,
    },
    // 10. Ferdig beregnet, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 42,
    },
    // 11. Ferdig beregnet, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
        begrunnelse: "Bruker var ikke i stand til å sende meldekort",
      },
      ukerFraIDag: 40,
      meldedatoRelativTilPeriodeSlutt: 0,
      innsendtTidspunktRelativTilPeriodeSlutt: 10,
      rolle: "Saksbehandler",
    },
    // 12. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 38,
    },
    // 13. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 36,
    },
    // 14. Ferdig beregnet,  ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 34,
    },
    // 15. Ferdig beregnet,  ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 32,
    },
    // 16. Korrigering Innsendt, Glemt å føre aktiviteter, Saksbehandler
    {
      periode: {
        id: "periode-korrigert-av-bruker-2-korrigert-1",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        begrunnelse: "Glemt å føre aktiviteter.",
        originalMeldekortId: "periode-korrigert-av-bruker-2-original",
        kilde: { rolle: "Saksbehandler" as const, ident: "Z993298" },
        kanSendes: false,
        kanEndres: true,
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
      meldedatoRelativTilPeriodeSlutt: 1,
      innsendtTidspunktRelativTilPeriodeSlutt: 3,
      ukerFraIDag: 30, // samme som under, korrigering
    },
    // 17. Ferdig beregnet, Arbeid 4h onsdag, Syk torsdag-fredag uke 40
    {
      periode: {
        id: "periode-korrigert-av-bruker-2-original",
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 30,
    },
    // 18. Ferdig beregnet, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 28,
    },
    // 19. Ferdig beregnet,  Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 26,
    },
    // 20. Ferdig beregnet, ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 24,
    },
    // 21. Ferdig beregnet,  Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 22,
    },
    // 22. Ferdig beregnet,  ingen aktiviteter
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 20,
    },
    // 23. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 18,
    },
    // 24. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 16,
    },
    // 25. Ferdig beregnet, Utdanning onsdag, Jobb tirsdag/torsdag 2h, Syk fredag uke 2
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 14,
    },
    // 26. Ferdig beregnet, Arbeid 4 timer hver onsdag
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
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
      ukerFraIDag: 12,
    },
    // 27.
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
        registrertArbeidssoker: true,
        kanSendes: false,
        kanEndres: true,
      },
      ukerFraIDag: 10,
    },
    // 28. Opprettet, ikke registrert arbeidssøker
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        kanSendes: true,
        kanEndres: false, // Kan ikke endres fordi den ikke er innsendt ennå
        registrertArbeidssoker: false,
        // Merk: Ikke sendt ennå, så ingen innsendtTidspunkt
      },
      ukerFraIDag: 8,
    },
    // 29. Opprettet, ingen data ennå
    {
      periode: {
        status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
        kanSendes: false,
        kanEndres: false, // Kan ikke endres fordi den ikke er innsendt ennå
        // Merk: Ikke opprettet ennå, så ingen innsendtTidspunkt
      },
      ukerFraIDag: 6,
    },
  ],
};

// TODO: Legg til klokkeslett på innsendtTidspunkt
// Default meldedato og innsendtTidspunkt er 1 dag etter tilOgMed
function lagMeldedatoer(
  meldekort: Partial<IRapporteringsperiode>,
  tilOgMed: string,
  meldedatoRelativTilPeriodeSlutt?: number | null,
  innsendtTidspunktRelativTilPeriodeSlutt?: number | null,
): {
  meldedato: string | null;
  innsendtTidspunkt: string | null;
} {
  let { meldedato, innsendtTidspunkt } = meldekort;
  const { status } = meldekort;

  // Hvis meldekort ikke er innsendt, skal meldedato og innsendtTidspunkt være null
  if (status === RAPPORTERINGSPERIODE_STATUS.TilUtfylling) {
    return {
      meldedato: null,
      innsendtTidspunkt: null,
    };
  }

  if (
    !meldedato &&
    meldedatoRelativTilPeriodeSlutt !== null &&
    meldedatoRelativTilPeriodeSlutt !== undefined
  ) {
    meldedato = format(addDays(new Date(tilOgMed), meldedatoRelativTilPeriodeSlutt), "yyyy-MM-dd");
  }

  if (
    !innsendtTidspunkt &&
    innsendtTidspunktRelativTilPeriodeSlutt !== null &&
    innsendtTidspunktRelativTilPeriodeSlutt !== undefined
  ) {
    innsendtTidspunkt = addDays(
      new Date(tilOgMed),
      innsendtTidspunktRelativTilPeriodeSlutt,
    ).toISOString();
  }

  // For innsendte meldekort uten eksplisitt dato, sett default
  if (!meldedato && !innsendtTidspunkt && tilOgMed) {
    return {
      meldedato: format(addDays(tilOgMed, 1), "yyyy-MM-dd"),
      innsendtTidspunkt: new Date(addDays(tilOgMed, 1)).toISOString(),
    };
  }

  if (meldedato && !innsendtTidspunkt) {
    return { meldedato, innsendtTidspunkt: new Date(meldedato).toISOString() };
  }

  if (!meldedato && innsendtTidspunkt) {
    return {
      meldedato: format(innsendtTidspunkt, "yyyy-MM-dd"),
      innsendtTidspunkt: innsendtTidspunkt,
    };
  }

  return {
    meldedato: meldedato ?? null,
    innsendtTidspunkt: innsendtTidspunkt ?? null,
  };
}

/**
 * Bygger komplette rapporteringsperioder fra periode-konfigurasjon
 */
function byggRapporteringsperioderFraKonfigurasjon(
  periodedeConfigs: PeriodeConfig[],
  person: IPerson,
  saksbehandler: ISaksbehandler,
): IRapporteringsperiode[] {
  const rapporteringsperioder: IRapporteringsperiode[] = [];

  periodedeConfigs.forEach(
    ({
      periode,
      ukerFraIDag,
      aktiviteter,
      meldedatoRelativTilPeriodeSlutt,
      innsendtTidspunktRelativTilPeriodeSlutt,
      rolle = "Bruker",
    }) => {
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
          kilde: {
            rolle,
            ident: rolle === "Bruker" ? person.ident : saksbehandler.onPremisesSamAccountName,
          },
          dager,
          ...lagMeldedatoer(
            periode,
            tilOgMed,
            meldedatoRelativTilPeriodeSlutt,
            innsendtTidspunktRelativTilPeriodeSlutt,
          ),
        },
        person,
      );

      rapporteringsperioder.push(rapporteringsperiode);
    },
  );

  return rapporteringsperioder;
}

/**
 * Hent rapporteringsperioder for person basert på scenario-type
 */
export function hentRapporteringsperioderForScenario(
  scenario: ScenarioType,
  person: IPerson,
  saksbehandler: ISaksbehandler,
): IRapporteringsperiode[] {
  const config = SCENARIO_CONFIGS[scenario];
  if (!config) {
    console.warn(`Unknown scenario: ${scenario}, falling back to BEREGNING_FEILET`);
    return byggRapporteringsperioderFraKonfigurasjon(
      SCENARIO_CONFIGS[ScenarioType.BEREGNING_FEILET],
      person,
      saksbehandler,
    );
  }

  return byggRapporteringsperioderFraKonfigurasjon(config, person, saksbehandler);
}
