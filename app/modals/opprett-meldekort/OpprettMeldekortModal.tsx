import {
  Alert,
  BodyShort,
  Button,
  DatePicker,
  InfoCard,
  Modal,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";

import { sanityTekst } from "~/sanity/utils";
import { getTodayIsoDate } from "~/utils/dato.utils";
import { addDemoParamsToURL } from "~/utils/demo-params.utils";

import { OpprettMeldekortInfoBoks } from "./components/OpprettMeldekortInfoBoks";
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
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    rootData = null;
  }

  const tekster = rootData?.sanityData?.opprettMeldekortModal;
  const [actionError, setActionError] = useState<string | undefined>();
  const [visDatoFeil, setVisDatoFeil] = useState(false);
  const [hasPendingSubmission, setHasPendingSubmission] = useState(false);
  const fetcher = useFetcher<IOpprettMeldekortResponse>();
  const simuleringFetcher = useFetcher<IOpprettMeldekortResponse>();

  const { datepickerProps, fromInputProps, toInputProps, reset, selectedRange } =
    useRangeDatepicker({
      fromDate: undefined,
      toDate: new Date(),
    });

  function resetFormState() {
    setActionError(undefined);
    setVisDatoFeil(false);
    setHasPendingSubmission(false);
    reset();
  }

  function byggOpprettMeldekortActionUrl(): string {
    const actionUrl = new URL("/api/opprett-meldekort", window.location.origin);
    addDemoParamsToURL(actionUrl);
    return actionUrl.pathname + actionUrl.search;
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

  // Simuler opprettelsen så snart begge datoer er valgt, for å vise hvilke perioder som opprettes
  useEffect(() => {
    if (!personId || !selectedRange?.from || !selectedRange.to) {
      return;
    }

    const fraOgMed = format(selectedRange.from, "yyyy-MM-dd");
    const tilOgMed = format(selectedRange.to, "yyyy-MM-dd");
    const today = getTodayIsoDate();
    const erGyldigPeriode = fraOgMed <= tilOgMed && fraOgMed <= today && tilOgMed <= today;

    if (!erGyldigPeriode) {
      return;
    }

    simuleringFetcher.submit(
      buildOpprettMeldekortFormData({ personId, fraOgMed, tilOgMed, simulering: true }),
      { method: "post", action: byggOpprettMeldekortActionUrl() },
    );
  }, [personId, selectedRange?.from, selectedRange?.to]);

  function handleBekreft() {
    if (!selectedRange?.from || !selectedRange.to) {
      setVisDatoFeil(true);
      setActionError(undefined);
      return;
    }

    setVisDatoFeil(false);

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

    const payload: IOpprettMeldekortPayload = { personId, fraOgMed, tilOgMed, simulering: false };

    setHasPendingSubmission(true);
    fetcher.submit(buildOpprettMeldekortFormData(payload), {
      method: "post",
      action: byggOpprettMeldekortActionUrl(),
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

  const simulertePerioder =
    selectedRange?.from && selectedRange.to && simuleringFetcher.data?.success
      ? (simuleringFetcher.data.perioder ?? [])
      : [];

  const infoBoksTekst = sanityTekst(
    tekster?.infoBoks?.tekst,
    "opprettMeldekortModal.infoBoks.tekst",
  ).replace("{{antall}}", String(simulertePerioder.length));

  return (
    <Modal open={open} onClose={handleClose} aria-label={tittelMedNavn} size="medium">
      <Modal.Header>
        <h2>{tittelMedNavn}</h2>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.content}>
          <DatePicker {...datepickerProps}>
            <div className={styles.datepickers}>
              <DatePicker.Input
                size="small"
                {...fromInputProps}
                label={sanityTekst(tekster?.fraDato?.label, "opprettMeldekortModal.fraDato.label")}
                description={sanityTekst(
                  tekster?.fraDato?.helpText,
                  "opprettMeldekortModal.fraDato.helpText",
                )}
                error={visDatoFeil && !selectedRange?.from ? "Du må velge dato" : undefined}
              />
              <DatePicker.Input
                size="small"
                {...toInputProps}
                label={sanityTekst(tekster?.tilDato?.label, "opprettMeldekortModal.tilDato.label")}
                description={sanityTekst(
                  tekster?.tilDato?.helpText,
                  "opprettMeldekortModal.tilDato.helpText",
                )}
                error={visDatoFeil && !selectedRange?.to ? "Du må velge dato" : undefined}
              />
            </div>
          </DatePicker>
          {actionError && <Alert variant="error">{actionError}</Alert>}
          <BodyShort>{forklaringstekst}</BodyShort>
          <OpprettMeldekortInfoBoks
            tittel={sanityTekst(tekster?.infoBoks?.tittel, "opprettMeldekortModal.infoBoks.tittel")}
            tekst={infoBoksTekst}
            perioder={simulertePerioder}
          />
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
