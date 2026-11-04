import { describe, expect, it } from "vitest";

import { MELDEKORT_TYPE, OPPRETTET_AV, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IArbeidssokerperiode, IRapporteringsperiode } from "~/utils/types";

import {
  buildHistoryEvents,
  transformArbeidssokerperioderToHistoryEvents,
  transformPerioderToHistoryEvents,
} from "./historikk.utils";

// Helper funksjon for å lage test-perioder med minimal konfigurasjon
function lagTestPeriode(overrides: Partial<IRapporteringsperiode>): IRapporteringsperiode {
  return {
    id: "1",
    ident: "12345678901",
    status: RAPPORTERINGSPERIODE_STATUS.TilUtfylling,
    type: MELDEKORT_TYPE.ORDINAERT,
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [],
    kanSendes: false,
    kanEndres: false,
    kanSendesFra: "2024-01-15",
    sisteFristForTrekk: null,
    opprettetAv: OPPRETTET_AV.Arena,
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
    ...overrides,
  };
}

function lagArbeidssokerperiode(
  periodeId: string,
  startDato: string,
  sluttDato: string | null,
): IArbeidssokerperiode {
  return {
    periodeId,
    ident: "synthetic-ident",
    startDato,
    sluttDato,
    status: sluttDato ? "Avsluttet" : "Startet",
  };
}

describe("buildHistoryEvents", () => {
  it("skal korrigere avregistreringer ved samme-dags overlapp uten å endre kronologien ellers", () => {
    const arbeidssokerperioder = [
      lagArbeidssokerperiode("older", "2026-08-19T10:38:04.629Z", "2026-10-29T09:51:29.604Z"),
      lagArbeidssokerperiode("newer", "2026-10-29T09:51:29.370Z", null),
      lagArbeidssokerperiode("oldest", "2026-07-01T10:00:00.000Z", "2026-09-01T10:00:00.000Z"),
    ];
    const perioder = [
      lagTestPeriode({ innsendtTidspunkt: "2026-10-29T09:51:29.500Z" }),
      lagTestPeriode({ id: "2", innsendtTidspunkt: "2026-08-25T10:00:00.000Z" }),
    ];

    const events = buildHistoryEvents(arbeidssokerperioder, perioder);

    expect(
      events
        .filter((event) => event.kategori === "System")
        .map((event) => `${event.event}:${event.innsendtDato}:${event.time}`),
    ).toEqual([
      "Registrert som arbeidssøker:29.10.2026:09:51",
      "Avregistrert som arbeidssøker:29.10.2026:09:51",
      "Avregistrert som arbeidssøker:01.09.2026:10:00",
      "Registrert som arbeidssøker:19.08.2026:10:38",
      "Registrert som arbeidssøker:01.07.2026:10:00",
    ]);
    expect(events.map((event) => event.kategori)).toEqual([
      "Meldekort",
      "System",
      "System",
      "System",
      "Meldekort",
      "System",
      "System",
    ]);
    expect(events.map((event) => event.dato.toISOString())).toEqual([
      "2026-10-29T09:51:29.500Z",
      "2026-10-29T09:51:29.370Z",
      "2026-10-29T09:51:29.604Z",
      "2026-09-01T10:00:00.000Z",
      "2026-08-25T10:00:00.000Z",
      "2026-08-19T10:38:04.629Z",
      "2026-07-01T10:00:00.000Z",
    ]);
    expect(events[2].innsendtDato).toBe("29.10.2026");
    expect(events[2].time).toBe("09:51");
    expect(events[3].dato.getTime()).toBeGreaterThan(events[4].dato.getTime());
    expect(events[4].dato.getTime()).toBeGreaterThan(events[5].dato.getTime());
  });

  it("skal behandle like startdatoer stabilt og ikke endre inndata", () => {
    const arbeidssokerperioder = [
      lagArbeidssokerperiode("first", "2026-10-29T09:51:29.370Z", null),
      lagArbeidssokerperiode("second", "2026-10-29T09:51:29.370Z", null),
    ];
    const perioder = [lagTestPeriode({ innsendtTidspunkt: "2026-10-29T09:51:29.370Z" })];
    const originalArbeidssokerperioder = structuredClone(arbeidssokerperioder);
    const originalPerioder = structuredClone(perioder);

    const events = buildHistoryEvents(arbeidssokerperioder, perioder);

    expect(events.map((event) => event.kategori)).toEqual(["System", "System", "Meldekort"]);
    expect(events.slice(0, 2).every((event) => event.event === "Registrert som arbeidssøker")).toBe(
      true,
    );
    expect(arbeidssokerperioder).toEqual(originalArbeidssokerperioder);
    expect(perioder).toEqual(originalPerioder);
  });

  it("skal bevare kronologisk rekkefølge for perioder som ikke overlapper", () => {
    const events = buildHistoryEvents(
      [
        lagArbeidssokerperiode("newer", "2026-10-29T09:51:29.370Z", null),
        lagArbeidssokerperiode("older", "2026-08-19T10:38:04.629Z", "2026-08-25T10:00:00.000Z"),
      ],
      [],
    );

    expect(events.map((event) => event.event)).toEqual([
      "Registrert som arbeidssøker",
      "Avregistrert som arbeidssøker",
      "Registrert som arbeidssøker",
    ]);
    expect(events.map((event) => event.dato.toISOString())).toEqual([
      "2026-10-29T09:51:29.370Z",
      "2026-08-25T10:00:00.000Z",
      "2026-08-19T10:38:04.629Z",
    ]);
  });

  it("skal håndtere tomme inndata", () => {
    expect(buildHistoryEvents([], [])).toEqual([]);
    expect(buildHistoryEvents([], [lagTestPeriode({ innsendtTidspunkt: null })])).toEqual([]);
    expect(
      buildHistoryEvents([lagArbeidssokerperiode("active", "2026-10-29T09:51:29.370Z", null)], []),
    ).toHaveLength(1);
  });

  it("skal håndtere bare innsendte meldekort", () => {
    const events = buildHistoryEvents(
      [],
      [lagTestPeriode({ innsendtTidspunkt: "2026-10-29T09:51:29.370Z" })],
    );

    expect(events).toHaveLength(1);
    expect(events[0].kategori).toBe("Meldekort");
  });

  it("skal beholde stabil rekkefølge ved eksakt overleveringstidspunkt", () => {
    const events = buildHistoryEvents(
      [
        lagArbeidssokerperiode("older", "2026-10-29T08:00:00.000Z", "2026-10-29T09:00:00.000Z"),
        lagArbeidssokerperiode("newer", "2026-10-29T09:00:00.000Z", null),
      ],
      [lagTestPeriode({ innsendtTidspunkt: "2026-10-29T09:00:00.000Z" })],
    );

    expect(events.map((event) => event.event)).toEqual([
      "Registrert som arbeidssøker",
      "Avregistrert som arbeidssøker",
      expect.stringContaining("Meldekort uke"),
      "Registrert som arbeidssøker",
    ]);
    expect(events.map((event) => event.dato.toISOString())).toEqual([
      "2026-10-29T09:00:00.000Z",
      "2026-10-29T09:00:00.000Z",
      "2026-10-29T09:00:00.000Z",
      "2026-10-29T08:00:00.000Z",
    ]);
  });

  it("skal koble avregistreringer til riktig periode gjennom flere samme-dags overganger", () => {
    const arbeidssokerperioder = [
      lagArbeidssokerperiode("oldest", "2026-10-29T09:00:00.000Z", "2026-10-29T10:00:00.002Z"),
      lagArbeidssokerperiode("middle", "2026-10-29T10:00:00.001Z", "2026-10-29T10:00:00.004Z"),
      lagArbeidssokerperiode("newest", "2026-10-29T10:00:00.003Z", null),
    ];
    const originalArbeidssokerperioder = structuredClone(arbeidssokerperioder);

    const events = buildHistoryEvents(arbeidssokerperioder, []);

    expect(events.map((event) => event.dato.toISOString())).toEqual([
      "2026-10-29T10:00:00.003Z",
      "2026-10-29T10:00:00.004Z",
      "2026-10-29T10:00:00.001Z",
      "2026-10-29T10:00:00.002Z",
      "2026-10-29T09:00:00.000Z",
    ]);
    expect(events.every((event) => !("periodeId" in event) && !("erAvregistrering" in event))).toBe(
      true,
    );
    expect(arbeidssokerperioder).toEqual(originalArbeidssokerperioder);
  });
});

describe("transformPerioderToHistoryEvents", () => {
  it("skal transformere innsendte perioder til hendelser", () => {
    const perioder: IRapporteringsperiode[] = [
      lagTestPeriode({
        innsendtTidspunkt: "2024-01-15T10:30:00Z",
      }),
    ];

    const result = transformPerioderToHistoryEvents(perioder);

    expect(result).toHaveLength(1);
    expect(result[0].event).toContain("Meldekort uke");
    expect(result[0].event).toContain("2024");
    expect(result[0].kategori).toBe("Meldekort");
    expect(result[0].type).toBe("Elektronisk");
    expect(result[0].hendelseType).toBe("Innsendt");
    expect(result[0].time).toBe("10:30");
  });

  it("skal filtrere bort perioder uten innsendtTidspunkt", () => {
    const perioder: IRapporteringsperiode[] = [
      lagTestPeriode({
        innsendtTidspunkt: "2024-01-15T10:30:00Z",
      }),
      lagTestPeriode({
        id: "2",
        innsendtTidspunkt: null,
        kanSendes: true,
      }),
    ];

    const result = transformPerioderToHistoryEvents(perioder);

    expect(result).toHaveLength(1);
  });

  it("skal markere korrigerte meldekort", () => {
    const perioder: IRapporteringsperiode[] = [
      lagTestPeriode({
        innsendtTidspunkt: "2024-01-15T10:30:00Z",
        originalMeldekortId: "123",
      }),
    ];

    const result = transformPerioderToHistoryEvents(perioder);

    expect(result).toHaveLength(1);
    expect(result[0].hendelseType).toBe("Korrigert");
  });

  it("skal håndtere tom array", () => {
    const result = transformPerioderToHistoryEvents([]);

    expect(result).toEqual([]);
  });

  it("skal formatere ukenummer riktig", () => {
    const perioder: IRapporteringsperiode[] = [
      lagTestPeriode({
        innsendtTidspunkt: "2024-01-15T10:30:00Z",
      }),
    ];

    const result = transformPerioderToHistoryEvents(perioder);

    // Ukenummer skal formateres med "og" i stedet for "-"
    expect(result[0].event).toContain(" og ");
    expect(result[0].event).not.toContain(" - ");
  });

  it("skal sette erSendtForSent basert på frist", () => {
    const perioder: IRapporteringsperiode[] = [
      lagTestPeriode({
        innsendtTidspunkt: "2024-01-25T10:30:00Z",
        meldedato: "2024-01-25",
        sisteFristForTrekk: "2024-01-20", // Fristen var 20. januar, men sendt 25. januar
      }),
    ];

    const result = transformPerioderToHistoryEvents(perioder);

    expect(result).toHaveLength(1);
    expect(result[0].erSendtForSent).toBe(true);
  });
});

describe("transformArbeidssokerperioderToHistoryEvents", () => {
  it("skal transformere aktiv periode til registrering", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15T10:30:00Z",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result).toHaveLength(1);
    expect(result[0].event).toBe("Registrert som arbeidssøker");
    expect(result[0].innsendtDato).toBe("15.01.2024");
    expect(result[0].time).toBe("10:30");
    expect(result[0].kategori).toBe("System");
  });

  it("skal transformere avsluttet periode til både registrering og avregistrering", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15T09:00:00Z",
        sluttDato: "2024-03-20T14:30:00Z",
        status: "Avsluttet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result).toHaveLength(2);

    // Første hendelse skal være registrering
    expect(result[0].event).toBe("Registrert som arbeidssøker");
    expect(result[0].innsendtDato).toBe("15.01.2024");
    expect(result[0].time).toBe("09:00");

    // Andre hendelse skal være avregistrering
    expect(result[1].event).toBe("Avregistrert som arbeidssøker");
    expect(result[1].innsendtDato).toBe("20.03.2024");
    expect(result[1].time).toBe("14:30");
  });

  it("skal håndtere flere perioder", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15T08:00:00Z",
        sluttDato: "2024-02-20T16:00:00Z",
        status: "Avsluttet",
      },
      {
        periodeId: "2",
        ident: "12345678901",
        startDato: "2024-03-01T10:00:00Z",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result).toHaveLength(3);
    expect(result[0].event).toBe("Registrert som arbeidssøker");
    expect(result[0].innsendtDato).toBe("15.01.2024");
    expect(result[1].event).toBe("Avregistrert som arbeidssøker");
    expect(result[1].innsendtDato).toBe("20.02.2024");
    expect(result[2].event).toBe("Registrert som arbeidssøker");
    expect(result[2].innsendtDato).toBe("01.03.2024");
  });

  it("skal håndtere tom array", () => {
    const result = transformArbeidssokerperioderToHistoryEvents([]);

    expect(result).toEqual([]);
  });

  it("skal sette korrekt dato-objekt", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15T10:30:00Z",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result[0].dato).toBeInstanceOf(Date);
    expect(result[0].dato.toISOString()).toContain("2024-01-15");
  });

  it("skal identifisere avregistrering korrekt", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15T08:00:00Z",
        sluttDato: "2024-03-20T15:00:00Z",
        status: "Avsluttet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    // Avregistrering er når startDato === sluttDato i det transformerte objektet
    const registrering = result.find((h) => h.event === "Registrert som arbeidssøker");
    const avregistrering = result.find((h) => h.event === "Avregistrert som arbeidssøker");

    expect(registrering).toBeDefined();
    expect(avregistrering).toBeDefined();
    expect(registrering?.dato).not.toEqual(avregistrering?.dato);
  });

  it("skal håndtere kun aktive perioder", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15T08:00:00Z",
        sluttDato: null,
        status: "Startet",
      },
      {
        periodeId: "2",
        ident: "12345678901",
        startDato: "2024-03-01T10:00:00Z",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result).toHaveLength(2);
    expect(result.every((h) => h.event === "Registrert som arbeidssøker")).toBe(true);
  });

  it("skal formatere dato i norsk format", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-12-25T14:30:00Z",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result[0].innsendtDato).toBe("25.12.2024");
    expect(result[0].time).toBe("14:30");
  });
});
