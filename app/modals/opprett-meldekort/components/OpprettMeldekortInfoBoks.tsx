import { ExclamationmarkTriangleIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import { BodyShort, InfoCard } from "@navikt/ds-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import type { IMeldekortoversikt } from "~/sanity/modaler/opprett-meldekort-modal/types";
import { sanityTekst } from "~/sanity/utils";
import { DatoFormat, formaterPeriodeTilUkenummer, formatterDato } from "~/utils/dato.utils";

import {
  harPeriodeMedArsskifte,
  interpolerAntallIPortableText,
} from "../opprettMeldekortModal.helpers";
import styles from "./opprettMeldekortInfoBoks.module.css";

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <BodyShort>{children}</BodyShort>,
  },
};

interface OpprettMeldekortInfoBoksProps {
  tekster?: IMeldekortoversikt;
  attention?: boolean;
  perioder: Array<{
    fraOgMed: string;
    tilOgMed: string;
    overlapperEksisterendeMeldekort?: boolean;
  }>;
}

export function OpprettMeldekortInfoBoks({
  tekster,
  attention = false,
  perioder,
}: OpprettMeldekortInfoBoksProps) {
  const tittel = sanityTekst(tekster?.tittel, "opprettMeldekortModal.meldekortoversikt.tittel");
  const ukenummerKolonne = sanityTekst(
    tekster?.ukenummerKolonne,
    "opprettMeldekortModal.meldekortoversikt.ukenummerKolonne",
  );
  const periodeKolonne = sanityTekst(
    tekster?.periodeKolonne,
    "opprettMeldekortModal.meldekortoversikt.periodeKolonne",
  );
  const varselKolonne = sanityTekst(
    tekster?.varselKolonne,
    "opprettMeldekortModal.meldekortoversikt.varselKolonne",
  );
  const overlappAriaLabel = sanityTekst(
    tekster?.overlappAriaLabel,
    "opprettMeldekortModal.meldekortoversikt.overlappAriaLabel",
  );
  const arsskifteTilleggstekst = sanityTekst(
    tekster?.arsskifteTilleggstekst,
    "opprettMeldekortModal.meldekortoversikt.arsskifteTilleggstekst",
  );
  const overlappendePerioderTekst = sanityTekst(
    tekster?.overlappendePerioderTekst,
    "opprettMeldekortModal.meldekortoversikt.overlappendePerioderTekst",
  );
  const varslingOmOverlappendePerioder = interpolerAntallIPortableText(
    tekster?.tekst ?? [],
    perioder.length,
  );
  const visArsskifteTilleggstekst =
    Boolean(arsskifteTilleggstekst) && harPeriodeMedArsskifte(perioder);
  const visOverlappendePerioderTekst = attention && Boolean(overlappendePerioderTekst);

  return (
    <InfoCard data-color={attention ? "warning" : "info"} size="small">
      <InfoCard.Header
        icon={
          attention ? (
            <ExclamationmarkTriangleIcon aria-hidden />
          ) : (
            <InformationSquareIcon aria-hidden />
          )
        }
      >
        <InfoCard.Title>{tittel}</InfoCard.Title>
      </InfoCard.Header>
      <InfoCard.Content className={styles.informationContent}>
        {visOverlappendePerioderTekst && <BodyShort>{overlappendePerioderTekst}</BodyShort>}
        <PortableText value={varslingOmOverlappendePerioder} components={portableTextComponents} />
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
        {visArsskifteTilleggstekst && <BodyShort>{arsskifteTilleggstekst}</BodyShort>}
      </InfoCard.Content>
    </InfoCard>
  );
}
