import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { BodyShort, InfoCard } from "@navikt/ds-react";

import { DatoFormat, formaterPeriodeTilUkenummer, formatterDato } from "~/utils/dato.utils";

import styles from "./opprettMeldekortInfoBoks.module.css";

interface OpprettMeldekortInfoBoksProps {
  tittel: string;
  tekst: string;
  attention?: boolean;
  perioder: Array<{
    fraOgMed: string;
    tilOgMed: string;
    overlapperEksisterendeMeldekort?: boolean;
  }>;
}

export function OpprettMeldekortInfoBoks({
  tittel,
  tekst,
  attention = false,
  perioder,
}: OpprettMeldekortInfoBoksProps) {
  const [tekstFor, tekstEtter] = tekst.includes("{{antall}}")
    ? tekst.split("{{antall}}")
    : [tekst, ""];

  return (
    <InfoCard data-color={attention ? "warning" : "info"} size="small">
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
              <col className={styles.varselskolonne} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Ukenummer</th>
                <th scope="col">Periode</th>
                <th scope="col" aria-label="Varsel" />
              </tr>
            </thead>
            <tbody>
              {perioder.map((periode) => (
                <tr
                  key={`${periode.fraOgMed}-${periode.tilOgMed}`}
                  className={
                    periode.overlapperEksisterendeMeldekort ? styles.overlappendePeriode : undefined
                  }
                >
                  <td>{formaterPeriodeTilUkenummer(periode.fraOgMed, periode.tilOgMed)}</td>
                  <td>
                    {formatterDato({ dato: periode.fraOgMed, format: DatoFormat.DagMndAar })} –{" "}
                    {formatterDato({ dato: periode.tilOgMed, format: DatoFormat.DagMndAar })}
                  </td>
                  <td
                    className={styles.varselcelle}
                    aria-label={
                      periode.overlapperEksisterendeMeldekort
                        ? "Overlapper eksisterende meldekort"
                        : undefined
                    }
                  >
                    <span className={styles.varselikon}>
                      {periode.overlapperEksisterendeMeldekort && (
                        <ExclamationmarkTriangleIcon aria-hidden />
                      )}
                    </span>
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
