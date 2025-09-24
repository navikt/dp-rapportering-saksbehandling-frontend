import { Table } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import pageStyles from "~/route-styles/person.module.css";
import { QUERY_PARAMS } from "~/utils/constants";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { PeriodeDetaljer } from "../rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeVisning } from "../rapporteringsperiode-visning/PeriodeVisning";
import { Innsendt } from "./Innsendt";
import styles from "./PeriodeListe.module.css";
import { getStatus, PERIODE_RAD_STATUS, Status } from "./Status";
import { TypeAktivitet } from "./TypeAktivitet";

interface Props {
  periode: IRapporteringsperiode;
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

export function PeriodeRad({ periode, personId, ansvarligSystem }: Props) {
  const [searchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);

    // Highlight den perioden som matcher oppdatert id
    // Dette fungerer for både fyll-ut (original ID) og korrigering (ny periode ID)
    const shouldHighlight = oppdatertId === periode.id;

    if (shouldHighlight) {
      setIsHighlighted(true);

      // Fjern highlight etter animasjonen er ferdig
      setTimeout(() => {
        setIsHighlighted(false);
      }, 3600);
    }
  }, [searchParams, periode.id, periode.originalMeldekortId]);

  const isDisabled = getStatus(periode) === PERIODE_RAD_STATUS.Opprettet;

  const radKlasse = classNames({
    [styles["periodeListe__row"]]: true, // Alle rader får basis klasse
    [styles["periodeListe__row--highlighted"]]: isHighlighted,
    [styles["periodeListe__row--disabled"]]: isDisabled,
  });

  const periodeDatoTekst = `${formatterDato({ dato: periode.periode.fraOgMed })} - ${formatterDato({
    dato: periode.periode.tilOgMed,
  })}`;

  const erOpprettet = getStatus(periode) === PERIODE_RAD_STATUS.Opprettet;

  return (
    <Table.ExpandableRow
      content={
        !erOpprettet && (
          <article
            key={periode.id}
            aria-label={`Periode ${periode.periode.fraOgMed}`}
            className={classNames(styles.container, pageStyles.fadeIn)}
          >
            <div className={styles.forhandsvisning}>
              <RapporteringsperiodeVisning perioder={[periode]} />
              <PeriodeDetaljer
                key={periode.id}
                periode={periode}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
              />
            </div>
          </article>
        )
      }
      className={radKlasse}
      expandOnRowClick={!erOpprettet}
      expansionDisabled={erOpprettet}
    >
      <Table.HeaderCell scope="row" textSize="small" className={radKlasse} style={{ width: "10%" }}>
        {ukenummer(periode)}
      </Table.HeaderCell>
      <Table.DataCell textSize="small" className={radKlasse} style={{ width: "20%" }}>
        {periodeDatoTekst}
      </Table.DataCell>
      <Table.DataCell textSize="small" className={radKlasse} style={{ width: "15%" }}>
        <Status periode={periode} />
      </Table.DataCell>
      <Table.DataCell textSize="small" className={radKlasse} style={{ width: "20%" }}>
        <TypeAktivitet periode={periode} />
      </Table.DataCell>
      <Table.DataCell textSize="small" className={radKlasse} style={{ width: "15%" }}>
        <Innsendt periode={periode} />
      </Table.DataCell>
      <Table.DataCell textSize="small" className={radKlasse} style={{ width: "15%" }}>
        {periode.sisteFristForTrekk ? formatterDato({ dato: periode.sisteFristForTrekk }) : ""}
      </Table.DataCell>
    </Table.ExpandableRow>
  );
}
