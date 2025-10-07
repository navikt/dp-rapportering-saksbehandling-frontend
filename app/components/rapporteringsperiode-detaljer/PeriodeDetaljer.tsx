import { Alert, Button } from "@navikt/ds-react";

import { ANSVARLIG_SYSTEM, ROLLE } from "~/utils/constants";
import { DatoFormat, formatterDato } from "~/utils/dato.utils";
import { dagerForSent, erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <tr className={styles.detailItem}>
    <th scope="row" className={styles.label}>
      {label}
    </th>
    <td className={styles.value}>{children}</td>
  </tr>
);

export function PeriodeDetaljer({ periode, personId, ansvarligSystem }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.originalMeldekortId;
  const kanEndres = periode.kanEndres && ansvarligSystem === ANSVARLIG_SYSTEM.DP;
  const erSendtForSent = erMeldekortSendtForSent(periode);
  const antallDagerForSent = dagerForSent(periode);
  const erSaksbehandler = periode?.kilde?.rolle === ROLLE.Saksbehandler;

  const formatDato = (dato: string) =>
    formatterDato({
      dato,
      format: DatoFormat.DagMndAarLang,
    });

  return (
    <div className={styles.root}>
      <table className={styles.detaljer} role="table" aria-label="Meldekort informasjon">
        <caption className="sr-only">Detaljert informasjon om meldekortet</caption>
        <tbody>
          {periode.meldedato && (
            <DetailRow label="Meldedato:">{formatDato(periode.meldedato)}</DetailRow>
          )}

          {periode.innsendtTidspunkt && (
            <DetailRow label={`Dato for ${erKorrigert ? "korrigering" : "innsending"}:`}>
              {formatDato(periode.innsendtTidspunkt)}
            </DetailRow>
          )}

          {(erKorrigert || erSaksbehandler) && (
            <DetailRow label={`${erKorrigert ? "Korrigert" : "Innsendt"} av:`}>
              {erSaksbehandler ? periode.kilde?.ident : periode.kilde?.rolle}
            </DetailRow>
          )}

          {periode.begrunnelse && <DetailRow label="Begrunnelse:">{periode.begrunnelse}</DetailRow>}

          {periode.registrertArbeidssoker && (
            <DetailRow label="Svar på spørsmål om arbeidssøkerregistrering:">
              {erArbeidssoker ? "Ja" : "Nei"}
            </DetailRow>
          )}
        </tbody>
      </table>

      {erSendtForSent && (
        <Alert variant="warning" size="small">
          Dette meldekortet er sendt inn {antallDagerForSent}{" "}
          {antallDagerForSent !== null && antallDagerForSent > 1 ? " dager" : " dag"} etter fristen
        </Alert>
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
