import { Alert, BodyLong, Button, Link, Table } from "@navikt/ds-react";
import { useLayoutEffect, useRef, useState } from "react";

import type { ABTestVariant } from "~/utils/ab-test.utils";
import { DatoFormat, formatterDato, formatterDatoUTC } from "~/utils/dato.utils";
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
}

const MAX_LINES = 4;

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

export function UtvidetInfo({ periode, personId, ansvarligSystem, variant = null }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = erMeldekortKorrigert(periode);
  const kanEndres = kanMeldekortEndres(periode, ansvarligSystem);
  const erSendtForSent = erMeldekortSendtForSent(periode);
  const antallDagerForSent = dagerForSent(periode);
  const erSaksbehandler = erKildeSaksbehandler(periode);
  const useVariantLabels = variant === "B" || variant === "C";

  const korrigerUrl = `/person/${personId}/periode/${periode.id}/korriger${variant ? `?variant=${variant}` : ""}`;

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

          {periode.registrertArbeidssoker !== null &&
            periode.registrertArbeidssoker !== undefined && (
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
