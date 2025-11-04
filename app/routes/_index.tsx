import { BodyShort, Box, Heading, LinkPanel, VStack } from "@navikt/ds-react";
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
    <Box
      as="main"
      id="main-content"
      paddingBlock="10"
      paddingInline="4"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <VStack gap="6">
        <Heading level="1" size="large">
          Saksbehandlerflate for meldekort
        </Heading>

        {data.personer.length > 0 ? (
          <VStack gap="3">
            {data.personer.map((person) => {
              const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                person.etternavn
              }`;
              const link = `/person/${person.id}/perioder`;

              return (
                <LinkPanel key={person.id} href={link} border>
                  <LinkPanel.Title>{navn}</LinkPanel.Title>
                  <LinkPanel.Description>
                    Åpne saksbehandling for denne personen
                  </LinkPanel.Description>
                </LinkPanel>
              );
            })}
          </VStack>
        ) : (
          <BodyShort>
            Ingen testpersoner tilgjengelig. Sørg for at MSW (Mock Service Worker) er aktivert.
          </BodyShort>
        )}
      </VStack>
    </Box>
  );
}
