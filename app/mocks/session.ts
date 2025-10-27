import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";

import type { IPerson, ISaksbehandler } from "~/utils/types";

import { hentArbeidssokerperioder } from "./data/mock-arbeidssokerperioder";
import { mockPersons } from "./data/mock-persons";
import { hentRapporteringsperioderForScenario } from "./data/mock-rapporteringsperioder";
import { mockSaksbehandler } from "./data/mock-saksbehandler";

export type Database = ReturnType<SessionRecord["createDatabase"]>;

type SessionMap = Map<string, Database>;

class SessionRecord {
  private sessions: SessionMap;

  constructor() {
    this.sessions = new Map();
  }

  public getDatabase(sessionId: string): ReturnType<SessionRecord["createDatabase"]> {
    if (!this.sessions.has(sessionId)) {
      const db = this.createDatabase();

      this.sessions.set(sessionId, db);

      const createdSaksbehandler = db.saksbehandlere.create(mockSaksbehandler) as ISaksbehandler;

      // Lag personer med perioder
      mockPersons.forEach((personData) => {
        const { scenario, ...person } = personData;
        const createdPerson = db.personer.create(person) as IPerson;

        // Generer perioder basert på personens scenario
        const periods = hentRapporteringsperioderForScenario(
          scenario,
          createdPerson,
          createdSaksbehandler,
        );

        periods.forEach((rapporteringsperiode) => {
          db.rapporteringsperioder.create(rapporteringsperiode);
        });

        const arbeidssokerperioder = hentArbeidssokerperioder(periods, createdPerson);
        arbeidssokerperioder.forEach((arbeidssokerperiode) => {
          db.arbeidssokerperioder.create(arbeidssokerperiode);
        });
      });
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return factory({
      rapporteringsperioder: {
        id: primaryKey(faker.string.uuid),
        ident: faker.string.alpha,
        status: faker.string.alpha,
        type: faker.string.numeric,
        periode: {
          fraOgMed: () => faker.date.recent().toISOString().split("T")[0],
          tilOgMed: () => faker.date.future().toISOString().split("T")[0],
        },
        dager: Array,
        kanSendes: faker.datatype.boolean,
        kanEndres: faker.datatype.boolean,
        kanSendesFra: () => faker.date.recent().toISOString().split("T")[0],
        sisteFristForTrekk: nullable(() => faker.date.recent().toISOString().split("T")[0]),
        opprettetAv: nullable(faker.string.alpha),
        originalMeldekortId: nullable(faker.string.uuid),
        kilde: nullable({
          rolle: nullable(faker.string.alpha),
          ident: nullable(faker.string.alpha),
        }),
        innsendtTidspunkt: nullable(() => {
          const date = faker.date.recent();
          // Legg til realistisk tidspunkt (8-18 UTC)
          date.setUTCHours(
            faker.number.int({ min: 8, max: 18 }),
            faker.number.int({ min: 0, max: 59 }),
            0,
            0,
          );
          return date.toISOString();
        }),
        meldedato: nullable(() => faker.date.recent({ days: 30 }).toISOString().split("T")[0]),
        registrertArbeidssoker: nullable(faker.datatype.boolean),
        begrunnelse: nullable(faker.string.sample),
      },
      personer: {
        ident: primaryKey(faker.string.alpha),
        id: faker.string.alpha,
        etternavn: faker.string.alpha,
        fornavn: faker.string.alpha,
        mellomnavn: faker.string.alpha,
        statsborgerskap: faker.string.alpha,
        ansvarligSystem: () => faker.helpers.arrayElement(["ARENA", "DP"]),
        fodselsdato: nullable(() => faker.date.past().toISOString()),
        kjonn: nullable(() => faker.helpers.arrayElement(["MANN", "KVINNE", "UKJENT"])),
      },
      saksbehandlere: {
        onPremisesSamAccountName: primaryKey(faker.string.alphanumeric),
        displayName: faker.string.alpha,
        givenName: faker.string.alpha,
        mail: () => faker.internet.email(),
      },
      arbeidssokerperioder: {
        periodeId: primaryKey(faker.string.uuid),
        ident: faker.string.alpha,
        startDato: () => faker.date.past().toISOString().split("T")[0],
        sluttDato: nullable(() => faker.date.recent().toISOString().split("T")[0]),
        status: () => faker.helpers.arrayElement(["Startet", "Avsluttet"]),
      },
    });
  }
}

export const sessionRecord = new SessionRecord();

export function getSessionId(request: Request) {
  const cookieString = request.headers.get("Cookie") || "";
  const cookies = cookieString.split(";").map((cookie) => cookie.trim());

  const sessionCookie = cookies.find((cookie) => cookie.startsWith("sessionId="));

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }
  return null;
}

export function hasSession(request: Request) {
  return request.headers.get("Cookie")?.includes("sessionId");
}
