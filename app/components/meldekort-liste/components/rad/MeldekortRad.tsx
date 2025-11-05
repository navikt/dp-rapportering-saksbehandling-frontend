import { Table, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { MeldekortVisning } from "~/components/meldekort-visning/MeldekortVisning";
import aktivitetStyles from "~/styles/aktiviteter.module.css";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { QUERY_PARAMS } from "~/utils/constants";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { aktivitetMapping, sorterAktiviteter, unikeAktiviteter } from "../../utils";
import {
  erPeriodeEtterregistrert,
  erPeriodeKorrigert,
  erPeriodeOpprettet,
  getStatusConfig,
  HIGHLIGHT_DURATION_MS,
  skalViseInnsendtInfo,
} from "./MeldekortRad.helpers";
import styles from "./meldekortRad.module.css";

interface Props {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
  togglePlacement?: "left" | "right";
  variant?: ABTestVariant;
  allePerioder?: IRapporteringsperiode[];
}

export function MeldekortRad({
  periode,
  personId,
  ansvarligSystem,
  togglePlacement = "left",
  variant = null,
  allePerioder = [],
}: Props) {
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);

  // States
  const erOpprettet = erPeriodeOpprettet(periode);
  const erKorrigert = erPeriodeKorrigert(periode);
  const erEtterregistrert = erPeriodeEtterregistrert(periode);
  const periodeDatoTekst = `${formatterDato({ dato: periode.periode.fraOgMed })} - ${formatterDato({ dato: periode.periode.tilOgMed })}`;

  // Sjekk om denne perioden har en korrigering
  const harKorrigering = allePerioder.some(
    (p) => p.originalMeldekortId === periode.id && p.id !== periode.id,
  );

  // Variant B og C: Endre tekster for korrigering
  const useVariantLabels = variant === "B" || variant === "C";

  // Visningsverdier
  const statusConfig = getStatusConfig(periode);
  const skalViseInnsendt = skalViseInnsendtInfo(periode);
  const erSendtForSent = skalViseInnsendt && erMeldekortSendtForSent(periode);
  const aktiviteter = sorterAktiviteter(unikeAktiviteter(periode));

  // Highlight-effekt
  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);
    if (oppdatertId === periode.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), HIGHLIGHT_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [searchParams, periode.id]);

  const radKlasse = classNames({
    [styles["periodeListe__row"]]: true,
    [styles["periodeListe__row--highlighted"]]: isHighlighted,
    [styles["periodeListe__row--disabled"]]: erOpprettet,
  });

  // Felles props for celler
  const cellProps = {
    textSize: "small" as const,
    className: radKlasse,
  };

  return (
    <Table.ExpandableRow
      togglePlacement={togglePlacement}
      content={
        !erOpprettet && (
          <article
            key={periode.id}
            aria-label={`Periode ${periode.periode.fraOgMed}`}
            className={styles.visningContainer}
          >
            <MeldekortVisning
              perioder={[periode]}
              personId={personId}
              ansvarligSystem={ansvarligSystem}
              variant={variant}
            />
          </article>
        )
      }
      className={radKlasse}
      expandOnRowClick={!erOpprettet}
      expansionDisabled={erOpprettet}
    >
      <Table.DataCell scope="row" {...cellProps}>
        {ukenummer(periode)}
      </Table.DataCell>
      <Table.DataCell {...cellProps}>{periodeDatoTekst}</Table.DataCell>
      <Table.DataCell {...cellProps}>
        <div className={styles.statusContainer}>
          <Tag variant={statusConfig.variant} size="small">
            {statusConfig.text}
          </Tag>
          {erEtterregistrert && (
            <Tag variant="info" size="small">
              Etterregistrert
            </Tag>
          )}
          {erKorrigert && (
            <Tag variant="warning" size="small">
              {useVariantLabels ? "Korrigering" : "Korrigert"}
            </Tag>
          )}

          {!erKorrigert && harKorrigering && useVariantLabels && (
            <Tag variant="neutral" size="small">
              Har korrigering
            </Tag>
          )}
        </div>
      </Table.DataCell>
      <Table.DataCell {...cellProps}>
        <ul className={styles.aktiviteter}>
          {aktiviteter.map((type) => (
            <li
              key={type}
              className={`${styles.aktivitet} ${aktivitetStyles[aktivitetMapping[type].color]}`}
            >
              <span aria-hidden="true">{aktivitetMapping[type].label}</span>
              <span className="sr-only">{aktivitetMapping[type].aria}</span>
            </li>
          ))}
        </ul>
      </Table.DataCell>
      <Table.DataCell {...cellProps}>
        {skalViseInnsendt &&
          (erSendtForSent ? (
            <Tag variant="error" size="small">
              {formatterDato({ dato: periode.meldedato! })}
              <span className="sr-only">, sendt inn for sent </span>
            </Tag>
          ) : (
            formatterDato({ dato: periode.meldedato! })
          ))}
      </Table.DataCell>
      <Table.DataCell {...cellProps}>
        {periode.sisteFristForTrekk && formatterDato({ dato: periode.sisteFristForTrekk })}
      </Table.DataCell>
    </Table.ExpandableRow>
  );
}
