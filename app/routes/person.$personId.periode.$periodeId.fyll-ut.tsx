import {
  Alert,
  BodyLong,
  Button,
  DatePicker,
  Heading,
  Radio,
  RadioGroup,
  Textarea,
} from "@navikt/ds-react";
import classNames from "classnames";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData, useNavigate, useRouteLoaderData } from "react-router";
import invariant from "tiny-invariant";

import { AktivitetsTabell } from "~/components/tabeller/aktivitets-tabell/AktivitetsTabell";
import { useToast } from "~/context/toast-context";
import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { BekreftModal } from "~/modals/BekreftModal";
import { logger } from "~/models/logger.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import { sanityClient } from "~/sanity/client";
import { fyllUtQuery } from "~/sanity/fellesKomponenter/fyll-ut/queries";
import type { IMeldekortFyllUt } from "~/sanity/fellesKomponenter/fyll-ut/types";
import styles from "~/styles/route-styles/fyllUt.module.css";
import { getABTestVariant } from "~/utils/ab-test.server";
import {
  MELDEKORT_TYPE,
  MODAL_ACTION_TYPE,
  OPPRETTET_AV,
  QUERY_PARAMS,
  RAPPORTERINGSPERIODE_STATUS,
  ROLLE,
} from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import { addDemoParamsToURL, buildURLWithDemoParams } from "~/utils/demo-params.utils";
import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
} from "~/utils/korrigering.utils";
import type { ISendInnMeldekort } from "~/utils/types";

import type { Route } from "./+types/person.$personId.periode.$periodeId.fyll-ut";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_TEKSTER = {
  overskrift: "Fyll ut meldekort",
  underoverskrift: "Uke {{uker}} | {{periode}}",
  infovarsler: {
    arenaVarsel:
      "Dette meldekortet er fra Arena og har derfor ikke svar på spørsmål om arbeidssøkerregistrering.",
    etterregistrertVarsel: "Dette meldekortet er av typen Etterregistrert",
  },
  utfyllingsskjema: {
    datovelgerLabel: "Sett meldedato",
    arbeidssoekerSpoersmaal: {
      tittel: "Registrert som arbeidssøker de neste 14 dagene?",
      ja: "Ja",
      nei: "Nei",
    },
    begrunnelseLabel: "Begrunnelse",
  },
  feilmeldinger: {
    datovelgerFeil: "Meldedato er ugyldig eller må fylles ut",
    arbeidssoekerFeil: "Du må velge om bruker skal være registrert som arbeidssøker",
    begrunnelseFeil: "Begrunnelse må fylles ut",
  },
  knapper: {
    avbryt: "Avbryt utfylling",
    sendInn: "Send inn meldekort",
  },
};

// BekreftModal hentes fra global Sanity-data, ikke lokale defaults
// Disse brukes kun som siste fallback
const DEFAULT_BEKREFT_MODAL = {
  avbrytUtfylling: {
    overskrift: "Vil du avbryte utfyllingen?",
    innhold: "Hvis du avbryter, vil ikke det du har fylt ut så langt lagres",
    bekreftKnapp: "Ja, avbryt",
    avbrytKnapp: "Nei, fortsett",
  },
  fullfoerUtfylling: {
    overskrift: "Vil du fullføre utfyllingen?",
    innhold: 'Ved å trykke "Ja" vil utfyllingen sendes inn.',
    bekreftKnapp: "Ja, send inn",
    avbrytKnapp: "Nei, avbryt",
  },
};

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");
  const personId = params.personId;

  const periode = await hentPeriode(request, params.personId, params.periodeId);
  const saksbehandler = await hentSaksbehandler(request);
  const variant = getABTestVariant(request);

  // Hent fyll-ut innhold fra Sanity
  let fyllUtData: IMeldekortFyllUt | null = null;
  try {
    fyllUtData = await sanityClient.fetch<IMeldekortFyllUt>(fyllUtQuery);
  } catch (error) {
    logger.error(
      `Kunne ikke hente fyll-ut data fra Sanity for person.${personId}.periode.${params.periodeId}.fyll-ut`,
      { error },
    );
  }

  return { periode, saksbehandler, personId, variant, fyllUtData };
}

export default function FyllUtPeriode() {
  const navigate = useNavigate();
  const { periode, saksbehandler, personId, variant, fyllUtData } = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData("root");
  const fetcher = useFetcher();
  const { showSuccess, showError } = useToast();
  const varslerData = rootData?.sanityData?.varsler;

  const isMountedRef = useRef(true);
  const erFraArena = periode.opprettetAv === OPPRETTET_AV.Arena;
  const erEtterregistrert = periode.type === MELDEKORT_TYPE.ETTERREGISTRERT;

  // Kombiner defaults med Sanity-data - Sanity overstyrer, defaults fyller inn hull
  const tekster = { ...DEFAULT_TEKSTER, ...(fyllUtData ?? {}) };

  // Hent bekreftModal fra global data
  const bekreftModalTekster = {
    avbryt:
      rootData?.sanityData?.bekreftModal?.avbrytUtfylling ?? DEFAULT_BEKREFT_MODAL.avbrytUtfylling,
    fullfoer:
      rootData?.sanityData?.bekreftModal?.fullfoerUtfylling ??
      DEFAULT_BEKREFT_MODAL.fullfoerUtfylling,
  };

  const [dager, setDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );

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
          fetcher.data.title || varslerData?.feil.submissionFailedTitle || "Innsending feilet";
        let message = fetcher.data.detail;
        if (fetcher.data.correlationId) {
          const errorText = varslerData?.feil.errorText || "Feil-ID: {{id}}";
          const errorMessage = errorText.replace("{{id}}", fetcher.data.correlationId);
          message = message ? `${message}\n\n${errorMessage}` : errorMessage;
        }
        showError(title, message);
      } else if (fetcher.data.success) {
        // Vis toast først, deretter naviger
        showSuccess(varslerData?.suksess.submittedSuccess || "Meldekortet ble sendt inn");
        setTimeout(() => {
          if (isMountedRef.current) {
            navigate(fetcher.data.redirectUrl);
          }
        }, 500); // Kort delay slik at toast rekker å vises
      }
    }
  }, [fetcher.state, fetcher.data, showSuccess, showError, navigate, varslerData]);

  const handleSubmit = () => {
    // For etterregistrerte meldekort, sett alltid registrertArbeidssoker til true
    const registrertArbeidssoker = erEtterregistrert
      ? true
      : (skjema.state.registrertArbeidssoker ?? false);

    const oppdatertPeriode: ISendInnMeldekort = {
      ident: periode.ident,
      id: periode.id,
      periode: periode.periode,
      registrertArbeidssoker,
      begrunnelse: skjema.state.begrunnelse,
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      dager: dager.map(konverterTimerTilISO8601Varighet),
      kilde: {
        rolle: ROLLE.Saksbehandler,
        ident: saksbehandler.onPremisesSamAccountName,
      },
      meldedato: skjema.state.valgtDato ? format(skjema.state.valgtDato, "yyyy-MM-dd") : null,
      kanSendesFra: periode.kanSendesFra,
      sisteFristForTrekk: periode.sisteFristForTrekk,
      opprettetAv: periode.opprettetAv,
    };

    const actionUrl = new URL("/api/rapportering", window.location.origin);
    addDemoParamsToURL(actionUrl);

    fetcher.submit(
      { rapporteringsperiode: JSON.stringify(oppdatertPeriode), personId },
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
    dager,
    setKorrigerteDager: setDager,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    meldekortType: periode.type,
    opprettetAv: periode.opprettetAv,
  });

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  // Generer underoverskrift med template variables
  const underoverskriftTekst = tekster.underoverskrift
    .replace("{{uker}}", String(ukenummer(periode)))
    .replace("{{periode}}", `${formattertFraOgMed} - ${formattertTilOgMed}`);

  const skjemaClass = styles.skjema;

  return (
    <section aria-labelledby="fyll-ut-heading" className={styles.fyllUtContainer}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fetcher.state === "submitting" &&
          (varslerData?.skjermleserStatus.senderInn || "Sender inn meldekort...")}
        {fetcher.state === "loading" &&
          (varslerData?.skjermleserStatus.behandler || "Behandler meldekort...")}
        {fetcher.state === "idle" &&
          fetcher.data &&
          fetcher.data.error &&
          (varslerData?.skjermleserStatus.feilet || "Innsending feilet")}
        {fetcher.state === "idle" &&
          fetcher.data &&
          !fetcher.data.error &&
          "Meldekort sendt inn. Går tilbake til periodeoversikten..."}
      </div>

      <div className={skjemaClass}>
        <div className={styles.title}>
          <Heading level="1" size="medium" id="fyll-ut-heading">
            {tekster.overskrift}
          </Heading>
          <BodyLong size="small">{underoverskriftTekst}</BodyLong>
        </div>

        {erFraArena && (
          <Alert variant="info" size="small">
            {tekster.infovarsler.arenaVarsel}
          </Alert>
        )}

        {erEtterregistrert && (
          <Alert variant="info" size="small">
            {tekster.infovarsler.etterregistrertVarsel}
          </Alert>
        )}

        <fetcher.Form
          method="post"
          action="/api/rapportering"
          ref={skjema.refs.formRef}
          onSubmit={skjema.handlers.handleSubmit}
          className={styles.container}
        >
          <div className={styles.container}>
            <div ref={skjema.refs.aktiviteterRef} tabIndex={-1}>
              <AktivitetsTabell
                dager={dager}
                setKorrigerteDager={skjema.handlers.handleSetKorrigerteDager}
                periode={periode.periode}
                variant={variant}
              />
            </div>
            <fieldset className={classNames(styles.detaljer, styles.fieldset)}>
              <legend className="sr-only">Grunnleggende informasjon</legend>
              <DatePicker {...skjema.datepicker.datepickerProps}>
                <DatePicker.Input
                  {...skjema.datepicker.inputProps}
                  ref={skjema.refs.meldedatoRef}
                  label={tekster.utfyllingsskjema.datovelgerLabel}
                  placeholder="dd.mm.åååå"
                  size="small"
                  onBlur={skjema.handlers.handleMeldedatoBlur}
                  error={
                    skjema.state.visValideringsfeil.meldedato
                      ? tekster.feilmeldinger.datovelgerFeil
                      : undefined
                  }
                />
              </DatePicker>
              {skjema.state.showArbeidssokerField && (
                <RadioGroup
                  readOnly={erEtterregistrert}
                  size="small"
                  legend={tekster.utfyllingsskjema.arbeidssoekerSpoersmaal.tittel}
                  error={
                    skjema.state.visValideringsfeil.arbeidssoker
                      ? tekster.feilmeldinger.arbeidssoekerFeil
                      : undefined
                  }
                  value={skjema.state.registrertArbeidssoker?.toString() || ""}
                  onChange={(val) => skjema.handlers.handleArbeidssokerChange(val === "true")}
                >
                  <Radio ref={skjema.refs.arbeidssokerRef} value="true">
                    {tekster.utfyllingsskjema.arbeidssoekerSpoersmaal.ja}
                  </Radio>
                  <Radio value="false">
                    {tekster.utfyllingsskjema.arbeidssoekerSpoersmaal.nei}
                  </Radio>
                </RadioGroup>
              )}
              <Textarea
                resize
                ref={skjema.refs.begrunnelseRef}
                size="small"
                label={tekster.utfyllingsskjema.begrunnelseLabel}
                name="begrunnelse"
                error={
                  skjema.state.visValideringsfeil.begrunnelse
                    ? tekster.feilmeldinger.begrunnelseFeil
                    : undefined
                }
                value={skjema.state.begrunnelse}
                onChange={(e) => skjema.handlers.handleBegrunnelseChange(e.target.value)}
                onBlur={skjema.handlers.handleBegrunnelseBlur}
                rows={3}
                className={styles.begrunnelse}
              />
            </fieldset>
          </div>

          <div className={styles.handlinger}>
            <Button
              variant="secondary"
              size="small"
              onClick={skjema.handlers.handleAvbryt}
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
              {tekster.knapper.sendInn}
            </Button>
          </div>
        </fetcher.Form>

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
      </div>
    </section>
  );
}
