import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import {
  Alert,
  BodyShort,
  Button,
  DatePicker,
  InfoCard,
  Modal,
  Skeleton,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useRouteLoaderData } from "react-router";

import { sanityTekst } from "~/sanity/utils";
import { getTodayIsoDate } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { OpprettMeldekortInfoBoks } from "./components/OpprettMeldekortInfoBoks";
import {
  buildOpprettMeldekortFormData,
  byggOpprettMeldekortActionUrl,
  erSammePeriode,
  type IOpprettMeldekortPayload,
  type IOpprettMeldekortResponse,
  type IPeriodeIntervall,
  toOpprettMeldekortErrorMessage,
  utledGyldigPeriode,
} from "./opprettMeldekortModal.helpers";
import styles from "./opprettMeldekortModal.module.css";

interface OpprettMeldekortModalProps {
  open: boolean;
  onClose: () => void;
  onBekreft?: () => void;
  brukerNavn?: string;
  personId?: string;
  perioder?: IRapporteringsperiode[];
}

export function OpprettMeldekortModal({
  open,
  onClose,
  onBekreft,
  brukerNavn,
  personId,
  perioder = [],
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

  const [simulertRange, setSimulertRange] = useState<IPeriodeIntervall | null>(null);
  const ventendeRangeRef = useRef<IPeriodeIntervall | null>(null);

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

  const valgtPeriode = utledGyldigPeriode(selectedRange);

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

  function startSimuleringAvMeldekortOpprettelse() {
    if (!personId || !valgtPeriode) {
      ventendeRangeRef.current = null;
      return;
    }

    ventendeRangeRef.current = valgtPeriode;

    simuleringFetcher.submit(
      buildOpprettMeldekortFormData({ personId, ...valgtPeriode, simulering: true }),
      { method: "post", action: byggOpprettMeldekortActionUrl() },
    );
  }

  useEffect(startSimuleringAvMeldekortOpprettelse, [
    personId,
    valgtPeriode?.fraOgMed,
    valgtPeriode?.tilOgMed,
  ]);

  useEffect(() => {
    if (simuleringFetcher.state !== "idle" || !simuleringFetcher.data) {
      return;
    }

    setSimulertRange(ventendeRangeRef.current);
  }, [simuleringFetcher.state, simuleringFetcher.data]);

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

  const lasterSimulering =
    Boolean(personId) && valgtPeriode !== null && simuleringFetcher.state !== "idle";

  const simulertePerioder =
    erSammePeriode(simulertRange, valgtPeriode) && simuleringFetcher.data?.success
      ? (simuleringFetcher.data.perioder ?? [])
      : [];

  const infoBoksTekst = sanityTekst(
    tekster?.infoBoks?.tekst,
    "opprettMeldekortModal.infoBoks.tekst",
  );

  return (
    <Modal open={open} onClose={handleClose} aria-label={tittelMedNavn} size="medium">
      <Modal.Header>
        <h2>{tittelMedNavn}</h2>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.content}>
          {perioder.length === 0 && (
            <InfoCard data-color="warning" size="small">
              <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                <InfoCard.Title id="ingen-meldekort-tittel">
                  Sjekk med brukerstøtte før du oppretter meldekort
                </InfoCard.Title>
              </InfoCard.Header>
              <InfoCard.Content>
                Det har skjedd en feil. Ta kontakt med brukerstøtte.
              </InfoCard.Content>
            </InfoCard>
          )}
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
          {lasterSimulering && (
            <Skeleton
              variant="rounded"
              width="100%"
              height="5rem"
              data-testid="opprett-meldekort-simulering-skeleton"
            />
          )}
          {simulertePerioder.length > 0 && (
            <OpprettMeldekortInfoBoks
              tittel={sanityTekst(
                tekster?.infoBoks?.tittel,
                "opprettMeldekortModal.infoBoks.tittel",
              )}
              tekst={infoBoksTekst}
              perioder={simulertePerioder}
            />
          )}
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
