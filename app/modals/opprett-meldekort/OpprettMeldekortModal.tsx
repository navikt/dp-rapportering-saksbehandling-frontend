import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import {
  BodyShort,
  Button,
  DatePicker,
  InfoCard,
  LocalAlert,
  Modal,
  Skeleton,
  useRangeDatepicker,
} from "@navikt/ds-react";
import { format } from "date-fns";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate, useRouteLoaderData } from "react-router";

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
  utledGyldigPeriode,
} from "./opprettMeldekortModal.helpers";
import styles from "./opprettMeldekortModal.module.css";

interface OpprettMeldekortAlertProps {
  tittel?: string;
  innhold: ReactNode;
}

function OpprettMeldekortAlert({ tittel, innhold }: OpprettMeldekortAlertProps) {
  return (
    <LocalAlert status="error">
      {tittel && (
        <LocalAlert.Header>
          <LocalAlert.Title>{tittel}</LocalAlert.Title>
        </LocalAlert.Header>
      )}
      <LocalAlert.Content>{innhold}</LocalAlert.Content>
    </LocalAlert>
  );
}

interface OpprettMeldekortModalProps {
  open: boolean;
  onClose: () => void;
  onBekreft?: (perioder: IOpprettMeldekortResponse["perioder"]) => void;
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
  const [opprettelseFeilet, setOpprettelseFeilet] = useState(false);
  const [visDatoFeil, setVisDatoFeil] = useState(false);
  const [hasPendingSubmission, setHasPendingSubmission] = useState(false);
  const fetcher = useFetcher<IOpprettMeldekortResponse>();
  const navigate = useNavigate();
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
    setOpprettelseFeilet(false);
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
      setOpprettelseFeilet(false);
      onBekreft?.(fetcher.data.perioder ?? []);
      if (fetcher.data.redirectUrl) {
        navigate(fetcher.data.redirectUrl);
      }
      resetFormState();
      onClose();
      return;
    }

    setOpprettelseFeilet(true);
  }, [hasPendingSubmission, fetcher.state, fetcher.data, onBekreft, onClose]);

  function startSimuleringAvMeldekortOpprettelse() {
    if (!personId || !valgtPeriode) {
      ventendeRangeRef.current = null;
      return;
    }

    setActionError(undefined);
    setOpprettelseFeilet(false);
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
    setOpprettelseFeilet(false);

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
    erSammePeriode(simulertRange, valgtPeriode) && simuleringFetcher.data
      ? (simuleringFetcher.data.perioder ?? [])
      : [];

  const simuleringHarOverlapp =
    erSammePeriode(simulertRange, valgtPeriode) &&
    Boolean(simuleringFetcher.data && !simuleringFetcher.data.success) &&
    simulertePerioder.some((periode) => periode.overlapperEksisterendeMeldekort);

  const simuleringHarFeil =
    erSammePeriode(simulertRange, valgtPeriode) &&
    Boolean(simuleringFetcher.data && !simuleringFetcher.data.success);

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
                <InfoCard.Title>Sjekk med brukerstøtte før du oppretter meldekort</InfoCard.Title>
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
              attention={simuleringHarOverlapp}
              perioder={simulertePerioder}
            />
          )}
          {actionError && <OpprettMeldekortAlert innhold={actionError} />}
          {opprettelseFeilet && (
            <OpprettMeldekortAlert
              tittel="Kunne ikke opprette meldekort"
              innhold="Meldekort kunne ikke opprettes. Prøv igjen, og hvis du fortsatt har problemer kontakt brukerstøtte."
            />
          )}
          {simuleringHarFeil && !simuleringHarOverlapp && (
            <OpprettMeldekortAlert
              tittel="Kan ikke forhåndsvise meldekort"
              innhold="Forhåndsvisningen funker ikke som den skal. En mulig årsak er at datoene du har valgt ikke stemmer overens med brukers meldesyklus. Prøv å justere datoene, eller ta kontakt med brukerstøtte."
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
          disabled={
            simuleringHarFeil ||
            simuleringHarOverlapp ||
            (hasPendingSubmission && fetcher.state !== "idle")
          }
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
