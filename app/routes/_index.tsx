import { BodyShort, Heading } from "@navikt/ds-react";
import { Link, useLoaderData } from "react-router";

import { getScenarioForPerson } from "~/mocks/data/mock-persons";
import { hentPersoner } from "~/models/person.server";
import { usesMsw } from "~/utils/env.utils";
import { SCENARIOS } from "~/utils/scenario.types";

import type { Route } from "../+types/root";

export async function loader({ request }: Route.LoaderArgs) {
  if (usesMsw) {
    const personer = await hentPersoner(request);
    return { personer };
  }
  return { personer: [] };
}

export default function Rapportering() {
  const data = useLoaderData<typeof loader>();

  const getScenarioInfo = (personId: string) => {
    const scenario = getScenarioForPerson(personId);
    return SCENARIOS.find((s) => s.type === scenario);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <Heading level="1" size="medium">
        Saksbehandlerflate for meldekort
      </Heading>

      {data.personer.length > 0 ? (
        <>
          <BodyShort size="small">
            Velkommen til demoversjonen av saksbehandlerflaten for meldekort. <br /> Her kan du
            velge en person med et forhåndsdefinert scenario. Når du klikker på en person, får du se
            hele rapporteringsperioden deres.
          </BodyShort>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {data.personer.map((person) => {
              const scenarioInfo = getScenarioInfo(person.ident);
              const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                person.etternavn
              }`;
              const link = `/person/${person.ident}/perioder`;

              return (
                <li key={person.fodselsdato} style={{ marginBottom: "1rem" }}>
                  <Link
                    to={link}
                    aria-label={`Gå til perioder for ${navn}. ${scenarioInfo?.tittel ?? ""}`}
                    style={{
                      display: "block",
                      padding: "1rem",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "inherit",
                      background: "white",
                      transition: "box-shadow 0.2s ease",
                    }}
                  >
                    <Heading level="3" size="small" style={{ marginBottom: "0.5rem" }}>
                      {navn}
                    </Heading>
                    {scenarioInfo && <p>{scenarioInfo.tittel}</p>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <BodyShort size="small">
          Ingen testpersoner tilgjengelig. Sørg for at MSW (Mock Service Worker) er aktivert.
        </BodyShort>
      )}
    </div>
  );
}
