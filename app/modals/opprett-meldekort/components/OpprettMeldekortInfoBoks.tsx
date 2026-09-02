import { ExclamationmarkTriangleIcon } from "@navikt/aksel-icons";
import { BodyShort, InfoCard } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import { DatoFormat, formaterPeriodeTilUkenummer, formatterDato } from "~/utils/dato.utils";

import {
  harPeriodeMedArsskifte,
  interpolerAntallIPortableText,
} from "../opprettMeldekortModal.helpers";
import styles from "./opprettMeldekortInfoBoks.module.css";

interface OpprettMeldekortInfoBoksProps {
  tittel: string;
  tekst: PortableTextBlock[];
  arsskifteTilleggstekst?: string;
  ukenummerKolonne: string;
  periodeKolonne: string;
  varselKolonne: string;
  overlappAriaLabel: string;
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
  arsskifteTilleggstekst,
  ukenummerKolonne,
  periodeKolonne,
  varselKolonne,
  overlappAriaLabel,
  attention = false,
  perioder,
}: OpprettMeldekortInfoBoksProps) {
  const interpolertTekst = interpolerAntallIPortableText(tekst, perioder.length);
  const visArsskifteTilleggstekst =
    Boolean(arsskifteTilleggstekst) && harPeriodeMedArsskifte(perioder);

  return (
    <InfoCard data-color={attention ? "warning" : "info"} size="small">
      <InfoCard.Header>
        <InfoCard.Title>{tittel}</InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content className={styles.informationContent}>
        <PortableText value={interpolertTekst} />
        {visArsskifteTilleggstekst && <BodyShort>{arsskifteTilleggstekst}</BodyShort>}
        <div className={styles.periodeTabellWrapper}>
          <table className={styles.periodeTabell}>
            <colgroup>
              <col className={styles.ukenummerKolonne} />
              <col className={styles.periodeKolonne} />
              <col className={styles.varselskolonne} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{ukenummerKolonne}</th>
                <th scope="col">{periodeKolonne}</th>
                <th scope="col" aria-label={varselKolonne} />
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
                      periode.overlapperEksisterendeMeldekort ? overlappAriaLabel : undefined
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
