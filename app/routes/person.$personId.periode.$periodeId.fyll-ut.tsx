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
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import { FyllUtTabell } from "~/components/tabeller/fyll-ut/FyllUtTabell";
import { useToast } from "~/context/toast-context";
import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
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

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.periodeId, "rapportering-feilmelding-periode-id-mangler-i-url");
  const personId = params.personId;

  const periode = await hentPeriode(request, params.personId, params.periodeId);
  const saksbehandler = await hentSaksbehandler(request);
  const variant = getABTestVariant(request);

  return { periode, saksbehandler, personId, variant };
}

export default function FyllUtPeriode() {
  const navigate = useNavigate();
  const { periode, saksbehandler, personId, variant } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const { showSuccess, showError } = useToast();

  const isMountedRef = useRef(true);
  const erFraArena = periode.opprettetAv === OPPRETTET_AV.Arena;

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
        const title = fetcher.data.title || "Innsending feilet";
        let message = fetcher.data.detail;
        if (fetcher.data.correlationId) {
          message = message
            ? `${message}\n\nFeil-ID: ${fetcher.data.correlationId}`
            : `Feil-ID: ${fetcher.data.correlationId}`;
        }
        showError(title, message);
      } else if (fetcher.data.success) {
        // Vis toast først, deretter naviger
        showSuccess("Meldekortet ble sendt inn");
        setTimeout(() => {
          if (isMountedRef.current) {
            navigate(fetcher.data.redirectUrl);
          }
        }, 500); // Kort delay slik at toast rekker å vises
      }
    }
  }, [fetcher.state, fetcher.data, showSuccess, showError, navigate]);

  const handleSubmit = () => {
    // For etterregistrerte meldekort, sett alltid registrertArbeidssoker til true
    const registrertArbeidssoker =
      periode.type === MELDEKORT_TYPE.ETTERREGISTRERT
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

  const skjemaClass = variant === "C" ? `${styles.skjema} ${styles.skjemaVariantC}` : styles.skjema;

  return (
    <section aria-labelledby="fyll-ut-heading" className={styles.fyllUtContainer}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fetcher.state === "submitting" && "Sender inn meldekort..."}
        {fetcher.state === "loading" && "Behandler meldekort..."}
        {fetcher.state === "idle" && fetcher.data && fetcher.data.error && "Innsending feilet"}
        {fetcher.state === "idle" &&
          fetcher.data &&
          !fetcher.data.error &&
          "Meldekort sendt inn. Går tilbake til periodeoversikten..."}
      </div>

      <div className={skjemaClass}>
        <div className={styles.title}>
          <Heading level="1" size="medium" id="fyll-ut-heading">
            Fyll ut meldekort
          </Heading>
          <BodyLong size="small">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </BodyLong>
        </div>

        <fetcher.Form
          method="post"
          action="/api/rapportering"
          ref={skjema.refs.formRef}
          onSubmit={skjema.handlers.handleSubmit}
          className={styles.container}
        >
          <div className={styles.container}>
            <div ref={skjema.refs.aktiviteterRef} tabIndex={-1}>
              <FyllUtTabell
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
                  label="Sett meldedato"
                  placeholder="dd.mm.åååå"
                  size="small"
                  onBlur={skjema.handlers.handleMeldedatoBlur}
                  error={
                    skjema.state.visValideringsfeil.meldedato
                      ? "Meldedato er ugyldig eller må fylles ut"
                      : undefined
                  }
                />
              </DatePicker>
              {skjema.state.showArbeidssokerField && (
                <RadioGroup
                  size="small"
                  legend="Registrert som arbeidssøker de neste 14 dagene?"
                  error={
                    skjema.state.visValideringsfeil.arbeidssoker
                      ? "Du må velge om bruker skal være registrert som arbeidssøker"
                      : undefined
                  }
                  value={skjema.state.registrertArbeidssoker?.toString() || ""}
                  onChange={(val) => skjema.handlers.handleArbeidssokerChange(val === "true")}
                >
                  <Radio ref={skjema.refs.arbeidssokerRef} value="true">
                    Ja
                  </Radio>
                  <Radio value="false">Nei</Radio>
                </RadioGroup>
              )}
              {erFraArena && (
                <Alert variant="info" size="small">
                  Dette meldekortet er fra Arena og vi viser derfor ikke svar på spørsmålet om
                  arbeidssøkerregistrering.
                </Alert>
              )}
              <Textarea
                resize
                ref={skjema.refs.begrunnelseRef}
                size="small"
                label="Begrunnelse"
                name="begrunnelse"
                error={
                  skjema.state.visValideringsfeil.begrunnelse
                    ? "Begrunnelse må fylles ut"
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
              Avbryt utfylling
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              loading={fetcher.state === "submitting"}
            >
              Send inn meldekort
            </Button>
          </div>
        </fetcher.Form>

        <BekreftModal
          open={skjema.state.modalOpen}
          onClose={() => skjema.handlers.setModalOpen(false)}
          type={skjema.state.modalType}
          tittel={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT
              ? "Vil du avbryte utfyllingen?"
              : "Vil du fullføre utfyllingen?"
          }
          tekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT ? (
              <>
                Hvis du avbryter, vil <strong>ikke</strong> det du har fylt ut så langt lagres
              </>
            ) : (
              `Ved å trykke "Ja" vil utfyllingen sendes inn.`
            )
          }
          bekreftTekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT ? "Ja, avbryt" : "Ja, send inn"
          }
          avbrytTekst={
            skjema.state.modalType === MODAL_ACTION_TYPE.AVBRYT ? "Nei, fortsett" : "Nei, avbryt"
          }
          onBekreft={skjema.handlers.handleBekreft}
        />
      </div>
    </section>
  );
}
