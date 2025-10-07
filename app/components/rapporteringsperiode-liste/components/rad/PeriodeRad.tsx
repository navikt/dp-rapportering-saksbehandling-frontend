import { Table, Tag } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { RapporteringsperiodeVisning } from "~/components/rapporteringsperiode-visning/PeriodeVisning";
import aktivitetStyles from "~/styles/aktiviteter.module.css";
import { QUERY_PARAMS, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { aktivitetMapping, sorterAktiviteter, unikeAktiviteter } from "../../utils";
import styles from "./periodeRad.module.css";

interface Props {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

export function PeriodeRad({ periode, personId, ansvarligSystem }: Props) {
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Derived state
  const erInnsendt = periode.status === RAPPORTERINGSPERIODE_STATUS.Innsendt;
  const erOpprettet = !erInnsendt && !periode.kanSendes;
  const erKorrigert = !!periode.originalMeldekortId;
  const periodeDatoTekst = `${formatterDato({ dato: periode.periode.fraOgMed })} - ${formatterDato({ dato: periode.periode.tilOgMed })}`;

  // Display values
  const statusText = erInnsendt
    ? "Innsendt"
    : periode.kanSendes
      ? "Klar til utfylling"
      : "Meldekort opprettet";
  const statusVariant = erInnsendt ? "success" : "info";
  const skalViseInnsendt = erInnsendt && periode.innsendtTidspunkt && periode.meldedato;
  const erSendtForSent = skalViseInnsendt && erMeldekortSendtForSent(periode);
  const aktiviteter = sorterAktiviteter(unikeAktiviteter(periode));

  // Highlight effect
  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);
    if (oppdatertId === periode.id) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 3600);
      return () => clearTimeout(timer);
    }
  }, [searchParams, periode.id]);

  const radKlasse = classNames({
    [styles["periodeListe__row"]]: true,
    [styles["periodeListe__row--highlighted"]]: isHighlighted,
    [styles["periodeListe__row--disabled"]]: erOpprettet,
  });

  // Common cell props
  const cellProps = {
    textSize: "small" as const,
    className: radKlasse,
  };

  return (
    <Table.ExpandableRow
      content={
        !erOpprettet && (
          <article
            key={periode.id}
            aria-label={`Periode ${periode.periode.fraOgMed}`}
            className={styles.contentContainer}
          >
            <RapporteringsperiodeVisning
              perioder={[periode]}
              personId={personId}
              ansvarligSystem={ansvarligSystem}
            />
          </article>
        )
      }
      className={radKlasse}
      expandOnRowClick={!erOpprettet}
      expansionDisabled={erOpprettet}
    >
      <Table.HeaderCell scope="row" {...cellProps} style={{ width: "10%" }}>
        {ukenummer(periode)}
      </Table.HeaderCell>
      <Table.DataCell {...cellProps} style={{ width: "20%" }}>
        {periodeDatoTekst}
      </Table.DataCell>
      <Table.DataCell {...cellProps} style={{ width: "15%" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <Tag variant={statusVariant} size="small">
            {statusText}
          </Tag>
          {erKorrigert && (
            <Tag variant="warning" size="small">
              Korrigert
            </Tag>
          )}
        </div>
      </Table.DataCell>
      <Table.DataCell {...cellProps} style={{ width: "20%" }}>
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
      <Table.DataCell {...cellProps} style={{ width: "15%" }}>
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
      <Table.DataCell {...cellProps} style={{ width: "15%" }}>
        {periode.sisteFristForTrekk && formatterDato({ dato: periode.sisteFristForTrekk })}
      </Table.DataCell>
    </Table.ExpandableRow>
  );
}
