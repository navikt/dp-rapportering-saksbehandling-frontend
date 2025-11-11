import { BodyShort, Box, GuidePanel, Heading, LinkCard, VStack } from "@navikt/ds-react";
import { useLoaderData } from "react-router";

import { mockPersons } from "~/mocks/data/mock-persons";
import { usesMsw } from "~/utils/env.utils";

export async function loader() {
  if (usesMsw) {
    return { personer: mockPersons };
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
      <VStack gap="space-48">
        <GuidePanel>
          <Heading level="1" size="small" spacing>
            Hei!
          </Heading>
          Velkommen til demo av saksbehandlerflaten for meldekort.
        </GuidePanel>

        {data.personer.length > 0 ? (
          <VStack gap="space-24">
            <Heading level="2" size="medium">
              Gå til løsningen:
            </Heading>
            <VStack gap="3">
              {data.personer.map((person) => {
                const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                  person.etternavn
                }`;

                return (
                  <>
                    <LinkCard key={`${person.id}-A`}>
                      <LinkCard.Title>
                        <LinkCard.Anchor href={`/person/${person.id}/perioder?variant=A`}>
                          {navn}
                        </LinkCard.Anchor>
                      </LinkCard.Title>
                      <LinkCard.Description>Variant A</LinkCard.Description>
                    </LinkCard>
                    <LinkCard key={`${person.id}-B`}>
                      <LinkCard.Title>
                        <LinkCard.Anchor href={`/person/${person.id}/perioder?variant=B`}>
                          {navn}
                        </LinkCard.Anchor>
                      </LinkCard.Title>
                      <LinkCard.Description>Variant B</LinkCard.Description>
                    </LinkCard>
                  </>
                );
              })}
            </VStack>
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
