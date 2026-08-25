import { BodyShort, InfoCard } from "@navikt/ds-react";

import { DatoFormat, formaterPeriodeTilUkenummer, formatterDato } from "~/utils/dato.utils";

import styles from "./opprettMeldekortInfoBoks.module.css";

interface OpprettMeldekortInfoBoksProps {
  tittel: string;
  tekst: string;
  perioder: Array<{ fraOgMed: string; tilOgMed: string }>;
}

export function OpprettMeldekortInfoBoks({
  tittel,
  tekst,
  perioder,
}: OpprettMeldekortInfoBoksProps) {
  const [tekstFor, tekstEtter] = tekst.split("{{antall}}");

  return (
    <InfoCard data-color="info" size="small">
      <InfoCard.Header>
        <InfoCard.Title>{tittel}</InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content className={styles.informationContent}>
        <BodyShort>
          {tekstFor}
          <strong>{perioder.length}</strong>
          {tekstEtter}
        </BodyShort>
        <div className={styles.periodeTabellWrapper}>
          <table className={styles.periodeTabell}>
            <colgroup>
              <col className={styles.ukenummerKolonne} />
              <col className={styles.periodeKolonne} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Ukenummer</th>
                <th scope="col">Periode</th>
              </tr>
            </thead>
            <tbody>
              {perioder.map((periode) => (
                <tr key={`${periode.fraOgMed}-${periode.tilOgMed}`}>
                  <td>{formaterPeriodeTilUkenummer(periode.fraOgMed, periode.tilOgMed)}</td>
                  <td>
                    {formatterDato({ dato: periode.fraOgMed, format: DatoFormat.DagMndAar })} –{" "}
                    {formatterDato({ dato: periode.tilOgMed, format: DatoFormat.DagMndAar })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
}
