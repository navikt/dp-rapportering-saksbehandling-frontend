import { Alert, Button, DatePicker, Textarea } from "@navikt/ds-react";
import { BodyShort, Heading, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "react-router";
import invariant from "tiny-invariant";

import {
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
} from "~/components/korrigering/korrigering.utils";
import { Forhandsvisning } from "~/components/rapporteringsperiode-visning/Forhandsvisning";
import { FyllUtTabell } from "~/components/tabeller/FyllUtTabell";
import { useNavigationWarning } from "~/hooks/useNavigationWarning";
import { BekreftModal } from "~/modals/BekreftModal";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentSaksbehandler } from "~/models/saksbehandler.server";
import styles from "~/route-styles/periode.module.css";
import { MODAL_ACTION_TYPE } from "~/utils/constants";
import { QUERY_PARAMS } from "~/utils/constants";
import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
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

  // Naviger tilbake ved suksess
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error) {
      // Kort delay for å la brukeren få med seg suksess-meldingen
      setTimeout(() => {
        navigate(
          `/person/${personId}/perioder?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}&${QUERY_PARAMS.OPPDATERT}=${periode.id}`,
        );
      }, 1000);
    }
  }, [fetcher.state, fetcher.data, navigate, personId, periode]);

  const [korrigertPeriode, setKorrigertPeriode] = useState<IRapporteringsperiode>(periode);
  const [korrigerteDager, setKorrigerteDager] = useState(
    periode.dager.map(konverterTimerFraISO8601Varighet),
  );
  const [korrigertMeldedato, setKorrigertMeldedato] = useState<Date | undefined>(
    periode.meldedato ? new Date(periode.meldedato) : undefined,
  );
  const [korrigertBegrunnelse, setKorrigertBegrunnelse] = useState<string>("");
  const [visBegrunnelseFeil, setVisBegrunnelseFeil] = useState(false);
  const [visIngenEndringerFeil, setVisIngenEndringerFeil] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  const harMeldedatoEndringer =
    korrigertMeldedato && format(korrigertMeldedato, "yyyy-MM-dd") !== periode.meldedato;
  const harDagEndringer = JSON.stringify(korrigertPeriode.dager) !== JSON.stringify(periode.dager);
  const harEndringer = harMeldedatoEndringer || harDagEndringer;
  const hasChanges = harEndringer || korrigertBegrunnelse.trim() !== "";

  const { disableWarning } = useNavigationWarning({ hasChanges });

  useEffect(() => {
    setKorrigertPeriode((prev) => ({
      ...prev,
      meldedato: korrigertMeldedato ? format(korrigertMeldedato, "yyyy-MM-dd") : prev.meldedato,
      dager: korrigerteDager.map(konverterTimerTilISO8601Varighet),
      begrunnelse: korrigertBegrunnelse,
      kilde: {
        rolle: "Saksbehandler",
        ident: saksbehandler.onPremisesSamAccountName,
      },
    }));
  }, [korrigerteDager, korrigertBegrunnelse, korrigertMeldedato, saksbehandler]);

  const handleDateSelect = (date?: Date) => {
    setKorrigertMeldedato(date);
  };

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleBekreft = () => {
    if (modalType === MODAL_ACTION_TYPE.FULLFOR) {
      disableWarning();
      // Send inn via fetcher siden vi nå har bekreftet
      fetcher.submit(
        { rapporteringsperiode: JSON.stringify(korrigertPeriode), personId },
        { method: "post", action: "/api/rapportering" },
      );
    } else if (modalType === MODAL_ACTION_TYPE.AVBRYT) {
      disableWarning();
      navigate(
        `/person/${personId}/perioder?${QUERY_PARAMS.AAR}=${new Date(periode.periode.fraOgMed).getFullYear()}&${QUERY_PARAMS.RAPPORTERINGSID}=${periode.id}`,
      );
    }
    setModalOpen(false);
  };

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
        onSubmit={(e) => {
          e.preventDefault();
          if (korrigertBegrunnelse.trim() === "") {
            setVisBegrunnelseFeil(true);
            setVisIngenEndringerFeil(false);
            // Focus på begrunnelse-feltet hvis det er tomt
            const begrunnelseInput = document.querySelector(
              '[name="begrunnelse"]',
            ) as HTMLTextAreaElement;
            begrunnelseInput?.focus();
            return;
          }
          if (!harEndringer) {
            setVisIngenEndringerFeil(true);
            setVisBegrunnelseFeil(false);
            return;
          }
          setVisBegrunnelseFeil(false);
          setVisIngenEndringerFeil(false);
          openModal(MODAL_ACTION_TYPE.FULLFOR);
        }}
      >
        <div className="sr-only" aria-live="polite">
          For å sende inn korrigering må du fylle ut begrunnelse og gjøre minst én endring
        </div>
        <div className={styles.inputRad}>
          <DatePicker
            mode="single"
            selected={korrigertMeldedato}
            onSelect={handleDateSelect}
            defaultMonth={korrigertMeldedato}
            toDate={new Date()}
            fromDate={subDays(new Date(periode.periode.tilOgMed), 1)}
          >
            <DatePicker.Input
              label="Meldedato"
              size="small"
              onChange={() => {}} // Fikser onChange warning - DatePicker håndterer dette via onSelect
              value={
                korrigertMeldedato
                  ? formatterDato({
                      dato: korrigertMeldedato.toISOString(),
                      format: DatoFormat.Kort,
                    })
                  : ""
              }
            />
          </DatePicker>

          <Textarea
            label="Begrunnelse for korrigering"
            name="begrunnelse"
            size="small"
            value={korrigertBegrunnelse}
            onChange={(e) => {
              setKorrigertBegrunnelse(e.target.value);
              if (visBegrunnelseFeil && e.target.value.trim() !== "") {
                setVisBegrunnelseFeil(false);
              }
            }}
            error={
              visBegrunnelseFeil
                ? "Begrunnelse må fylles ut"
                : korrigertBegrunnelse.trim() === "" && hasChanges
                  ? "Begrunnelse må fylles ut når du gjør endringer"
                  : undefined
            }
            className={styles.begrunnelse}
          />
        </div>
        <div className={styles.tabellContainer}>
          <FyllUtTabell
            dager={korrigerteDager}
            setKorrigerteDager={setKorrigerteDager}
            periode={periode.periode}
          />
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
            onClick={() => openModal(MODAL_ACTION_TYPE.AVBRYT)}
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
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          type={modalType}
          tittel={
            modalType === MODAL_ACTION_TYPE.AVBRYT
              ? "Vil du avbryte korrigeringen?"
              : "Vil du fullføre korrigeringen?"
          }
          tekst={
            modalType === MODAL_ACTION_TYPE.AVBRYT ? (
              <>
                Hvis du avbryter, vil <strong>ikke</strong> endringene du har gjort så langt
                korrigeres
              </>
            ) : (
              `Ved å trykke "Ja" vil korrigeringen sendes inn.`
            )
          }
          bekreftTekst={modalType === MODAL_ACTION_TYPE.AVBRYT ? "Ja, avbryt" : "Ja, fullfør"}
          avbrytTekst={modalType === MODAL_ACTION_TYPE.AVBRYT ? "Nei, fortsett" : "Nei, avbryt"}
          onBekreft={handleBekreft}
        />
      </fetcher.Form>
    </div>
  );
}
