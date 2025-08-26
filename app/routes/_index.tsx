import { BodyShort, Heading, LinkPanel } from "@navikt/ds-react";
import { useLoaderData } from "react-router";

import { getFullDemoPerson } from "~/mocks/data/mock-personer";
import { usesMsw } from "~/utils/env.utils";

export async function loader() {
  if (usesMsw) {
    const fullDemoPerson = getFullDemoPerson();
    return { personer: fullDemoPerson ? [fullDemoPerson] : [] };
  }
  return { personer: [] };
}

export default function Rapportering() {
  const data = useLoaderData<typeof loader>();

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
            Velkommen til demoversjonen av saksbehandlerflaten for meldekort. <br />
            Klikk på personen under for å se hele rapporteringsperioden deres.
          </BodyShort>

          <ul style={{ listStyle: "none", padding: 0 }}>
            {data.personer.map((person) => {
              const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                person.etternavn
              }`;
              const link = `/person/${person.id}/perioder`;

              return (
                <li key={person.id} style={{ marginBottom: "1rem" }}>
                  <LinkPanel href={link} border aria-label={`Gå til perioder for ${navn}`}>
                    <LinkPanel.Title>{navn}</LinkPanel.Title>
                    <LinkPanel.Description>Full demo med alle scenarioer</LinkPanel.Description>
                  </LinkPanel>
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
