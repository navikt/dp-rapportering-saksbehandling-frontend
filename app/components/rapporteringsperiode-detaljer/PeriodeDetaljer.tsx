import { Button, Tag } from "@navikt/ds-react";

import type { IRapporteringsperiode } from "~/utils/types";

import { PeriodeMedUke } from "../rapporteringsperiode-visning/PeriodeMedUke";
import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
  personId: string;
}

function renderTag(condition: boolean) {
  return condition ? <Tag variant="success">Ja</Tag> : <Tag variant="error">Nei</Tag>;
}

const numberFormat = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
});

export function PeriodeDetaljer({ periode, personId }: IProps) {
  return (
    <div className={styles.periodeDetaljer}>
      <div>
        <PeriodeMedUke periode={periode} />
        <table className={styles.detaljerTabell}>
          <tbody>
            <tr>
              <th>Arbeidssøkerstatus:</th>
              <td>
                {typeof periode.registrertArbeidssoker === "boolean"
                  ? renderTag(periode.registrertArbeidssoker ?? false)
                  : null}
              </td>
            </tr>
            <tr>
              <th>Korrigering av meldekort:</th>
              <td> {renderTag(!!periode.originalId)}</td>
            </tr>
            <tr>
              <th>Grunn til endring: </th>
              <td>{periode.begrunnelseEndring}</td>
            </tr>
            <tr>
              <th>Utbetaling av dagpenger:</th>
              <td>{periode.bruttoBelop && numberFormat.format(periode.bruttoBelop)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Button
        as="a"
        href={`/person/${personId}/periode/${periode.id}`}
        className={styles.korrigerKnapp}
      >
        Korriger meldekort
      </Button>
    </div>
  );
}
