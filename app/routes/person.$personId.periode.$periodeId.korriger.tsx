import { Button, DatePicker, Textarea } from "@navikt/ds-react";
import { BodyLong, BodyShort, Heading } from "@navikt/ds-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import { FyllUtTabell } from "~/components/tabeller/fyll-ut/FyllUtTabell";
import { Kalender } from "~/components/tabeller/kalender/Kalender";
import { useToast } from "~/context/toast-context";
import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/styles/route-styles/korriger.module.css";
import { MODAL_ACTION_TYPE } from "~/utils/constants";
import { QUERY_PARAMS } from "~/utils/constants";
import { DatoFormat, formatterDato, formatterDatoUTC, ukenummer } from "~/utils/dato.utils";
import { addDemoParamsToURL, buildURLWithDemoParams } from "~/utils/demo-params.utils";
import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
} from "~/utils/korrigering.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import type { Route } from "../+types/root";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");
  const personId = params.personId;

  const periode = await hentPeriode<IRapporteringsperiode>(request, personId, params.periodeId);
  const saksbehandler = await hentSaksbehandler(request);

  return { periode, saksbehandler, personId };
}

export default function Periode() {
  const { periode, saksbehandler, personId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const isMountedRef = useRef(true);

  const [korrigerteDager, setKorrigerteDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );

  const initialMeldedato = periode.meldedato ? new Date(periode.meldedato) : undefined;

  // Cleanup ved unmount eller navigering
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Håndter suksess eller feil etter submit
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && isMountedRef.current) {
      if (fetcher.data.error) {
        // Vis error toast med detaljert informasjon
        const title = fetcher.data.title || "Korrigering feilet";
        let message = fetcher.data.detail;
        if (fetcher.data.correlationId) {
          message = message
            ? `${message}\n\nFeil-ID: ${fetcher.data.correlationId}`
            : `Feil-ID: ${fetcher.data.correlationId}`;
        }
        showError(title, message);
      } else if (fetcher.data.success) {
        // Vis toast først, deretter naviger
        showSuccess("Meldekortet ble korrigert");
        setTimeout(() => {
          if (isMountedRef.current) {
            navigate(fetcher.data.redirectUrl);
          }
        }, 500); // Kort delay slik at toast rekker å vises
      }
    }
  }, [fetcher.state, fetcher.data, showSuccess, showError, navigate]);

  const handleSubmit = () => {
    // Send kun IKorrigerMeldekort felter - ikke hele IRapporteringsperiode
    // Dette unngår at API-ruten feiltolker requesten som en oppdatering
    const korrigertPeriode = {
      ident: periode.ident,
      originalMeldekortId: periode.id,
      periode: periode.periode,
      dager: korrigerteDager.map(konverterTimerTilISO8601Varighet),
      kilde: {
        rolle: "Saksbehandler",
        ident: saksbehandler.onPremisesSamAccountName,
      },
      begrunnelse: skjema.state.begrunnelse,
      meldedato: skjema.state.valgtDato
        ? format(skjema.state.valgtDato, "yyyy-MM-dd")
        : periode.meldedato!,
    };

    const actionUrl = new URL("/api/rapportering", window.location.origin);
    addDemoParamsToURL(actionUrl);

    fetcher.submit(
      { rapporteringsperiode: JSON.stringify(korrigertPeriode), personId },
      { method: "post", action: actionUrl.pathname + actionUrl.search },
    );
  };

  const handleCancel = () => {
    const cancelUrl = buildURLWithDemoParams(`/person/${personId}/perioder`, {
      [QUERY_PARAMS.AAR]: new Date(periode.periode.fraOgMed).getFullYear().toString(),
      [QUERY_PARAMS.RAPPORTERINGSID]: periode.id,
    });
    navigate(cancelUrl);
  };

  const skjema = useMeldekortSkjema({
    periode,
    dager: korrigerteDager,
    setKorrigerteDager: setKorrigerteDager,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    isKorrigering: true,
    initialMeldedato,
    initialBegrunnelse: "",
    originalData: {
      meldedato: periode.meldedato,
      dager: periode.dager,
    },
  });

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });
  const erKorrigering = !!periode.originalMeldekortId;

  return (
    <div className={styles.korrigeringContainer}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fetcher.state === "submitting" && "Sender inn korrigering..."}
        {fetcher.state === "loading" && "Behandler korrigering..."}
        {fetcher.state === "idle" && fetcher.data && fetcher.data.error && "Korrigering feilet"}
        {fetcher.state === "idle" &&
          fetcher.data &&
          !fetcher.data.error &&
          "Korrigering sendt inn. Går tilbake til periodeoversikten..."}
      </div>
      <div className={styles.hvitContainer}>
        <div className={styles.maxWidth900}>
          <Heading level="1" size="medium">
            Korriger meldekort
          </Heading>
          <BodyLong size="small">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </BodyLong>
        </div>

        <div className={`${styles.meldekortSeksjon} ${styles.maxWidth900}`}>
          <div className={styles.header}>
            <Heading level="2" size="small">
              Korrigering av følgende meldekort
            </Heading>
            <BodyLong size="small">
              Meldekortet ble innsendt{" "}
              {periode.innsendtTidspunkt
                ? formatterDatoUTC({ dato: periode.innsendtTidspunkt })
                : "Ukjent tidspunkt"}
            </BodyLong>
          </div>
          <div className={styles.kalenderOgBegrunnelseWrapper}>
            <div className={styles.kalenderContainer}>
              <Kalender periode={periode} variant="horizontal" />
            </div>

            {periode.begrunnelse && (
              <div className={styles.begrunnelseSeksjon}>
                <Heading level="3" size="xsmall">
                  Begrunnelse for {erKorrigering ? "korrigering" : "innsending"}
                </Heading>
                <BodyShort size="small" className={styles.kompaktTekst}>
                  {periode.begrunnelse}
                </BodyShort>
              </div>
            )}
          </div>
        </div>
      </div>

      <fetcher.Form
        className={styles.hvitContainer}
        aria-label="Korrigeringsverktøy"
        action="/api/rapportering"
        method="post"
        ref={skjema.refs.formRef}
        onSubmit={skjema.handlers.handleSubmit}
        noValidate
      >
        <div className="sr-only" aria-live="polite">
          For å sende inn korrigering må du fylle ut begrunnelse og gjøre minst én endring
        </div>
        <div className={`${styles.skjema} ${styles.maxWidth900}`}>
          <div>
            <Heading level="2" size="small">
              Registrer ny korrigering
            </Heading>
            <BodyShort size="small" className="sr-only">
              Gjør endringer i aktiviteter eller meldedato. Arbeid kan ikke kombineres med annet
              fravær enn «tiltak, kurs eller utdanning» på samme dag.
            </BodyShort>
          </div>
          <div ref={skjema.refs.aktiviteterRef} tabIndex={-1}>
            <FyllUtTabell
              dager={korrigerteDager}
              setKorrigerteDager={skjema.handlers.handleSetKorrigerteDager}
              periode={periode.periode}
            />
          </div>
          <div className={styles.annenInfo}>
            <DatePicker {...skjema.datepicker.datepickerProps}>
              <DatePicker.Input
                {...skjema.datepicker.inputProps}
                label="Meldedato"
                placeholder="dd.mm.åååå"
                size="small"
                onBlur={skjema.handlers.handleMeldedatoBlur}
              />
            </DatePicker>
            <Textarea
              resize
              ref={skjema.refs.begrunnelseRef}
              label="Begrunnelse for korrigering"
              name="begrunnelse"
              size="small"
              value={skjema.state.begrunnelse}
              onChange={(e) => skjema.handlers.handleBegrunnelseChange(e.target.value)}
              onBlur={skjema.handlers.handleBegrunnelseBlur}
              error={
                skjema.state.visValideringsfeil.begrunnelse ? "Begrunnelse må fylles ut" : undefined
              }
              className={styles.begrunnelse}
            />
          </div>
          <div className={styles.knapper}>
            {skjema.state.visValideringsfeil.aktiviteter && (
              <div className="navds-error-message navds-error-message--medium" role="alert">
                {skjema.feilmeldinger.aktiviteter}
              </div>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={skjema.handlers.handleAvbryt}
              size="small"
              disabled={fetcher.state === "submitting"}
            >
              Avbryt korrigering
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              loading={fetcher.state === "submitting"}
            >
              Fullfør korrigering
            </Button>
          </div>
        </div>
        <BekreftModal
          open={skjema.state.modalOpen}
          onClose={() => skjema.handlers.setModalOpen(false)}
          type={skjema.state.modalType}
          tittel={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT
              ? "Vil du avbryte korrigeringen?"
              : "Vil du fullføre korrigeringen?"
          }
          tekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT ? (
              <>
                Hvis du avbryter, vil <strong>ikke</strong> endringene du har gjort så langt
                korrigeres
              </>
            ) : (
              `Ved å trykke "Ja" vil korrigeringen sendes inn.`
            )
          }
          bekreftTekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT ? "Ja, avbryt" : "Ja, fullfør"
          }
          avbrytTekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT ? "Nei, fortsett" : "Nei, avbryt"
          }
          onBekreft={skjema.handlers.handleBekreft}
        />
      </fetcher.Form>
    </div>
  );
}
