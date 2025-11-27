import { Alert, BodyLong, Button, Link, Table } from "@navikt/ds-react";
import { useLayoutEffect, useRef, useState } from "react";

import {
  erPeriodeEtterregistrert,
  erPeriodeOpprettetAvArena,
} from "~/components/meldekort-liste/components/rad/MeldekortRad.helpers";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { buildVariantURL } from "~/utils/ab-test.utils";
import type {
  IBehandlingsresultatPeriodeMedMeta,
  IPengeVerdi,
} from "~/utils/behandlingsresultat.types";
import { DatoFormat, formatterDato, formatterDatoUTC } from "~/utils/dato.utils";
import { skalViseArbeidssokerSporsmal } from "~/utils/meldekort-validering.helpers";
import { dagerForSent, erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import {
  erKildeSaksbehandler,
  erMeldekortKorrigert,
  kanMeldekortEndres,
  pluraliserDager,
} from "./UtvidetInfo.helpers";
import styles from "./utvidetInfo.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  variant?: ABTestVariant;
  behandlinger?: IBehandlingsresultatPeriodeMedMeta<IPengeVerdi>[];
}

const MAX_LINES = 4;

const NOK = new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK" });

const TruncatedText = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (textRef.current) {
      // Sjekk om teksten er kuttet av ved å sammenligne scrollHeight med clientHeight
      const isClamped = textRef.current.scrollHeight > textRef.current.clientHeight;
      setShowButton(isClamped);
    }
  }, [text]);

  return (
    <>
      <span
        ref={textRef}
        aria-live="polite"
        className={isExpanded ? "" : styles.truncatedText}
        style={
          !isExpanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: MAX_LINES,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {text}
      </span>
      {showButton && (
        <>
          {" "}
          <Link
            as="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.visMerLink}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Vis mindre av begrunnelsen" : "Vis mer av begrunnelsen"}
          >
            {isExpanded ? "Vis mindre" : "Vis mer"}
          </Link>
        </>
      )}
    </>
  );
};

const DetailRow = ({
  label,
  children,
  alignTop = false,
}: {
  label: string;
  children: React.ReactNode;
  alignTop?: boolean;
}) => (
  <Table.Row className={alignTop ? styles.alignTop : undefined}>
    <Table.HeaderCell scope="row">
      <BodyLong size="small" className={styles.label}>
        {label}
      </BodyLong>
    </Table.HeaderCell>
    <Table.DataCell>
      <BodyLong size="small" className={styles.value}>
        {children}
      </BodyLong>
    </Table.DataCell>
  </Table.Row>
);

export function UtvidetInfo({
  periode,
  personId,
  ansvarligSystem,
  variant = null,
  behandlinger,
}: IProps) {
  const erEtterregistrert = erPeriodeEtterregistrert(periode);
  const erFraArena = erPeriodeOpprettetAvArena(periode);
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = erMeldekortKorrigert(periode);
  // Kan kun korrigeres hvis ansvarligSystem er DP (ikke hvis det er Arena)
  const kanEndres = kanMeldekortEndres(periode, ansvarligSystem);
  const erSendtForSent = erMeldekortSendtForSent(periode);
  const antallDagerForSent = dagerForSent(periode);
  const erSaksbehandler = erKildeSaksbehandler(periode);
  const useVariantLabels = variant === "B" || variant === "C";

  // Bruk samme logikk som i skjemaet for å bestemme om arbeidssøkerspørsmål skal vises
  const skalViseArbeidssoker = skalViseArbeidssokerSporsmal(
    periode.type,
    true, // erSaksbehandlerFlate
    periode.opprettetAv,
  );

  const korrigerUrl = buildVariantURL(
    `/person/${personId}/periode/${periode.id}/korriger`,
    variant ?? null,
  );

  const formatDato = (dato: string) =>
    formatterDato({
      dato,
      format: DatoFormat.DagMndAarLang,
    });

  const formatDatoUTC = (dato: string) =>
    formatterDatoUTC({
      dato,
      format: DatoFormat.DagMndAarLang,
    });

  return (
    <div className={styles.root}>
      <Table size="small" className={styles.detaljer}>
        <caption className="sr-only">Detaljert informasjon om meldekortet</caption>
        <colgroup>
          <col style={{ width: "50%" }} />
          <col style={{ width: "50%" }} />
        </colgroup>
        <Table.Body>
          {periode.meldedato && (
            <DetailRow label="Meldedato:">{formatDato(periode.meldedato)}</DetailRow>
          )}

          {periode.innsendtTidspunkt && (
            <DetailRow label={`Dato for ${erKorrigert ? "korrigering" : "innsending"}:`}>
              {formatDatoUTC(periode.innsendtTidspunkt)}
            </DetailRow>
          )}

          {(erKorrigert || erSaksbehandler) && (
            <DetailRow label={`${erKorrigert ? "Korrigert" : "Innsendt"} av:`}>
              {erSaksbehandler ? periode.kilde?.ident : periode.kilde?.rolle}
            </DetailRow>
          )}

          {periode.begrunnelse && (
            <DetailRow label="Begrunnelse:" alignTop>
              <TruncatedText text={periode.begrunnelse} />
            </DetailRow>
          )}

          {behandlinger && behandlinger.length > 0 && (
            <DetailRow label="Brutto utbetaling:">
              <>
                {behandlinger.map((behandling) => (
                  <span key={behandling.id}>
                    {/* TODO: Lenke til `https://saksbehandling-dagpenger.ansatt.nav.no/oppgave/${behandling.oppgaveId}/dagpenger-rett/${behandling.behandlingsId}/_person/regelsett/${behandling.regelsettId}/opplysning/${behandling.id}` */}
                    {NOK.format(behandling.verdi.verdi)}
                  </span>
                ))}
              </>
            </DetailRow>
          )}

          {periode.registrertArbeidssoker !== null &&
            periode.registrertArbeidssoker !== undefined &&
            skalViseArbeidssoker && (
              <DetailRow label="Svar på spørsmål om arbeidssøkerregistrering:">
                {erArbeidssoker ? "Ja" : "Nei"}
              </DetailRow>
            )}
        </Table.Body>
      </Table>

      {erSendtForSent && (
        <Alert variant="warning" size="small">
          Dette meldekortet er sendt inn {antallDagerForSent} {pluraliserDager(antallDagerForSent)}{" "}
          etter fristen
        </Alert>
      )}

      {erFraArena && (
        <Alert variant="info" size="small">
          Dette meldekortet er fra Arena og vi viser derfor ikke svar på spørsmålet om
          arbeidssøkerregistrering.
        </Alert>
      )}

      {erEtterregistrert && (
        <Alert variant="info" size="small">
          Dette meldekortet er etterregistrert, og har derfor ikke spørsmål om
          arbeidssøkerregistrering.
        </Alert>
      )}

      {useVariantLabels && !kanEndres && (
        <Alert variant="info" size="small">
          Dette meldekortet har en korrigering og kan derfor ikke endres igjen.
        </Alert>
      )}

      {useVariantLabels && (
        <div>
          <Button
            as="a"
            href={korrigerUrl}
            className={styles.korrigerKnapp}
            size="small"
            disabled={!kanEndres}
          >
            Korriger meldekort
          </Button>
        </div>
      )}

      {!useVariantLabels && kanEndres && (
        <div>
          <Button as="a" href={korrigerUrl} className={styles.korrigerKnapp} size="small">
            Korriger meldekort
          </Button>
        </div>
      )}
    </div>
  );
}
