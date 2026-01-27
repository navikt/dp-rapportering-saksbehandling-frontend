import { Alert, Heading } from "@navikt/ds-react";

interface SanityDevWarningProps {
  contentType: string;
}

/**
 * Viser en warning i development hvis Sanity-data mangler.
 * Vises kun i dev-miljø (import.meta.env.DEV).
 */
export function SanityDevWarning({ contentType }: SanityDevWarningProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <Alert variant="warning">
      <Heading size="small" level="3" spacing>
        Sanity-data mangler: {contentType}
      </Heading>
      Kunne ikke hente innhold fra Sanity CMS. Sjekk at SANITY_DATASETT er konfigurert i .env og at
      innhold finnes i Sanity Studio (vises kun i development).
    </Alert>
  );
}
