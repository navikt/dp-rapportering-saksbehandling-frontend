import { addDays, format, startOfWeek } from "date-fns";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  MELDEKORT_TYPE,
  OPPRETTET_AV,
  RAPPORTERINGSPERIODE_STATUS,
  ROLLE,
} from "~/utils/constants";
import type { IKilde, IRapporteringsperiode } from "~/utils/types";

import { withDb } from "./db";
import type { Database } from "./session";

// Mock database for testing
function createMockDatabase() {
  const store: IRapporteringsperiode[] = [];

  const mockDb = {
    rapporteringsperioder: {
      findMany: vi.fn(() => {
        return store;
      }),
      findFirst: vi.fn(() => {
        return store[0];
      }),
      create: vi.fn((data: IRapporteringsperiode) => {
        store.push(data);
        return data;
      }),
      update: vi.fn(() => {
        return Promise.resolve();
      }),
    },
    personer: {
      findFirst: vi.fn(() => ({
        id: "12345678901",
        ident: "12345678901",
        fornavn: "Test",
        etternavn: "Testesen",
        ansvarligSystem: "Dagpenger",
      })),
    },
    saksbehandlere: {
      findFirst: vi.fn(),
    },
    arbeidssokerperioder: {
      findMany: vi.fn(() => []),
    },
    behandlingsresultat: {
      findMany: vi.fn(() => []),
    },
    _store: store, // For testing purposes
  };

  return mockDb as unknown as Database;
}

describe("beregnAntallMeldekort", () => {
  it("skal returnere 0 når tilDato er før fraDato", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const antall = db.beregnAntallMeldekort("2024-02-01", "2024-01-01");

    expect(antall).toBe(0);
  });

  it("skal returnere 0 når perioden er kortere enn 14 dager", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const antall = db.beregnAntallMeldekort("2024-01-01", "2024-01-10");

    expect(antall).toBe(0);
  });

  it("skal returnere 1 når perioden er nøyaktig 14 dager", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    // Finn første mandag
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const antall = db.beregnAntallMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
    );

    expect(antall).toBe(1);
  });

  it("skal returnere 2 når perioden er 28 dager", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27);

    const antall = db.beregnAntallMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
    );

    expect(antall).toBe(2);
  });

  it("skal returnere riktig antall for en hel måned", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    // Januar 2024: 31 dager
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = new Date("2024-01-31");

    const antall = db.beregnAntallMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
    );

    // Starter på første mandag i januar (1. jan 2024), kan få inn 2 hele 2-ukers perioder
    expect(antall).toBe(2);
  });

  it("skal ikke telle ufullstendige perioder på slutten", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    // 20 dager = 1 full periode + 6 dager (ikke nok for en til)
    const sluttDato = addDays(startDato, 19);

    const antall = db.beregnAntallMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
    );

    expect(antall).toBe(1);
  });

  it("skal ikke telle perioder før fraDato når fraDato ikke er mandag", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    // fraDato er onsdag 3. januar 2024
    // første mandag på eller etter er mandag 8. januar
    // Med 14 dagers periode (8-21 jan) får vi bare 1 periode innen 25. januar
    const antall = db.beregnAntallMeldekort("2024-01-03", "2024-01-25");

    expect(antall).toBe(1); // Kun perioden 8-21 januar
  });

  it("skal håndtere ugyldige datoer", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const antall = db.beregnAntallMeldekort("ugyldig-dato", "2024-01-31");

    expect(antall).toBe(0);
  });
});

describe("beregnAntallOpprettbareMeldekort", () => {
  it("skal returnere samme tall som beregnAntallMeldekort når ingen perioder finnes", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27);

    const antallTotalt = db.beregnAntallMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
    );
    const antallOpprettbare = db.beregnAntallOpprettbareMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
    );

    expect(antallOpprettbare).toBe(antallTotalt);
    expect(antallOpprettbare).toBe(2);
  });

  it("skal trekke fra eksisterende perioder", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27);

    // Opprett først én periode
    const testKilde: IKilde = {
      rolle: ROLLE.Saksbehandler,
      ident: "Z123456",
    };
    db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(addDays(startDato, 13), "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    // Nå skal det bare være 1 opprettbar periode igjen
    const antallOpprettbare = db.beregnAntallOpprettbareMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
    );

    expect(antallOpprettbare).toBe(1);
  });

  it("skal returnere 0 når alle perioder allerede eksisterer", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27);

    const testKilde: IKilde = {
      rolle: ROLLE.Saksbehandler,
      ident: "Z123456",
    };

    // Opprett alle perioder først
    db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    // Nå skal det ikke være noen opprettbare perioder igjen
    const antallOpprettbare = db.beregnAntallOpprettbareMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
    );

    expect(antallOpprettbare).toBe(0);
  });

  it("skal bare telle perioder for riktig person", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27);

    const testKilde: IKilde = {
      rolle: ROLLE.Saksbehandler,
      ident: "Z123456",
    };

    // Opprett perioder for person A
    db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "11111111111",
      testKilde,
    );

    // Person B skal fortsatt kunne opprette alle perioder
    const antallOpprettbare = db.beregnAntallOpprettbareMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "22222222222",
    );

    expect(antallOpprettbare).toBe(2);
  });

  it("skal håndtere ugyldige datoer", () => {
    const mockDb = createMockDatabase();
    const db = withDb(mockDb);

    const antall = db.beregnAntallOpprettbareMeldekort("ugyldig-dato", "2024-01-31", "12345678901");

    expect(antall).toBe(0);
  });
});

describe("opprettManueltMeldekort", () => {
  let mockDb: ReturnType<typeof createMockDatabase>;
  let db: ReturnType<typeof withDb>;
  let testKilde: IKilde;

  beforeEach(() => {
    mockDb = createMockDatabase();
    db = withDb(mockDb);
    testKilde = {
      rolle: ROLLE.Saksbehandler,
      ident: "Z123456",
    };
  });

  it("skal opprette riktig antall meldekort", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27); // 2 perioder

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet).toHaveLength(2);
    expect(db.hentAlleRapporteringsperioder()).toHaveLength(2);
  });

  it("skal sette riktige datoer for hver periode", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].periode.fraOgMed).toBe(format(startDato, "yyyy-MM-dd"));
    expect(opprettet[0].periode.tilOgMed).toBe(format(sluttDato, "yyyy-MM-dd"));
  });

  it("skal sette opprettetManueltAvSaksbehandler til true", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].opprettetManueltAvSaksbehandler).toBe(true);
  });

  it("skal sette riktig kilde", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].kilde).toEqual(testKilde);
  });

  it("skal sette status til TilUtfylling", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].status).toBe(RAPPORTERINGSPERIODE_STATUS.TilUtfylling);
  });

  it("skal sette type til ETTERREGISTRERT for perioder i fortiden", () => {
    // Lag en periode som er 1 måned tilbake
    const iDag = new Date();
    const startDato = startOfWeek(addDays(iDag, -45), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].type).toBe(MELDEKORT_TYPE.ETTERREGISTRERT);
  });

  it("skal sette type til ORDINAERT for fremtidige perioder", () => {
    // Lag en periode som er i fremtiden
    const iDag = new Date();
    const startDato = startOfWeek(addDays(iDag, 7), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].type).toBe(MELDEKORT_TYPE.ORDINAERT);
  });

  it("skal lage 14 dager med tomme aktiviteter", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].dager).toHaveLength(14);
    expect(opprettet[0].dager[0].aktiviteter).toEqual([]);
    expect(opprettet[0].dager[0].dagIndex).toBe(0);
    expect(opprettet[0].dager[13].dagIndex).toBe(13);
  });

  it("skal hoppe over duplikate perioder", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    // Opprett første gang
    const forste = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(forste).toHaveLength(1);
    expect(db.hentAlleRapporteringsperioder()).toHaveLength(1);

    // Prøv å opprette igjen med samme datoer
    const andre = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(andre).toHaveLength(0);
    expect(db.hentAlleRapporteringsperioder()).toHaveLength(1); // Ingen nye meldekort
  });

  it("skal opprette meldekort for forskjellige personer selv med samme periode", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const forste = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "11111111111",
      testKilde,
    );

    const andre = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "22222222222",
      testKilde,
    );

    expect(forste).toHaveLength(1);
    expect(andre).toHaveLength(1);
    expect(db.hentAlleRapporteringsperioder()).toHaveLength(2);
    expect(forste[0].ident).toBe("11111111111");
    expect(andre[0].ident).toBe("22222222222");
  });

  it("skal sette kanSendes til true", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].kanSendes).toBe(true);
  });

  it("skal sette kanEndres til true", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].kanEndres).toBe(true);
  });

  it("skal generere unike ID-er for hver periode", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 27); // 2 perioder

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].id).not.toBe(opprettet[1].id);
    expect(opprettet[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("skal sette opprettetAv til Dagpenger", () => {
    const startDato = startOfWeek(new Date("2024-01-01"), { weekStartsOn: 1 });
    const sluttDato = addDays(startDato, 13);

    const opprettet = db.opprettManueltMeldekort(
      format(startDato, "yyyy-MM-dd"),
      format(sluttDato, "yyyy-MM-dd"),
      "12345678901",
      testKilde,
    );

    expect(opprettet[0].opprettetAv).toBe(OPPRETTET_AV.Dagpenger);
  });

  it("skal ikke opprette meldekort før fraDato når fraDato ikke er mandag", () => {
    // fraDato er onsdag 3. januar 2024
    // første mandag på eller etter er mandag 8. januar
    const opprettet = db.opprettManueltMeldekort(
      "2024-01-03",
      "2024-01-21",
      "12345678901",
      testKilde,
    );

    expect(opprettet).toHaveLength(1);
    // Første periode skal starte på mandag 8. januar, ikke 3. januar
    expect(opprettet[0].periode.fraOgMed).toBe("2024-01-08");
    expect(opprettet[0].periode.tilOgMed).toBe("2024-01-21");
  });

  it("skal håndtere ugyldige datoer", () => {
    const opprettet = db.opprettManueltMeldekort(
      "ugyldig-dato",
      "2024-01-31",
      "12345678901",
      testKilde,
    );

    expect(opprettet).toHaveLength(0);
  });
});
