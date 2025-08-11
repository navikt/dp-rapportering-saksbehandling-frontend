import { Button, Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { DatoFormat, formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

export function PeriodeDetaljer({ periode, personId }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.korrigering?.korrigererMeldekortId;
  const erUtfyltAvSaksbehandler = periode.kilde?.rolle === "Saksbehandler" && !erKorrigert;
  const kanFyllesUt = periode.kanSendes && periode.status === RAPPORTERINGSPERIODE_STATUS.Opprettet;

  return (
    <div className={styles.periodeDetaljer}>
      <dl className={styles.detailList}>
        {periode.registrertArbeidssoker && (
          <>
            <dt>Svar på spørsmål om arbeidssøkerregistrering:</dt>
            <dd>
              <Tag variant={erArbeidssoker ? "success" : "error"} size="small">
                {erArbeidssoker ? "Arbeidssøker" : "Ikke arbeidssøker"}
              </Tag>
            </dd>
          </>
        )}
        {erKorrigert && (
          <>
            <dt>Korrigering av meldekort:</dt>
            <dd>
              {periode.registrertArbeidssoker && (
                <Tag variant="success" size="small">
                  Ja
                </Tag>
              )}
            </dd>
            <dt>Korrigert av:</dt>
            <dd>
              {periode?.kilde?.rolle === "Saksbehandler"
                ? `Saksbehandler (${periode?.kilde?.ident})`
                : periode?.kilde?.rolle}
            </dd>
            {periode.innsendtTidspunkt && (
              <>
                <dt>Dato for korrigering:</dt>
                <dd>
                  {formatterDato({
                    dato: periode.innsendtTidspunkt,
                    format: DatoFormat.DagMndAarLang,
                  })}
                </dd>
              </>
            )}
          </>
        )}

        {erUtfyltAvSaksbehandler && (
          <>
            <dt>Utfylt av:</dt>
            <dd>
              {periode?.kilde?.rolle === "Saksbehandler"
                ? `Saksbehandler (${periode?.kilde?.ident})`
                : periode?.kilde?.rolle}
            </dd>
            {periode.innsendtTidspunkt && (
              <>
                <dt>Meldekort innsendt:</dt>
                <dd>
                  {formatterDato({
                    dato: periode.innsendtTidspunkt,
                    format: DatoFormat.DagMndAarLang,
                  })}
                </dd>
              </>
            )}
            {periode.begrunnelse && (
              <>
                <dt>Begrunnelse:</dt>
                <dd>{periode.begrunnelse}</dd>
              </>
            )}
          </>
        )}

        {periode.korrigering?.begrunnelse && (
          <>
            <dt>Grunn til korrigering:</dt>
            <dd>{periode.korrigering.begrunnelse}</dd>
          </>
        )}
      </dl>

      <div>
        {kanFyllesUt ? (
          <Button
            as="a"
            href={`/person/${personId}/periode/${periode.id}/fyll-ut`}
            className={styles.korrigerKnapp}
            size="small"
            variant="primary"
          >
            Fyll ut meldekort
          </Button>
        ) : (
          <Button
            as="a"
            href={`/person/${personId}/periode/${periode.id}/korriger`}
            className={styles.korrigerKnapp}
            size="small"
          >
            Korriger meldekort
          </Button>
        )}
      </div>
    </div>
  );
}
