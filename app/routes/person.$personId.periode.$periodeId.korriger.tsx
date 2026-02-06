import { Button, DatePicker, Textarea } from "@navikt/ds-react";
import { BodyLong, BodyShort, Heading } from "@navikt/ds-react";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { AktivitetsTabell } from "~/components/tabeller/aktivitets-tabell/AktivitetsTabell";
import { Kalender } from "~/components/tabeller/kalender/Kalender";
import { useToast } from "~/context/toast-context";
import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { BekreftModal } from "~/modals/BekreftModal";
import { logger } from "~/models/logger.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import { sanityClient } from "~/sanity/client";
import { korrigerQuery } from "~/sanity/fellesKomponenter/korriger/queries";
import type { IMeldekortKorriger } from "~/sanity/fellesKomponenter/korriger/types";
import stylesOriginal from "~/styles/route-styles/korriger.module.css";
import stylesVariantB from "~/styles/route-styles/korrigerVariantB.module.css";
import { getABTestVariant } from "~/utils/ab-test.server";
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

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_TEKSTER = {
  overskrift: "Korriger meldekort",
  underoverskrift: "Uke {{uker}} | {{periode}}",
  gjeldendeMeldekort: {
    overskrift: "Korrigering av følgende meldekort",
    innsendtDato: "Meldekortet ble innsendt {{dato}}",
    begrunnelseOverskrift: {
      korrigering: "Begrunnelse for korrigering",
      manuellInnsending: "Begrunnelse for innsending",
    },
  },
  korrigeringsskjema: {
    overskrift: "Registrer ny korrigering",
    skjermleserHint:
      "Gjør endringer i aktiviteter eller meldedato. Arbeid kan ikke kombineres med annet fravær enn «tiltak, kurs eller utdanning» på samme dag.",
    datovelgerLabel: "Meldedato",
    begrunnelseLabel: "Begrunnelse for korrigering",
    begrunnelseFeilmelding: "Begrunnelse må fylles ut",
  },
  knapper: {
    avbryt: "Avbryt korrigering",
    fullfoer: "Fullfør korrigering",
  },
  skjermleserStatus: {
    senderInn: "Sender inn korrigering...",
    behandler: "Behandler korrigering...",
    feilet: "Korrigering feilet",
    suksess: "Korrigering sendt inn. Går tilbake til periodeoversikten...",
  },
  bekreftModal: {
    avbrytKorrigering: {
      overskrift: "Vil du avbryte korrigeringen?",
      innhold: "Hvis du avbryter, vil ikke endringene du har gjort så langt korrigeres",
      bekreftKnapp: "Ja, avbryt",
      avbrytKnapp: "Nei, fortsett",
    },
    fullfoerKorrigering: {
      overskrift: "Vil du fullføre korrigeringen?",
      innhold: 'Ved å trykke "Ja" vil korrigeringen sendes inn.',
      bekreftKnapp: "Ja, fullfør",
      avbrytKnapp: "Nei, avbryt",
    },
  },
};

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");
  const personId = params.personId;

  const periode = await hentPeriode<IRapporteringsperiode>(request, personId, params.periodeId);
  const saksbehandler = await hentSaksbehandler(request);
  const variant = getABTestVariant(request);

  let korrigerData: IMeldekortKorriger | null = null;
  try {
    korrigerData = await sanityClient.fetch<IMeldekortKorriger>(korrigerQuery);
  } catch (error) {
    logger.error(
      `Kunne ikke hente korriger-data fra Sanity for person.${personId}.periode.${params.periodeId}.korriger`,
      { error },
    );
  }

  return { periode, saksbehandler, personId, variant, korrigerData };
}

export default function Periode() {
  const { periode, saksbehandler, personId, variant, korrigerData } =
    useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData("root");
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const styles = variant === "B" ? stylesVariantB : stylesOriginal;
  const varslerData = rootData?.sanityData?.varsler;

  // Hent tekster fra Sanity med fallback
  const tekster = {
    overskrift: korrigerData?.overskrift ?? DEFAULT_TEKSTER.overskrift,
    underoverskrift: korrigerData?.underoverskrift ?? DEFAULT_TEKSTER.underoverskrift,
    gjeldendeMeldekort: korrigerData?.gjeldendeMeldekort ?? DEFAULT_TEKSTER.gjeldendeMeldekort,
    korrigeringsskjema: korrigerData?.korrigeringsskjema ?? DEFAULT_TEKSTER.korrigeringsskjema,
    knapper: korrigerData?.knapper ?? DEFAULT_TEKSTER.knapper,
    skjermleserStatus:
      varslerData?.skjermleserStatus ??
      korrigerData?.skjermleserStatus ??
      DEFAULT_TEKSTER.skjermleserStatus,
  };

  // Hent bekreftModal fra global data
  const bekreftModalTekster = {
    avbryt:
      rootData?.sanityData?.bekreftModal?.avbrytKorrigering ??
      DEFAULT_TEKSTER.bekreftModal.avbrytKorrigering,
    fullfoer:
      rootData?.sanityData?.bekreftModal?.fullfoerKorrigering ??
      DEFAULT_TEKSTER.bekreftModal.fullfoerKorrigering,
  };

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
        const title =
          fetcher.data.title || varslerData?.feil.correctionFailedTitle || "Korrigering feilet";
        let message = fetcher.data.detail;
        if (fetcher.data.correlationId) {
          const errorText = varslerData?.feil.errorText || "Feil-ID: {{id}}";
          const errorMessage = errorText.replace("{{id}}", fetcher.data.correlationId);
          message = message ? `${message}\n\n${errorMessage}` : errorMessage;
        }
        showError(title, message);
      } else if (fetcher.data.success) {
        // Vis toast først, deretter naviger
        showSuccess(varslerData?.suksess.correctedSuccess || "Meldekortet ble korrigert");
        setTimeout(() => {
          if (isMountedRef.current) {
            navigate(fetcher.data.redirectUrl);
          }
        }, 500); // Kort delay slik at toast rekker å vises
      }
    }
  }, [fetcher.state, fetcher.data, showSuccess, showError, navigate, varslerData]);

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
  const uker = ukenummer(periode);
  const periode_tekst = `${formattertFraOgMed} - ${formattertTilOgMed}`;

  // Format innsendtTidspunkt for display
  const formattertInnsendtTidspunkt = periode.innsendtTidspunkt
    ? formatterDatoUTC({ dato: periode.innsendtTidspunkt })
    : "Ukjent tidspunkt";

  // Template-replacement for tekster
  const underoverskrift = tekster.underoverskrift
    .replace("{{uker}}", String(uker))
    .replace("{{periode}}", periode_tekst);

  const innsendtDatoTekst = tekster.gjeldendeMeldekort.innsendtDato.replace(
    "{{dato}}",
    formattertInnsendtTidspunkt,
  );

  return (
    <div className={styles.korrigeringContainer}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fetcher.state === "submitting" && tekster.skjermleserStatus.senderInn}
        {fetcher.state === "loading" && tekster.skjermleserStatus.behandler}
        {fetcher.state === "idle" &&
          fetcher.data &&
          fetcher.data.error &&
          tekster.skjermleserStatus.feilet}
        {fetcher.state === "idle" &&
          fetcher.data &&
          !fetcher.data.error &&
          tekster.skjermleserStatus.suksess}
      </div>
      <div className={styles.hvitContainer}>
        <div className={styles.maxWidth900}>
          <Heading level="1" size="medium">
            {tekster.overskrift}
          </Heading>
          <BodyLong size="small">{underoverskrift}</BodyLong>
        </div>

        <div className={`${styles.meldekortSeksjon} ${styles.maxWidth900}`}>
          <div className={styles.header}>
            <Heading level="2" size="small">
              {tekster.gjeldendeMeldekort.overskrift}
            </Heading>
            <BodyLong size="small">{innsendtDatoTekst}</BodyLong>
          </div>
          <div className={styles.kalenderOgBegrunnelseWrapper}>
            <div className={styles.kalenderContainer}>
              <Kalender periode={periode} variant={variant} />
            </div>

            {periode.begrunnelse && (
              <div className={styles.begrunnelseSeksjon}>
                <Heading level="3" size="xsmall">
                  {erKorrigering
                    ? tekster.gjeldendeMeldekort.begrunnelseOverskrift.korrigering
                    : tekster.gjeldendeMeldekort.begrunnelseOverskrift.manuellInnsending}
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
          {tekster.korrigeringsskjema.skjermleserHint}
        </div>
        <div className={`${styles.skjema} ${styles.maxWidth900}`}>
          <div>
            <Heading level="2" size="small">
              {tekster.korrigeringsskjema.overskrift}
            </Heading>
            <BodyShort size="small" className="sr-only">
              {tekster.korrigeringsskjema.skjermleserHint}
            </BodyShort>
          </div>
          <div ref={skjema.refs.aktiviteterRef} tabIndex={-1}>
            <AktivitetsTabell
              dager={korrigerteDager}
              setKorrigerteDager={skjema.handlers.handleSetKorrigerteDager}
              periode={periode.periode}
              variant={variant}
              isKorrigering={true}
            />
          </div>
          <div className={styles.annenInfo}>
            <DatePicker {...skjema.datepicker.datepickerProps}>
              <DatePicker.Input
                {...skjema.datepicker.inputProps}
                label={tekster.korrigeringsskjema.datovelgerLabel}
                placeholder="dd.mm.åååå"
                size="small"
                onBlur={skjema.handlers.handleMeldedatoBlur}
              />
            </DatePicker>
            <Textarea
              resize
              ref={skjema.refs.begrunnelseRef}
              label={tekster.korrigeringsskjema.begrunnelseLabel}
              name="begrunnelse"
              size="small"
              value={skjema.state.begrunnelse}
              onChange={(e) => skjema.handlers.handleBegrunnelseChange(e.target.value)}
              onBlur={skjema.handlers.handleBegrunnelseBlur}
              error={
                skjema.state.visValideringsfeil.begrunnelse
                  ? tekster.korrigeringsskjema.begrunnelseFeilmelding
                  : undefined
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
              {tekster.knapper.avbryt}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              loading={fetcher.state === "submitting"}
            >
              {tekster.knapper.fullfoer}
            </Button>
          </div>
        </div>
        <BekreftModal
          open={skjema.state.modalOpen}
          onClose={() => skjema.handlers.setModalOpen(false)}
          type={skjema.state.modalType}
          tittel={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT
              ? bekreftModalTekster.avbryt.overskrift
              : bekreftModalTekster.fullfoer.overskrift
          }
          tekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT
              ? bekreftModalTekster.avbryt.innhold
              : bekreftModalTekster.fullfoer.innhold
          }
          bekreftTekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT
              ? bekreftModalTekster.avbryt.bekreftKnapp
              : bekreftModalTekster.fullfoer.bekreftKnapp
          }
          avbrytTekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT
              ? bekreftModalTekster.avbryt.avbrytKnapp
              : bekreftModalTekster.fullfoer.avbrytKnapp
          }
          onBekreft={skjema.handlers.handleBekreft}
        />
      </fetcher.Form>
    </div>
  );
}
