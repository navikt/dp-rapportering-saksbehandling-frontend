import { Tag } from "@navikt/ds-react";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

function renderTag(condition: boolean) {
  return condition ? <Tag variant="success">Ja</Tag> : <Tag variant="error">Nei</Tag>;
}

const utbetaling = (periode: IRapporteringsperiode) => {
  if (!periode.bruttoBelop) return;
  return <div>{periode.bruttoBelop} kr</div>;
};

export function PeriodeDetaljer({ periode }: IProps) {
  return (
    <div>
      <h2>Detaljer</h2>
      <h3>
        Uke {ukenummer(periode)} | {formatterDato({ dato: periode.periode.tilOgMed, kort: true })}
      </h3>
      <div className={styles.detaljer}>
        <div>
          <p>Arbeidssøkerstatus:</p>
          {renderTag(periode.registrertArbeidssoker ?? false)}
        </div>
        <div>
          <p>Korrigering av meldekort:</p>
          {renderTag(periode.originalId !== undefined)}
        </div>
        <div>
          <p>Grunn til endring: </p>
          <div>{periode.begrunnelseEndring}</div>
        </div>
        <div>
          <p>Utbetaling av dagpenger:</p>
          {utbetaling(periode)}
        </div>
      </div>
    </div>
  );
}
