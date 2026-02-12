import { BodyShort, Box, GuidePanel, Heading, LinkCard, VStack } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useLoaderData } from "react-router";

import { mockPersons } from "~/mocks/data/mock-persons";
import { logger } from "~/models/logger.server";
import { sanityClient } from "~/sanity/client";
import { SanityDevWarning } from "~/sanity/components/SanityDevWarning";
import { forsideQuery } from "~/sanity/sider/forside/queries";
import type { IMeldekortForside } from "~/sanity/sider/forside/types";
import { sanityDataMangler } from "~/sanity/utils";
import { deepMerge } from "~/utils/deep-merge.utils";
import { usesMsw } from "~/utils/env.utils";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_FORSIDE: IMeldekortForside = {
  heading: "Hei!",
  welcomeText: [
    {
      _type: "block",
      _key: "default",
      children: [
        {
          _type: "span",
          _key: "default-span",
          text: "Velkommen til demo av saksbehandlerflaten for meldekort.",
          marks: [],
        },
      ],
      markDefs: [],
      style: "normal",
    },
  ],
  sectionHeading: "Gå til løsningen:",
};

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

  // Bruk Sanity-data hvis tilgjengelig, ellers bruk defaults
  const forside = deepMerge(DEFAULT_FORSIDE, forsideData);

  if (usesMsw) {
    return { personer: mockPersons, forside };
  }
  return { personer: [], forside };
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
            {data.forside.heading}
          </Heading>
          <PortableText value={data.forside.welcomeText} />
        </GuidePanel>

        {data.personer.length > 0 ? (
          <VStack gap="space-24">
            <Heading level="2" size="medium">
              {data.forside.sectionHeading}
            </Heading>
            <VStack gap="space-12">
              {data.personer.flatMap((person) => {
                const navn = `${person.fornavn} ${person.mellomnavn ? person.mellomnavn + " " : ""}${
                  person.etternavn
                }`;

                return [
                  <LinkCard key={`${person.id}-A`}>
                    <LinkCard.Title>
                      <LinkCard.Anchor href={`/person/${person.id}/perioder?variant=A`}>
                        {navn}
                      </LinkCard.Anchor>
                    </LinkCard.Title>
                    <LinkCard.Description>Variant A</LinkCard.Description>
                  </LinkCard>,
                  <LinkCard key={`${person.id}-B`}>
                    <LinkCard.Title>
                      <LinkCard.Anchor href={`/person/${person.id}/perioder?variant=B`}>
                        {navn}
                      </LinkCard.Anchor>
                    </LinkCard.Title>
                    <LinkCard.Description>Variant B</LinkCard.Description>
                  </LinkCard>,
                ];
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
