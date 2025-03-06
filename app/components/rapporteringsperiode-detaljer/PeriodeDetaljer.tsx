import { Button, Tag } from "@navikt/ds-react";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

function renderTag(condition: boolean) {
  return condition ? <Tag variant="success">Ja</Tag> : <Tag variant="error">Nei</Tag>;
}

const numberFormat = new Intl.NumberFormat("nb-NO", {
  style: "currency",
  currency: "NOK",
});

export function PeriodeDetaljer({ periode }: IProps) {
  return (
    <>
      <h2>Detaljer</h2>
      <h3>
        Uke {ukenummer(periode)} | {formatterDato({ dato: periode.periode.tilOgMed, kort: true })}
      </h3>
      <table className={styles.tabell}>
        <tr>
          <th>Arbeidssøkerstatus:</th>
          <td>{renderTag(periode.registrertArbeidssoker ?? false)}</td>
        </tr>
        <tr>
          <th>Korrigering av meldekort:</th>
          <td>{renderTag(periode.originalId !== undefined)}</td>
        </tr>
        <tr>
          <th>Grunn til endring: </th>
          <td>{periode.begrunnelseEndring}</td>
        </tr>
        <tr>
          <th>Utbetaling av dagpenger:</th>
          <td>{periode.bruttoBelop && numberFormat.format(periode.bruttoBelop)}</td>
        </tr>
      </table>
      <Button className={styles.korrigerKnapp}>Korriger meldekort</Button>
    </>
  );
}
