import { Collection } from "@msw/data";
import z from "zod";

import { ScenarioType } from "~/utils/scenario.types";
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

  public async getDatabase(
    sessionId: string
  ): Promise<ReturnType<SessionRecord["createDatabase"]>> {
    if (!this.sessions.has(sessionId)) {
      const db = this.createDatabase();

      this.sessions.set(sessionId, db);

      const createdSaksbehandler = (await db.saksbehandlere.create(
        mockSaksbehandler
      )) as ISaksbehandler;

      // Lag personer med perioder
      for (const personData of mockPersons) {
        const createdPerson = (await db.personer.create(personData)) as IPerson;

        // Generer perioder basert på FULL_DEMO scenario
        const periods = hentRapporteringsperioderForScenario(
          ScenarioType.FULL_DEMO,
          createdPerson,
          createdSaksbehandler
        );

        await Promise.all(
          periods.map((rapporteringsperiode) => {
            db.rapporteringsperioder.create(rapporteringsperiode);
          })
        );

        const arbeidssokerperioder = hentArbeidssokerperioder(periods, createdPerson);
        await Promise.all(
          arbeidssokerperioder.map((arbeidssokerperiode) =>
            db.arbeidssokerperioder.create(arbeidssokerperiode)
          )
        );
      }
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return {
      rapporteringsperioder: new Collection({
        schema: z.object({
          id: z.uuid(),
          ident: z.string(),
          status: z.string(),
          type: z.string(),
          periode: z.object({
            fraOgMed: z.string(),
            tilOgMed: z.string()
          }),
          dager: z.array(
            z.object({
              type: z.string(),
              dagIndex: z.number(),
              dato: z.string(),
              aktiviteter: z.array(
                z.object({
                  id: z.string().optional(),
                  type: z.string(),
                  dato: z.string(),
                  timer: z.string().nullable().optional()
                })
              )
            })
          ),
          kanSendes: z.boolean(),
          kanEndres: z.boolean(),
          kanSendesFra: z.string(),
          sisteFristForTrekk: z.string().nullable(),
          opprettetAv: z.string().nullable(),
          originalMeldekortId: z.uuid().nullable(),
          kilde: z
            .object({
              rolle: z.string().nullable(),
              ident: z.string().nullable()
            })
            .nullable(),
          innsendtTidspunkt: z.string().nullable(),
          meldedato: z.string().nullable(),
          registrertArbeidssoker: z.boolean().nullable(),
          begrunnelse: z.string().optional()
        })
      }),
      personer: new Collection({
        schema: z.object({
          ident: z.string(),
          id: z.string(),
          etternavn: z.string(),
          fornavn: z.string(),
          mellomnavn: z.string().optional(),
          statsborgerskap: z.string().optional(),
          ansvarligSystem: z.enum(["ARENA", "DP"]),
          fodselsdato: z.string().optional(),
          kjonn: z.enum(["MANN", "KVINNE", "UKJENT"]).optional()
        })
      }),
      saksbehandlere: new Collection({
        schema: z.object({
          onPremisesSamAccountName: z.string(),
          displayName: z.string(),
          givenName: z.string(),
          mail: z.email()
        })
      }),
      arbeidssokerperioder: new Collection({
        schema: z.object({
          periodeId: z.uuid(),
          ident: z.string(),
          startDato: z.string(),
          sluttDato: z.string().nullable(),
          status: z.enum(["Startet", "Avsluttet"])
        })
      })
    };
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
