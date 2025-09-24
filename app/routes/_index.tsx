import { BodyShort, Heading, LinkPanel } from "@navikt/ds-react";
import { useLoaderData } from "react-router";

import { getFullDemoPerson } from "~/mocks/data/mock-persons";
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
    <main
      id="main-content"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      <Heading level="1" size="small" id="page-title">
        Saksbehandlerflate for meldekort
      </Heading>

      {data.personer.length > 0 ? (
        <>
          <BodyShort size="small">
            Velkommen til demoversjonen av saksbehandlerflaten for meldekort.
          </BodyShort>
          <BodyShort size="small">
            Klikk på personen under for å se hele rapporteringsperioden deres.
          </BodyShort>

          <nav aria-label="Tilgjengelige testpersoner og alternativer">
            <ul
              style={{ listStyle: "none", padding: 0 }}
              aria-label={`${data.personer.length} person${data.personer.length !== 1 ? "er" : ""} tilgjengelig for saksbehandling`}
            >
              {data.personer.map((person) => {
                const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                  person.etternavn
                }`;
                const link = `/person/${person.id}/perioder`;
                const alternativeLink = `/person/${person.id}/alternative-perioder`;

                return (
                  <>
                    <li key={person.id} style={{ marginBottom: "1rem" }}>
                      <LinkPanel href={link} border>
                        <LinkPanel.Title>{navn}</LinkPanel.Title>
                        <LinkPanel.Description>
                          Åpne saksbehandling for denne personen
                        </LinkPanel.Description>
                      </LinkPanel>
                    </li>
                    <li key={`${person.id}-alternative`} style={{ marginBottom: "1rem" }}>
                      <LinkPanel href={alternativeLink} border>
                        <LinkPanel.Title>Alternativ {navn}</LinkPanel.Title>
                        <LinkPanel.Description>
                          Åpne alternativ saksbehandling for denne personen
                        </LinkPanel.Description>
                      </LinkPanel>
                    </li>
                  </>
                );
              })}
            </ul>
          </nav>
        </>
      ) : (
        <BodyShort size="small">
          Ingen testpersoner tilgjengelig. Sørg for at MSW (Mock Service Worker) er aktivert.
        </BodyShort>
      )}
    </main>
  );
}
