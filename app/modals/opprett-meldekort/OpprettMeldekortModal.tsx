import {
  Alert,
  BodyShort,
  Button,
  DatePicker,
  InfoCard,
  Modal,
  useRangeDatepicker,
  VStack,
} from "@navikt/ds-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";

import { sanityTekst } from "~/sanity/utils";
import { getTodayIsoDate } from "~/utils/dato.utils";

import {
  buildOpprettMeldekortFormData,
  type IOpprettMeldekortPayload,
  type IOpprettMeldekortResponse,
  toOpprettMeldekortErrorMessage,
} from "./opprettMeldekortModal.helpers";
import styles from "./opprettMeldekortModal.module.css";

interface OpprettMeldekortModalProps {
  open: boolean;
  onClose: () => void;
  onBekreft?: () => void;
  brukerNavn?: string;
  personId?: string;
}

export function OpprettMeldekortModal({
  open,
  onClose,
  onBekreft,
  brukerNavn,
  personId,
}: OpprettMeldekortModalProps) {
  // Hent tekster fra Sanity med fallback
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    rootData = null;
  }

  const tekster = rootData?.sanityData?.opprettMeldekortModal;
  const [actionError, setActionError] = useState<string | undefined>();
  const [hasPendingSubmission, setHasPendingSubmission] = useState(false);
  const fetcher = useFetcher<IOpprettMeldekortResponse>();

  const { datepickerProps, fromInputProps, toInputProps, reset, selectedRange } =
    useRangeDatepicker({
      fromDate: undefined,
      toDate: new Date(),
    });

  function resetFormState() {
    setActionError(undefined);
    setHasPendingSubmission(false);
    reset();
  }

  useEffect(() => {
    if (!hasPendingSubmission || fetcher.state !== "idle" || !fetcher.data) {
      return;
    }

    setHasPendingSubmission(false);

    if (fetcher.data.success) {
      onBekreft?.();
      resetFormState();
      onClose();
      return;
    }

    setActionError(toOpprettMeldekortErrorMessage(fetcher.data));
  }, [hasPendingSubmission, fetcher.state, fetcher.data, onBekreft, onClose]);

  function handleBekreft() {
    if (!selectedRange?.from || !selectedRange.to) {
      setActionError("Velg fra- og til-dato.");
      return;
    }

    if (!personId) {
      setActionError("Mangler personId.");
      return;
    }

    setActionError(undefined);
    const fraOgMed = format(selectedRange.from, "yyyy-MM-dd");
    const tilOgMed = format(selectedRange.to, "yyyy-MM-dd");
    const today = getTodayIsoDate();

    if (fraOgMed > today || tilOgMed > today) {
      setActionError("Fra-dato og til-dato kan ikke være frem i tid.");
      return;
    }

    const payload: IOpprettMeldekortPayload = { personId, fraOgMed, tilOgMed };

    setHasPendingSubmission(true);
    fetcher.submit(buildOpprettMeldekortFormData(payload), {
      method: "post",
      action: "/api/opprett-meldekort",
    });
  }

  function handleClose() {
    resetFormState();
    onClose();
  }

  const tittel = sanityTekst(tekster?.tittel, "opprettMeldekortModal.tittel");
  const tittelMedNavn = brukerNavn ? tittel.replace("{{navn}}", brukerNavn) : tittel;
  const forklaringstekst = sanityTekst(
    tekster?.forklaringstekst,
    "opprettMeldekortModal.forklaringstekst",
  );
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
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <BodyShort>{forklaringstekst}</BodyShort>
          <InfoCard data-color="info" size="small">
            <InfoCard.Header>
              <InfoCard.Title>
                {sanityTekst(tekster?.infoBoks?.tittel, "opprettMeldekortModal.infoBoks.tittel")}
              </InfoCard.Title>
            </InfoCard.Header>
            <InfoCard.Content>
              <BodyShort>
                {sanityTekst(tekster?.infoBoks?.tekst, "opprettMeldekortModal.infoBoks.tekst")}
              </BodyShort>
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
        <Button
          variant="primary"
          onClick={handleBekreft}
          size="small"
          loading={hasPendingSubmission && fetcher.state !== "idle"}
        >
          {sanityTekst(tekster?.submitKnapp, "opprettMeldekortModal.submitKnapp")}
        </Button>
        <Button
          variant="secondary"
          onClick={handleClose}
          size="small"
          disabled={hasPendingSubmission && fetcher.state !== "idle"}
        >
          {sanityTekst(tekster?.avbrytKnapp, "opprettMeldekortModal.avbrytKnapp")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
