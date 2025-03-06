import { Tag } from "@navikt/ds-react";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";
import styles from "./PeriodeDetaljer.module.css";

interface IProps {
  periode: IRapporteringsperiode;
}

export function PeriodeDetaljer({ periode }: IProps) {
  const arbeidssokerStatus = periode.registrertArbeidssoker ? (
    <Tag variant="success">Ja</Tag>
  ) : (
    <Tag variant="error">Nei</Tag>
  );

  const korrigeringAvMeldekort = periode.originalId ? (
    <Tag variant="success">Ja</Tag>
  ) : (
    <Tag variant="error">Nei</Tag>
  );

  return (
    <div>
      <h2>Detaljer</h2>
      <h3>
        Uke {ukenummer(periode)} | {formatterDato({ dato: periode.periode.tilOgMed, kort: true })}
      </h3>
      <div className={styles.detaljer}>
        <div>
          <p>Arbeidssøkerstatus:</p>
          {arbeidssokerStatus}
        </div>
        <div>
          <p>Korrigering av meldekort:</p>
          {korrigeringAvMeldekort}
        </div>
      </div>
    </div>
  );
}
