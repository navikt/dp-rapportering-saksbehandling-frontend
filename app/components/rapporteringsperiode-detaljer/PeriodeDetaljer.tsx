import { Button, Tag } from "@navikt/ds-react";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "./PeriodeDetaljer.module.css";
import { PeriodeMedUke } from "../rapporteringsperiode-visning/PeriodeMedUke";

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
  const { fraOgMed, tilOgMed } = periode.periode;
  const formattertFraOgMed = formatterDato({ dato: fraOgMed, kort: true });
  const formattertTilOgMed = formatterDato({ dato: tilOgMed, kort: true });

  return (
    <div className={styles.detaljer}>
      <PeriodeMedUke
        ukenummer={ukenummer(periode)}
        formattertFraOgMed={formattertFraOgMed}
        formattertTilOgMed={formattertTilOgMed}
      />
      <table className={styles.tabell}>
        <tbody>
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
        </tbody>
      </table>
      <Button className={styles.korrigerKnapp}>Korriger meldekort</Button>
    </div>
  );
}
