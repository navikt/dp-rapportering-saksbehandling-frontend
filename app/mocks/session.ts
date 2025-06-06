import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";

import type { IPerson } from "~/utils/types";

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

      db.saksbehandlere.create(mockSaksbehandler);

      // Lag personer med perioder
      mockPersons.forEach((personData) => {
        const { scenario, ...person } = personData;
        const createdPerson = db.personer.create(person) as IPerson;

        // Generer perioder basert på personens scenario
        const periods = hentRapporteringsperioderForScenario(createdPerson, scenario);
        periods.forEach((rapporteringsperiode) => {
          db.rapporteringsperioder.create(rapporteringsperiode);
        });
      });
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return factory({
      rapporteringsperioder: {
        id: primaryKey(faker.string.numeric),
        ident: faker.string.alpha,
        type: faker.string.numeric,
        periode: {
          fraOgMed: () => faker.date.recent().toISOString(),
          tilOgMed: () => faker.date.future().toISOString(),
        },
        dager: Array,
        sisteFristForTrekk: nullable(() => faker.date.recent().toISOString()),
        kanSendesFra: () => faker.date.recent().toISOString(),
        kanSendes: faker.datatype.boolean,
        kanEndres: faker.datatype.boolean,
        bruttoBelop: nullable(faker.number.float),
        begrunnelseEndring: nullable(faker.string.sample),
        status: faker.string.alpha,
        mottattDato: nullable(() => faker.date.recent().toISOString()),
        registrertArbeidssoker: nullable(faker.datatype.boolean),
        originalId: nullable(faker.string.numeric),
        html: nullable(faker.string.alpha),
        rapporteringstype: nullable(faker.string.alpha),
        kilde: nullable({
          rolle: nullable(faker.string.alpha),
          ident: nullable(faker.string.alpha),
        }),
      },
      personer: {
        ident: primaryKey(faker.string.alpha),
        alder: faker.number.int,
        etternavn: faker.string.alpha,
        fodselsdato: faker.string.alphanumeric,
        fornavn: faker.string.alpha,
        kjonn: faker.string.alpha,
        mellomnavn: faker.string.alpha,
        sikkerhetstiltak: Array,
        statsborgerskap: faker.string.alpha,
      },
      saksbehandlere: {
        onPremisesSamAccountName: primaryKey(faker.string.alphanumeric),
        displayName: faker.string.alpha,
        givenName: faker.string.alpha,
        mail: () => faker.internet.email(),
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
