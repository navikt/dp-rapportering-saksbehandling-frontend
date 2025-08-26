import { Checkbox, Table } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Innsendt } from "./Innsendt";
import styles from "./PeriodeListe.module.css";
import { Status } from "./Status";
import { TypeAktivitet } from "./TypeAktivitet";

interface Props {
  periode: IRapporteringsperiode;
  valgt: boolean;
  toggle: (id: string) => void;
  valgteAntall: number;
  maksValgte: number;
}

export function PeriodeRad({ periode, valgt, toggle, valgteAntall, maksValgte }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const updatedId = searchParams.get("updated");

    // Highlight kun hvis dette er den oppdaterte perioden
    // (korrigeringen, ikke det originale meldekortet)
    const shouldHighlight = updatedId === periode.id;

    if (shouldHighlight) {
      setIsHighlighted(true);

      // Fjern URL parameter i en setTimeout for å unngå rendering-konflikt
      setTimeout(() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("updated");
        setSearchParams(newSearchParams, { replace: true });
      }, 0);

      // Fjern highlight etter animasjonen er ferdig
      setTimeout(() => {
        setIsHighlighted(false);
      }, 3600);
    }
  }, [searchParams, setSearchParams, periode.id, periode.originalMeldekortId]);

  const isDisabled = !valgt && valgteAntall >= maksValgte;

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

  return (
    <Table.Row
      selected={valgt}
      className={radKlasse}
      onClick={isDisabled ? undefined : () => toggle(periode.id)}
      role={isDisabled ? undefined : "button"}
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={
        isDisabled
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle(periode.id);
              }
            }
      }
      aria-label={`${valgt ? "Avvelg" : "Velg"} rapporteringsperiode uke ${ukenummer(
        periode,
      )}, ${periodeDatoTekst}`}
      aria-pressed={valgt}
    >
      <Table.DataCell textSize="small" className={ukeKlasse}>
        <Checkbox
          className={styles.periodeListe__checkbox}
          hideLabel
          checked={valgt}
          onChange={(e) => {
            e.stopPropagation(); // Stopper click fra å gå til raden
            handleCheckboxChange();
          }}
          onClick={(e) => e.stopPropagation()}
          readOnly={!valgt && valgteAntall >= maksValgte}
          aria-hidden="true"
          tabIndex={-1}
        >
          {`Velg rapporteringsperiode uke ${ukenummer(periode)}`}
        </Checkbox>
      </Table.DataCell>
      <Table.DataCell textSize="small" className={radKlasse}>
        {ukenummer(periode)}
      </Table.DataCell>
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
  );
}
