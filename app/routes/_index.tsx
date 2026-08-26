import { BodyShort, Box, GuidePanel, Heading, LinkCard, VStack } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useLoaderData } from "react-router";

import { mockPersons } from "~/mocks/data/mock-persons";
import { logger } from "~/models/logger.server";
import { sanityClient } from "~/sanity/client";
import { SanityDevWarning } from "~/sanity/components/SanityDevWarning";
import { forsideQuery } from "~/sanity/sider/forside/queries";
import type { IMeldekortForside } from "~/sanity/sider/forside/types";
import { sanityDataMangler, sanityTekst } from "~/sanity/utils";
import { usesMsw } from "~/utils/env.utils";

export async function loader() {
  let forsideData: IMeldekortForside | null = null;

  try {
    forsideData = await sanityClient.fetch<IMeldekortForside>(forsideQuery);
  } catch (error) {
    logger.error("Kunne ikke hente forsidedata fra Sanity for _index", {
      error,
      route: "_index",
      metric: "sanity_fetch_failed",
    });
  }

  if (usesMsw) {
    return { personer: mockPersons, forside: forsideData };
  }
  return { personer: [], forside: forsideData };
}

export default function Rapportering() {
  const data = useLoaderData<typeof loader>();

  const dataMangler = sanityDataMangler(data.forside, ["heading", "welcomeText", "sectionHeading"]);

  return (
    <Box
      as="main"
      id="main-content"
      tabIndex={-1}
      paddingBlock="space-40"
      paddingInline="space-16"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <VStack gap="space-48">
        {dataMangler && <SanityDevWarning contentType="meldekortForside" />}

        <GuidePanel style={{ margin: "auto" }}>
          <Heading level="1" size="small" spacing>
            {sanityTekst(data.forside?.heading, "forside.heading")}
          </Heading>
          {data.forside?.welcomeText && <PortableText value={data.forside.welcomeText} />}
        </GuidePanel>

        {data.personer.length > 0 ? (
          <VStack gap="space-24">
            <Heading level="2" size="medium">
              {sanityTekst(data.forside?.sectionHeading, "forside.sectionHeading")}
            </Heading>
            <VStack gap="space-12">
              {data.personer.flatMap((person) => {
                const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                  person.etternavn
                }`;

                return (
                  <LinkCard key={person.id}>
                    <LinkCard.Title>
                      <LinkCard.Anchor href={`/person/${person.id}/perioder`}>
                        {navn}
                      </LinkCard.Anchor>
                    </LinkCard.Title>
                  </LinkCard>
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
