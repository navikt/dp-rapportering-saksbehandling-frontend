import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";

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
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return factory({
      rapporteringsperioder: {
        id: primaryKey(faker.string.numeric),
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
