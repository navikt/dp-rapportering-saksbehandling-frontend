import {
  BodyShort,
  Button,
  DatePicker,
  InfoCard,
  Modal,
  useRangeDatepicker,
  VStack,
} from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import type { IMeldekortOpprettMeldekortModal } from "~/sanity/modaler/opprett-meldekort-modal/types";
import { deepMerge } from "~/utils/deep-merge.utils";

import styles from "./opprettMeldekortModal.module.css";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_TEKSTER: IMeldekortOpprettMeldekortModal = {
  tittel: "Opprett meldekort",
  fraDato: {
    label: "Fra dato",
    helpText: "Velg startdato for perioden du vil opprette meldekort for",
  },
  tilDato: {
    label: "Til dato",
    helpText: "Velg sluttdato for perioden du vil opprette meldekort for",
  },
  forklaringstekst: "Basert på valgt dato, vil det opprettes {{antall}} nye meldekort.",
  submitKnapp: "Opprett",
  avbrytKnapp: "Avbryt",
  infoBoks: {
    tittel: "Info om meldekortsyklus",
    tekst:
      "Nye meldekort opprettes i samme syklus som den bruker allerede har. Meldekort opprettes hver 14. dag.",
  },
  feilmelding: {
    tittel: "Kunne ikke opprette meldekort",
    tekst: "Noe gikk galt ved opprettelse av meldekort. Prøv igjen senere.",
  },
};

interface OpprettMeldekortModalProps {
  open: boolean;
  onClose: () => void;
  onBekreft?: () => void;
  brukerNavn?: string;
}

export function OpprettMeldekortModal({
  open,
  onClose,
  onBekreft,
  brukerNavn,
}: OpprettMeldekortModalProps) {
  // Hent tekster fra Sanity med fallback
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    rootData = null;
  }

  const tekster = deepMerge(DEFAULT_TEKSTER, rootData?.sanity?.opprettMeldekortModal);

  const { datepickerProps, fromInputProps, toInputProps, reset } = useRangeDatepicker({
    fromDate: undefined,
    toDate: undefined,
  });

  function handleBekreft() {
    if (onBekreft) {
      onBekreft();
    }
    handleClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  const tittelMedNavn = brukerNavn
    ? tekster.tittel.replace("{{navn}}", brukerNavn)
    : tekster.tittel;

  return (
    <Modal open={open} onClose={handleClose} aria-label={tittelMedNavn} size="medium">
      <Modal.Header>
        <h2>{tittelMedNavn}</h2>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.content}>
          <DatePicker {...datepickerProps}>
            <VStack gap="space-16">
              <DatePicker.Input
                size="small"
                {...fromInputProps}
                label={tekster.fraDato.label}
                description={tekster.fraDato.helpText}
              />
              <DatePicker.Input
                size="small"
                {...toInputProps}
                label={tekster.tilDato.label}
                description={tekster.tilDato.helpText}
              />
            </VStack>
          </DatePicker>
          <BodyShort>{tekster.forklaringstekst}</BodyShort>
          <InfoCard data-color="info" size="small">
            <InfoCard.Header>
              <InfoCard.Title>{tekster.infoBoks.tittel}</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>{tekster.infoBoks.tekst}</InfoCard.Content>
          </InfoCard>
          <InfoCard data-color="danger" size="small">
            <InfoCard.Header>
              <InfoCard.Title>{tekster.feilmelding.tittel}</InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>{tekster.feilmelding.tekst}</InfoCard.Content>
          </InfoCard>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleBekreft} size="small">
          {tekster.submitKnapp}
        </Button>
        <Button variant="secondary" onClick={handleClose} size="small">
          {tekster.avbrytKnapp}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
