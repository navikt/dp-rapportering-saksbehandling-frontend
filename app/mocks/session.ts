import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";

import type { IPerson, ISaksbehandler } from "~/utils/types";

import { hentMeldekortForScenario } from "./data/mock-meldekort";
import { mockPersons } from "./data/mock-personer";
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

        // Generer meldekort basert på personens scenario
        const meldekortListe = hentMeldekortForScenario(
          scenario,
          createdPerson,
          createdSaksbehandler,
        );

        meldekortListe.forEach((meldekort) => {
          db.meldekort.create(meldekort);
        });
      });
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return factory({
      meldekort: {
        id: primaryKey(faker.string.numeric),
        personId: faker.string.alpha,
        ident: faker.string.alpha,
        status: faker.string.alpha,
        type: faker.string.numeric,
        periode: {
          fraOgMed: () => faker.date.recent().toISOString(),
          tilOgMed: () => faker.date.future().toISOString(),
        },
        dager: Array,
        kanSendes: faker.datatype.boolean,
        kanEndres: faker.datatype.boolean,
        kanSendesFra: () => faker.date.recent().toISOString(),
        sisteFristForTrekk: nullable(() => faker.date.recent().toISOString()),
        opprettetAv: nullable(faker.string.alpha),
        originalMeldekortId: nullable(faker.string.numeric),
        kilde: nullable({
          rolle: nullable(faker.string.alpha),
          ident: nullable(faker.string.alpha),
        }),
        innsendtTidspunkt: nullable(() => faker.date.recent().toISOString()),
        meldedato: nullable(() => faker.date.recent().toISOString()),
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
