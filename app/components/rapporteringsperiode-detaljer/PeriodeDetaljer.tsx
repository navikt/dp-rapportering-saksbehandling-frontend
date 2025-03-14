import { Button, Tag } from "@navikt/ds-react";
import { useNavigate } from "react-router";

import type { IRapporteringsperiode } from "~/utils/types";

import { PeriodeMedUke } from "../rapporteringsperiode-visning/PeriodeMedUke";
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
  const navigate = useNavigate(); // Initialize useNavigate

  const handleKorrigerClick = () => {
    navigate(`/periode/${periode.id}`);
  };

  return (
    <div className={styles.periodeDetaljer}>
      <div>
        <PeriodeMedUke periode={periode} />
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
      </div>
      <Button className={styles.korrigerKnapp} onClick={handleKorrigerClick}>
        Korriger meldekort
      </Button>
    </div>
  );
}
