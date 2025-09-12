import { Checkbox, Table } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import pageStyles from "~/route-styles/person.module.css";
import { QUERY_PARAMS } from "~/utils/constants";
import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { PeriodeDetaljer } from "../rapporteringsperiode-detaljer/PeriodeDetaljer";
import { RapporteringsperiodeVisning } from "../rapporteringsperiode-visning/PeriodeVisning";
import { Innsendt } from "./Innsendt";
import styles from "./PeriodeListe.module.css";
import { getStatus, PERIODE_RAD_STATUS, Status } from "./Status";
import { TypeAktivitet } from "./TypeAktivitet";

interface Props {
  periode: IRapporteringsperiode;
  valgt: boolean;
  toggle: (id: string) => void;
  valgteAntall: number;
  maksValgte: number;
  alternativVisning: boolean;
}

export function PeriodeRad({
  periode,
  valgt,
  toggle,
  valgteAntall,
  maksValgte,
  alternativVisning,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [announceUpdate, setAnnounceUpdate] = useState("");

  useEffect(() => {
    const oppdatertId = searchParams.get(QUERY_PARAMS.OPPDATERT);

    // Highlight kun hvis dette er den oppdaterte perioden
    // (innsendt, eller korrigeringen og ikke det originale meldekortet)
    const shouldHighlight =
      (periode.originalMeldekortId && oppdatertId === periode.originalMeldekortId) ||
      (oppdatertId === periode.id && !periode.originalMeldekortId);

    if (shouldHighlight) {
      setIsHighlighted(true);

      // Sett melding for skjermlesere
      const erKorrigering = periode.originalMeldekortId;
      const melding = erKorrigering
        ? `Meldekort for uke ${ukenummer(periode)} ble korrigert og oppdatert`
        : `Meldekort for uke ${ukenummer(periode)} ble sendt inn`;
      setAnnounceUpdate(melding);

      // Fjern URL parameter i en setTimeout for å unngå rendering-konflikt
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(QUERY_PARAMS.OPPDATERT);
        setSearchParams(newSearchParams, { replace: true });
      }, 0);

      // Fjern highlight etter animasjonen er ferdig
      setTimeout(() => {
        setIsHighlighted(false);
      }, 3600);

      // Fjern skjermleser-melding etter litt tid
      setTimeout(() => {
        setAnnounceUpdate("");
      }, 5000);
    }
  }, [searchParams, setSearchParams, periode.id, periode.originalMeldekortId]);

  const isDisabled =
    (!valgt && valgteAntall >= maksValgte) || getStatus(periode) === PERIODE_RAD_STATUS.Opprettet;

  const radKlasse = classNames({
    [styles["periodeListe__row--selected"]]: valgt,
    [styles["periodeListe__row"]]: true, // Alle rader får basis klasse
    [styles["periodeListe__row--highlighted"]]: isHighlighted,
    [styles["periodeListe__row--disabled"]]: isDisabled,
  });

  const ukeKlasse = classNames(styles.periodeListe__week, {
    [styles["periodeListe__week--selected"]]: valgt,
    [styles["periodeListe__row--selected"]]: valgt,
  });

  const handleCheckboxChange = () => toggle(periode.id);
  const periodeDatoTekst = `${formatterDato({ dato: periode.periode.fraOgMed })} - ${formatterDato({
    dato: periode.periode.tilOgMed,
  })}`;

  if (alternativVisning) {
    const erOpprettet = getStatus(periode) === PERIODE_RAD_STATUS.Opprettet;

    return (
      <>
        {announceUpdate && (
          <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
            {announceUpdate}
          </div>
        )}
        <Table.ExpandableRow
          content={
            !erOpprettet && (
              <article
                key={periode.id}
                aria-label={`Periode ${periode.periode.fraOgMed}`}
                className={classNames(pageStyles.periodeContainer, pageStyles.fadeIn)}
              >
                <div className={pageStyles.forhandsvisning}>
                  <RapporteringsperiodeVisning perioder={[periode]} />
                </div>
                <div className={pageStyles.detaljer}>
                  <PeriodeDetaljer key={periode.id} periode={periode} personId={""} />
                </div>
              </article>
            )
          }
          selected={valgt}
          className={radKlasse}
          expandOnRowClick={!erOpprettet}
        >
          <Table.HeaderCell
            scope="row"
            textSize="small"
            className={radKlasse}
            style={{ width: "10%" }}
          >
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
      </>
    );
  }

  return (
    <>
      {announceUpdate && (
        <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">
          {announceUpdate}
        </div>
      )}
      <Table.Row selected={valgt} className={radKlasse}>
        {!alternativVisning && (
          <Table.DataCell textSize="small" className={ukeKlasse}>
            {getStatus(periode) !== PERIODE_RAD_STATUS.Opprettet && (
              <Checkbox
                className={styles.periodeListe__checkbox}
                checked={valgt}
                onChange={handleCheckboxChange}
                disabled={isDisabled}
                hideLabel
              >
                Uke {ukenummer(periode)}
              </Checkbox>
            )}
          </Table.DataCell>
        )}
        <Table.HeaderCell scope="row" textSize="small" className={radKlasse}>
          {ukenummer(periode)}
        </Table.HeaderCell>
        <Table.DataCell textSize="small" className={radKlasse}>
          {periodeDatoTekst}
        </Table.DataCell>
        <Table.DataCell textSize="small" className={radKlasse}>
          <Status periode={periode} />
        </Table.DataCell>
        <Table.DataCell textSize="small" className={radKlasse}>
          <TypeAktivitet periode={periode} />
        </Table.DataCell>
        <Table.DataCell textSize="small" className={radKlasse}>
          <Innsendt periode={periode} />
        </Table.DataCell>
        <Table.DataCell textSize="small" className={radKlasse}>
          {periode.sisteFristForTrekk ? formatterDato({ dato: periode.sisteFristForTrekk }) : ""}
        </Table.DataCell>
      </Table.Row>
    </>
  );
}
