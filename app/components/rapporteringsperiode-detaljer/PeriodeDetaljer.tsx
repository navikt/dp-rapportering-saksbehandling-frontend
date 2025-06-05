import { Alert, Button, Tag } from "@navikt/ds-react";

import { RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

const numberFormat = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
});

export function PeriodeDetaljer({ periode, personId }: IProps) {
  const erArbeidssoker = periode.registrertArbeidssoker;
  const erKorrigert = !!periode.originalId;

  return (
    <div className={styles.periodeDetaljer}>
      <div>
        <div className={styles.header}>
          {erKorrigert && periode?.kilde?.rolle == "Saksbehandler" && (
            <Tag variant="info" size="small">
              Korrigering
            </Tag>
          )}
        </div>
        <table className={styles.detaljerTabell}>
          <tbody>
            <tr>
              <th scope="row">Status neste 14 dager:</th>
              <td>
                {periode.registrertArbeidssoker && (
                  <Tag variant={erArbeidssoker ? "success" : "error"} size="small">
                    {erArbeidssoker ? "Arbeidssøker" : "Ikke arbeidssøker"}
                  </Tag>
                )}
              </td>
            </tr>

            {erKorrigert && periode?.kilde?.rolle && (
              <tr>
                <th scope="row">Korrigert av:</th>
                <td>
                  {periode?.kilde?.rolle === "Saksbehandler"
                    ? `Saksbehandler (${periode?.kilde?.ident})`
                    : periode?.kilde?.ident}
                </td>
              </tr>
            )}
            {periode.begrunnelseEndring && (
              <tr>
                <th scope="row">Grunn til endring:</th>
                <td>{periode.begrunnelseEndring}</td>
              </tr>
            )}
            {periode.bruttoBelop && (
              <tr>
                <th scope="row">Utbetaling av dagpenger:</th>
                <td>{periode.bruttoBelop ? numberFormat.format(periode.bruttoBelop) : "—"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {periode.status === RAPPORTERINGSPERIODE_STATUS.Feilet && (
        <Alert variant={"info"} size="small">
          Det har skjedd en teknisk feil. Beskrive den tekniske feilen og forklare saksbehandler hva
          hen kan gjøre for å rette opp i det. Evt. om noen må varsles eller om det vil bli rettet
          opp av seg selv.
        </Alert>
      )}
      <Button
        as="a"
        href={`/person/${personId}/periode/${periode.id}`}
        className={styles.korrigerKnapp}
        size="small"
      >
        Korriger meldekort
      </Button>
    </div>
  );
}
