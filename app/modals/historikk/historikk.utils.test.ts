import { describe, expect, it } from "vitest";

import type { IArbeidssokerperiode, IRapporteringsperiode } from "~/utils/types";

import {
  transformArbeidssokerperioderToHistoryEvents,
  transformPerioderToHistoryEvents,
} from "./historikk.utils";

// Helper funksjon for å lage test-perioder med minimal konfigurasjon
function lagTestPeriode(overrides: Partial<IRapporteringsperiode>): IRapporteringsperiode {
  return {
    id: "1",
    ident: "12345678901",
    status: "TilUtfylling",
    type: "elektronisk",
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
    dager: [],
    kanSendes: false,
    kanEndres: false,
    kanSendesFra: "2024-01-15",
    sisteFristForTrekk: null,
    opprettetAv: "Arena",
    kilde: null,
    originalMeldekortId: null,
    innsendtTidspunkt: null,
    meldedato: null,
    registrertArbeidssoker: null,
    ...overrides,
  };
}

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
        startDato: "2024-01-15",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result).toHaveLength(1);
    expect(result[0].event).toBe("Registrert som arbeidssøker");
    expect(result[0].innsendtDato).toBe("15.01.2024");
    expect(result[0].time).toBe("--:--");
    expect(result[0].kategori).toBe("System");
  });

  it("skal transformere avsluttet periode til både registrering og avregistrering", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15",
        sluttDato: "2024-03-20",
        status: "Avsluttet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result).toHaveLength(2);

    // Første hendelse skal være registrering
    expect(result[0].event).toBe("Registrert som arbeidssøker");
    expect(result[0].innsendtDato).toBe("15.01.2024");

    // Andre hendelse skal være avregistrering
    expect(result[1].event).toBe("Avregistrert som arbeidssøker");
    expect(result[1].innsendtDato).toBe("20.03.2024");
  });

  it("skal håndtere flere perioder", () => {
    const perioder: IArbeidssokerperiode[] = [
      {
        periodeId: "1",
        ident: "12345678901",
        startDato: "2024-01-15",
        sluttDato: "2024-02-20",
        status: "Avsluttet",
      },
      {
        periodeId: "2",
        ident: "12345678901",
        startDato: "2024-03-01",
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
        startDato: "2024-01-15",
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
        startDato: "2024-01-15",
        sluttDato: "2024-03-20",
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
        startDato: "2024-01-15",
        sluttDato: null,
        status: "Startet",
      },
      {
        periodeId: "2",
        ident: "12345678901",
        startDato: "2024-03-01",
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
        startDato: "2024-12-25",
        sluttDato: null,
        status: "Startet",
      },
    ];

    const result = transformArbeidssokerperioderToHistoryEvents(perioder);

    expect(result[0].innsendtDato).toBe("25.12.2024");
  });
});
