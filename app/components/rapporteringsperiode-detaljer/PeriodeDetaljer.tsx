import { Alert, Button, Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { DatoFormat, formatterDato } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

export function PeriodeDetaljer({ periode, personId }: IProps) {
  const numberFormat = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  });
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.originalId;
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
            {periode.mottattDato && (
              <>
                <dt>Korrigering innsendt:</dt>
                <dd>
                  {formatterDato({ dato: periode.mottattDato, format: DatoFormat.DagMndAarLang })}
                </dd>
              </>
            )}
          </>
        )}

        {periode.begrunnelseEndring && (
          <>
            <dt>Grunn til endring:</dt>
            <dd>{periode.begrunnelseEndring}</dd>
          </>
        )}

        {typeof periode.bruttoBelop === "number" && (
          <>
            <dt>Utbetaling av dagpenger:</dt>
            <dd>{numberFormat.format(periode.bruttoBelop)}</dd>
          </>
        )}
      </dl>
      {periode.status === RAPPORTERINGSPERIODE_STATUS.Feilet && (
        <Alert variant={"info"} size="small">
          Det har skjedd en teknisk feil. Beskrive den tekniske feilen og forklare saksbehandler hva
          hen kan gjøre for å rette opp i det. Evt. om noen må varsles eller om det vil bli rettet
          opp av seg selv.
        </Alert>
      )}
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
