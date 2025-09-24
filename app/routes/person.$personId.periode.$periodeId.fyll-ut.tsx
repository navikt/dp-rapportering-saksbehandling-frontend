import {
  BodyShort,
  Button,
  DatePicker,
  Heading,
  Radio,
  RadioGroup,
  Textarea,
} from "@navikt/ds-react";
import classNames from "classnames";
import { useState } from "react";
import { Form, redirect, useLoaderData, useNavigate, useSearchParams } from "react-router";
import invariant from "tiny-invariant";

import { FyllUtTabell } from "~/components/tabeller/FyllUtTabell";
import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode, oppdaterPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import {
  MODAL_ACTION_TYPE,
  QUERY_PARAMS,
  RAPPORTERINGSPERIODE_STATUS,
  REFERRER as DEFAULT_REFERRER,
  ROLLE,
} from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
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

  return { periode, personId };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.personId, "Person ID mangler");
  invariant(params.periodeId, "Periode ID mangler");

  const formData = await request.formData();
  const url = new URL(request.url);
  const referrer = url.searchParams.get("referrer") || DEFAULT_REFERRER.PERIODER;

  const personId = params.personId;
  const meldedato = formData.get("meldedato") as string;
  const registrertArbeidssoker = formData.get("registrertArbeidssoker") === "true";
  const begrunnelse = formData.get("begrunnelse") as string;
  const dagerData = formData.get("dager") as string;

  try {
    const saksbehandler = await hentSaksbehandler(request);

    const dager = JSON.parse(dagerData);

    // Sjekk om dette er en ekte korrigering (perioden har allerede data) eller første gangs utfylling

    const periode = await hentPeriode(request, personId, params.periodeId);

    const oppdatertPeriode: ISendInnMeldekort = {
      ident: periode.ident,
      id: periode.id,
      periode: periode.periode,
      registrertArbeidssoker,
      begrunnelse,
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      dager: dager.map(konverterTimerTilISO8601Varighet),
      kilde: {
        rolle: ROLLE.Saksbehandler,
        ident: saksbehandler.onPremisesSamAccountName,
      },
      meldedato,
      kanSendesFra: periode.kanSendesFra,
      sisteFristForTrekk: periode.sisteFristForTrekk,
      opprettetAv: periode.opprettetAv,
    };

    // Oppdater perioden via mock/backend
    await oppdaterPeriode({
      periode: oppdatertPeriode,
      personId,
      request,
    });

    // Redirect tilbake til riktig side
    return redirect(
      `/person/${params.personId}/${referrer}?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${params.periodeId}`,
    );
  } catch (error) {
    console.error("Feil ved oppdatering av periode:", error);
    throw new Error("Kunne ikke oppdatere periode");
  }
}

export default function FyllUtPeriode() {
  const navigate = useNavigate();
  const { periode, personId } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const referrer = searchParams.get("referrer") || DEFAULT_REFERRER.PERIODER;

  const [dager, setDager] = useState<IKorrigertDag[]>(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );

  const handleSubmit = () => {
    // Submit via form ref siden vi trenger native form submission
    if (skjema.refs.formRef.current) {
      skjema.refs.formRef.current.submit();
    }
  };

  const handleCancel = () => {
    navigate(
      `/person/${personId}/${referrer}?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}`,
    );
  };

  const skjema = useMeldekortSkjema({
    periode,
    dager,
    setKorrigerteDager: setDager,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    showArbeidssokerField: true,
  });

  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, format: DatoFormat.Kort });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, format: DatoFormat.Kort });

  return (
    <section aria-labelledby="fyll-ut-heading" className={styles.fyllroot}>
      <div className={styles.skjema}>
        <div className={styles.title}>
          <Heading level="1" size="small" id="fyll-ut-heading">
            Fyll ut meldekort
          </Heading>
          <BodyShort size="small">
            Uke {ukenummer(periode)} | {formattertFraOgMed} - {formattertTilOgMed}
          </BodyShort>
        </div>

        <Form method="post" ref={skjema.refs.formRef} onSubmit={skjema.handlers.handleSubmit}>
          <div
            className={classNames(styles.inputs, {
              [styles.reverse]: referrer === DEFAULT_REFERRER.PERIODER,
            })}
          >
            <fieldset className={styles.fieldset} ref={skjema.refs.aktiviteterRef} tabIndex={-1}>
              <legend className="sr-only">Aktiviteter per dag</legend>
              <FyllUtTabell
                dager={dager}
                setKorrigerteDager={skjema.handlers.handleSetKorrigerteDager}
                periode={periode.periode}
              />
            </fieldset>
            <fieldset className={classNames(styles.details, styles.fieldset)}>
              <legend className="sr-only">Grunnleggende informasjon</legend>
              <div>
                <DatePicker {...skjema.datepicker.datepickerProps}>
                  <DatePicker.Input
                    {...skjema.datepicker.inputProps}
                    ref={skjema.refs.meldedatoRef}
                    label="Sett meldedato"
                    placeholder="dd.mm.åååå"
                    size="small"
                    error={
                      skjema.state.visValideringsfeil.meldedato
                        ? "Meldedato må fylles ut"
                        : undefined
                    }
                  />
                </DatePicker>
              </div>
              <div>
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
              </div>
              <div className={styles.begrunnelse}>
                <Textarea
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
                  rows={3}
                />
              </div>
            </fieldset>
          </div>

          {skjema.state.visValideringsfeil.aktiviteter && (
            <div className="navds-error-message navds-error-message--medium" role="alert">
              Du må fylle ut minst én gyldig aktivitet. Arbeidsaktiviteter må ha minimum 0,5 timer,
              eller la feltet stå tomt hvis ingen arbeid.
            </div>
          )}
          <div className={styles.handlinger}>
            <Button variant="secondary" size="small" onClick={skjema.handlers.handleAvbryt}>
              Avbryt utfylling
            </Button>
            <Button type="submit" variant="primary" size="small">
              Send inn meldekort
            </Button>
          </div>
          {/* Skjulte input felter for form data */}
          <input type="hidden" name="meldedato" value={skjema.hiddenFormValues.meldedato} />
          <input
            type="hidden"
            name="registrertArbeidssoker"
            value={skjema.hiddenFormValues.registrertArbeidssoker}
          />
          <input type="hidden" name="begrunnelse" value={skjema.hiddenFormValues.begrunnelse} />
          <input type="hidden" name="dager" value={skjema.hiddenFormValues.dager} />
        </Form>

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
