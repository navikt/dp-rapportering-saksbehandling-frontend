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

import { sanityTekst } from "~/sanity/utils";

import styles from "./opprettMeldekortModal.module.css";

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
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    rootData = null;
  }

  const tekster = rootData?.sanityData?.opprettMeldekortModal;

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
    ? sanityTekst(tekster?.tittel, "opprettMeldekortModal.tittel").replace("{{navn}}", brukerNavn)
    : sanityTekst(tekster?.tittel, "opprettMeldekortModal.tittel");

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
                label={sanityTekst(tekster?.fraDato?.label, "opprettMeldekortModal.fraDato.label")}
                description={sanityTekst(
                  tekster?.fraDato?.helpText,
                  "opprettMeldekortModal.fraDato.helpText",
                )}
              />
              <DatePicker.Input
                size="small"
                {...toInputProps}
                label={sanityTekst(tekster?.tilDato?.label, "opprettMeldekortModal.tilDato.label")}
                description={sanityTekst(
                  tekster?.tilDato?.helpText,
                  "opprettMeldekortModal.tilDato.helpText",
                )}
              />
            </VStack>
          </DatePicker>
          <BodyShort>
            {sanityTekst(tekster?.forklaringstekst, "opprettMeldekortModal.forklaringstekst")}
          </BodyShort>
          <InfoCard data-color="info" size="small">
            <InfoCard.Header>
              <InfoCard.Title>
                {sanityTekst(tekster?.infoBoks?.tittel, "opprettMeldekortModal.infoBoks.tittel")}
              </InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              {sanityTekst(tekster?.infoBoks?.tekst, "opprettMeldekortModal.infoBoks.tekst")}
            </InfoCard.Content>
          </InfoCard>
          <InfoCard data-color="danger" size="small">
            <InfoCard.Header>
              <InfoCard.Title>
                {sanityTekst(
                  tekster?.feilmelding?.tittel,
                  "opprettMeldekortModal.feilmelding.tittel",
                )}
              </InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              {sanityTekst(tekster?.feilmelding?.tekst, "opprettMeldekortModal.feilmelding.tekst")}
            </InfoCard.Content>
          </InfoCard>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleBekreft} size="small">
          {sanityTekst(tekster?.submitKnapp, "opprettMeldekortModal.submitKnapp")}
        </Button>
        <Button variant="secondary" onClick={handleClose} size="small">
          {sanityTekst(tekster?.avbrytKnapp, "opprettMeldekortModal.avbrytKnapp")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
