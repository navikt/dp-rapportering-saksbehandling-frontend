import { Alert, Button, Tag } from "@navikt/ds-react";

import { DatoFormat, formatterDato } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

const ARIA_LABELS = {
  meldedato: "Meldedato",
  innsending: "Dato for innsending",
  korrigering: "Dato for korrigering",
  arbeidssoker: "Svar på spørsmål om arbeidssøkerregistrering",
  begrunnelse: "Begrunnelse",
} as const;

export function PeriodeDetaljer({ periode, personId }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.originalMeldekortId;
  const kanSendes = periode.kanSendes;
  const kanEndres = periode.kanEndres;
  const erSendtForSent = erMeldekortSendtForSent(periode);

  const formattertMeldedato = periode.meldedato
    ? formatterDato({ dato: periode.meldedato, format: DatoFormat.DagMndAarLang })
    : null;

  const formattertInnsendtTidspunkt = periode.innsendtTidspunkt
    ? formatterDato({ dato: periode.innsendtTidspunkt, format: DatoFormat.DagMndAarLang })
    : null;

  const innsendtLabel = erKorrigert ? ARIA_LABELS.korrigering : ARIA_LABELS.innsending;
  const innsendtTerm = erKorrigert ? "korrigering" : "innsending";

  const renderDetailItem = (
    key: string,
    ariaLabel: string,
    term: string,
    value: React.ReactNode,
  ) => (
    <li key={key} aria-label={ariaLabel}>
      <span className={styles.detailTerm} aria-hidden="true">
        {term}:
      </span>
      <span className={styles.detailValue} aria-hidden="true">
        {value}
      </span>
    </li>
  );

  if (kanSendes) {
    return (
      <div className={styles.periodeDetaljer}>
        <Button
          as="a"
          href={`/person/${personId}/periode/${periode.id}/fyll-ut`}
          className={styles.korrigerKnapp}
          size="small"
          variant="primary"
        >
          Fyll ut meldekort
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.periodeDetaljer}>
      <ul className={styles.detailList} aria-label="Detaljer om perioden">
        {formattertMeldedato &&
          renderDetailItem(
            "meldedato",
            `${ARIA_LABELS.meldedato}: ${formattertMeldedato}`,
            ARIA_LABELS.meldedato,
            formattertMeldedato,
          )}

        {formattertInnsendtTidspunkt &&
          renderDetailItem(
            "innsendt",
            `${innsendtLabel}: ${formattertInnsendtTidspunkt}`,
            `Dato for ${innsendtTerm}`,
            formattertInnsendtTidspunkt,
          )}

        {(erKorrigert || periode?.kilde?.rolle === "Saksbehandler") && (
          <>
            {renderDetailItem(
              "kilde",
              `${erKorrigert ? "Korrigert" : "Innsendt"} av: ${
                periode?.kilde?.rolle === "Saksbehandler"
                  ? periode?.kilde?.ident
                  : periode?.kilde?.rolle
              }`,
              `${erKorrigert ? "Korrigert" : "Innsendt"} av`,
              periode?.kilde?.rolle === "Saksbehandler"
                ? periode?.kilde?.ident
                : periode?.kilde?.rolle,
            )}

            {periode.begrunnelse &&
              renderDetailItem(
                "begrunnelse",
                `${ARIA_LABELS.begrunnelse}: ${periode.begrunnelse}`,
                ARIA_LABELS.begrunnelse,
                periode.begrunnelse,
              )}
          </>
        )}

        {periode.registrertArbeidssoker !== undefined &&
          renderDetailItem(
            "arbeidssoker",
            `${ARIA_LABELS.arbeidssoker}: ${erArbeidssoker ? "Ja" : "Nei"}`,
            ARIA_LABELS.arbeidssoker,
            <Tag variant={erArbeidssoker ? "success" : "error"} size="small">
              {erArbeidssoker ? "Ja" : "Nei"}
            </Tag>,
          )}
      </ul>

      {erSendtForSent && (
        <Alert variant="warning">Dette meldekortet er sendt inn etter fristen</Alert>
      )}

      {kanEndres && (
        <div>
          <Button
            as="a"
            href={`/person/${personId}/periode/${periode.id}/korriger`}
            className={styles.korrigerKnapp}
            size="small"
          >
            Korriger meldekort
          </Button>
        </div>
      )}
    </div>
  );
}
