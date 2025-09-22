import { Alert, Button, DatePicker, Textarea } from "@navikt/ds-react";
import { BodyShort, Heading, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useNavigate, useSearchParams } from "react-router";
import invariant from "tiny-invariant";

import { Forhandsvisning } from "~/components/rapporteringsperiode-visning/Forhandsvisning";
import { FyllUtTabell } from "~/components/tabeller/FyllUtTabell";
import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import { MODAL_ACTION_TYPE } from "~/utils/constants";
import { QUERY_PARAMS, REFERRER as DEFAULT_REFERRER } from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
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
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get("referrer") || DEFAULT_REFERRER.PERIODER;

  // API handles redirect after successful submission

  const [korrigertPeriode, setKorrigertPeriode] = useState<IRapporteringsperiode>(periode);
  const [korrigerteDager, setKorrigerteDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );
  const [visIngenEndringerFeil, setVisIngenEndringerFeil] = useState(false);

  const initialMeldedato = periode.meldedato ? new Date(periode.meldedato) : undefined;

  const handleSubmit = (data: {
    meldedato: Date | undefined;
    registrertArbeidssoker?: boolean | null;
    begrunnelse: string;
    dager: IKorrigertDag[];
  }) => {
    // Sjekk om det er gjort endringer
    const harMeldedatoEndringer =
      data.meldedato && format(data.meldedato, "yyyy-MM-dd") !== periode.meldedato;
    const harDagEndringer =
      JSON.stringify(korrigertPeriode.dager) !== JSON.stringify(periode.dager);
    const harEndringer = harMeldedatoEndringer || harDagEndringer;

    if (!harEndringer) {
      setVisIngenEndringerFeil(true);
      return;
    }

    setVisIngenEndringerFeil(false);

    // Send inn via fetcher
    fetcher.submit(
      { rapporteringsperiode: JSON.stringify(korrigertPeriode), personId, referrer },
      { method: "post", action: "/api/rapportering" },
    );
  };

  const handleCancel = () => {
    navigate(
      `/person/${personId}/${referrer}?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}`,
    );
  };

  const skjema = useMeldekortSkjema({
    periode,
    dager: korrigerteDager,
    setKorrigerteDager: setKorrigerteDager,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    showArbeidssokerField: false, // Korriger viser ikke arbeidssøker felt
    initialMeldedato,
    initialBegrunnelse: "",
  });

  useEffect(() => {
    setKorrigertPeriode((prev) => ({
      ...prev,
      meldedato: skjema.state.valgtDato
        ? format(skjema.state.valgtDato, "yyyy-MM-dd")
        : prev.meldedato,
      dager: korrigerteDager.map(konverterTimerTilISO8601Varighet),
      begrunnelse: skjema.state.begrunnelse,
      kilde: {
        rolle: "Saksbehandler",
        ident: saksbehandler.onPremisesSamAccountName,
      },
    }));
  }, [korrigerteDager, skjema.state.begrunnelse, skjema.state.valgtDato, saksbehandler]);

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });
  const erKorrigering = !!periode.originalMeldekortId;

  return (
    <div className={styles.rapporteringsperiode}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fetcher.state === "submitting" && "Sender inn korrigering..."}
        {fetcher.state === "loading" && "Behandler korrigering..."}
        {fetcher.state === "idle" &&
          fetcher.data &&
          !fetcher.data.error &&
          "Korrigering sendt inn. Går tilbake til periodeoversikten..."}
        {fetcher.data?.error && `Feil ved innsending: ${fetcher.data.error}`}
      </div>

      {fetcher.data?.error && (
        <Alert variant="error" className={styles.errorAlert} role="alert">
          <Heading size="small">Feil ved innsending av korrigering</Heading>
          <BodyShort>{fetcher.data.error}</BodyShort>
          {fetcher.data.details && (
            <BodyShort size="small">Detaljer: {fetcher.data.details}</BodyShort>
          )}
        </Alert>
      )}
      <div className={classNames(styles.periodeOverskrift, styles.title)}>
        <Heading level="1" size="medium">
          Korriger meldekort
        </Heading>
        <BodyShort size="small">
          Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
        </BodyShort>
      </div>

      <div
        className={styles.grid}
        role="region"
        aria-label="Sammenligning av opprinnelig og korrigert meldekort"
      >
        <section className={styles.uendretPeriode}>
          <Heading id="original-heading" level="2" size="small" className="sr-only">
            Opprinnelig meldekort
          </Heading>
          <Tag variant="info" size="small">
            Sist beregnet
          </Tag>
          <Forhandsvisning periode={periode} />
          {periode.begrunnelse && (
            <div className={styles.begrunnelseVisning}>
              <Heading level="3" size="small">
                Begrunnelse for {erKorrigering ? "korrigering" : "innsending"}
              </Heading>
              <BodyShort>{periode.begrunnelse}</BodyShort>
            </div>
          )}
        </section>
      </div>

      <fetcher.Form
        className={styles.korrigering}
        aria-label="Korrigeringsverktøy"
        action="/api/rapportering"
        method="post"
        ref={skjema.refs.formRef}
        onSubmit={skjema.handlers.handleSubmit}
      >
        <div className="sr-only" aria-live="polite">
          For å sende inn korrigering må du fylle ut begrunnelse og gjøre minst én endring
        </div>
        <div
          className={classNames(styles.inputs, {
            [styles.reverse]: referrer === DEFAULT_REFERRER.PERIODER,
          })}
        >
          <fieldset className={styles.fieldset} ref={skjema.refs.aktiviteterRef} tabIndex={-1}>
            <legend className="sr-only">Aktiviteter per dag</legend>
            <FyllUtTabell
              dager={korrigerteDager}
              setKorrigerteDager={skjema.handlers.handleSetKorrigerteDager}
              periode={periode.periode}
            />
          </fieldset>
          <div className={styles.inputRad}>
            <DatePicker {...skjema.datepicker.datepickerProps}>
              <DatePicker.Input
                {...skjema.datepicker.inputProps}
                label="Meldedato"
                placeholder="dd.mm.åååå"
                size="small"
              />
            </DatePicker>

            <Textarea
              ref={skjema.refs.begrunnelseRef}
              label="Begrunnelse for korrigering"
              name="begrunnelse"
              size="small"
              value={skjema.state.begrunnelse}
              onChange={(e) => skjema.handlers.handleBegrunnelseChange(e.target.value)}
              error={
                skjema.state.visValideringsfeil.begrunnelse
                  ? "Begrunnelse må fylles ut"
                  : skjema.state.begrunnelse.trim() === "" && skjema.state.hasChanges
                    ? "Begrunnelse må fylles ut når du gjør endringer"
                    : undefined
              }
              className={styles.begrunnelse}
            />
          </div>
        </div>
        <div className={styles.handlinger}>
          {visIngenEndringerFeil && (
            <div className="navds-error-message navds-error-message--medium" role="alert">
              Du må gjøre endringer for å kunne korrigere
            </div>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={skjema.handlers.handleAvbryt}
            size="small"
          >
            Avbryt korrigering
          </Button>
          <Button type="submit" variant="primary" size="small">
            Fullfør korrigering
          </Button>
        </div>

        <input type="hidden" name="rapporteringsperiode" value={JSON.stringify(korrigertPeriode)} />
        <input type="hidden" name="personId" value={personId} />

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
