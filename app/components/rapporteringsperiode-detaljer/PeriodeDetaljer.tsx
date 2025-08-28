import { Alert, Button, Tag } from "@navikt/ds-react";

import { DatoFormat, formatterDato } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

export function PeriodeDetaljer({ periode, personId }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.originalMeldekortId;
  const kanSendes = periode.kanSendes;
  const kanEndres = periode.kanEndres;
  const erSendtForSent = erMeldekortSendtForSent(periode);

  return (
    <div className={styles.periodeDetaljer}>
      {kanSendes ? (
        <div>
          <Button
            as="a"
            href={`/person/${personId}/meldekort/${periode.id}/fyll-ut`}
            className={styles.korrigerKnapp}
            size="small"
            variant="primary"
          >
            Fyll ut meldekort
          </Button>
        </div>
      ) : (
        <>
          <dl className={styles.detailList}>
            {periode.meldedato && (
              <>
                <dt>Meldedato:</dt>
                <dd>
                  {formatterDato({
                    dato: periode.meldedato,
                    format: DatoFormat.DagMndAarLang,
                  })}
                </dd>
              </>
            )}
            {periode.innsendtTidspunkt && (
              <>
                <dt>Dato for {erKorrigert ? "korrigering" : "innsending"}:</dt>
                <dd>
                  {formatterDato({
                    dato: periode.innsendtTidspunkt,
                    format: DatoFormat.DagMndAarLang,
                  })}
                </dd>
              </>
            )}
            {(erKorrigert || periode?.kilde?.rolle === "Saksbehandler") && (
              <>
                <dt>{erKorrigert ? "Korrigert" : "Innsendt"} av:</dt>
                <dd>
                  {periode?.kilde?.rolle === "Saksbehandler"
                    ? periode?.kilde?.ident
                    : periode?.kilde?.rolle}
                </dd>

                {periode.begrunnelse && (
                  <>
                    <dt>Begrunnelse:</dt>
                    <dd>{periode.begrunnelse}</dd>
                  </>
                )}
              </>
            )}
            {periode.registrertArbeidssoker && (
              <>
                <dt>Svar på spørsmål om arbeidssøkerregistrering:</dt>
                <dd>
                  <Tag variant={erArbeidssoker ? "success" : "error"} size="small">
                    {erArbeidssoker ? "Ja" : "Nei"}
                  </Tag>
                </dd>
              </>
            )}
          </dl>
          {erSendtForSent && (
            <Alert variant="warning">Dette meldekortet er sendt inn etter fristen</Alert>
          )}
          {kanEndres && (
            <div>
              <Button
                as="a"
                href={`/person/${personId}/meldekort/${periode.id}/korriger`}
                className={styles.korrigerKnapp}
                size="small"
              >
                Korriger meldekort
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
