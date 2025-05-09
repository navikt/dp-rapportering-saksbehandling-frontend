import { Checkbox, Table } from "@navikt/ds-react";
import classNames from "classnames";

import { ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Dato } from "./Dato";
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
  const radKlasse = valgt ? styles["periodeListe__row--selected"] : undefined;
  const ukeKlasse = classNames(styles.periodeListe__week, {
    [styles["periodeListe__week--selected"]]: valgt,
    [styles["periodeListe__row--selected"]]: valgt,
  });

  const handleCheckboxChange = () => toggle(periode.id);

  return (
    <Table.Row
      selected={valgt}
      className={radKlasse}
      tabIndex={0}
      onClick={() => toggle(periode.id)}
      onKeyDown={(event) => {
        if (["Enter", " "].includes(event.key)) {
          event.preventDefault();
          toggle(periode.id);
        }
      }}
    >
      <Table.DataCell className={ukeKlasse} scope="row">
        <Checkbox
          className={styles.periodeListe__checkbox}
          hideLabel
          checked={valgt}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          readOnly={!valgt && valgteAntall >= maksValgte}
          aria-labelledby={`id-${periode.id}`}
        >
          {`Velg rapporteringsperiode uke ${ukenummer(periode)}`}
        </Checkbox>
      </Table.DataCell>
      <Table.DataCell className={radKlasse} scope="row">
        {ukenummer(periode)}
      </Table.DataCell>
      <Table.DataCell className={radKlasse} scope="row">
        <Dato periode={periode} />
      </Table.DataCell>
      <Table.DataCell className={radKlasse}>
        <Status status={periode.status} />
      </Table.DataCell>
      <Table.DataCell className={radKlasse}>
        <TypeAktivitet periode={periode} />
      </Table.DataCell>
      <Table.DataCell className={radKlasse}>
        <Innsendt
          mottattDato={periode.mottattDato ?? ""}
          tilOgMed={periode.periode.tilOgMed}
          sisteFristForTrekk={periode.sisteFristForTrekk}
          status={periode.status}
        />
      </Table.DataCell>
    </Table.Row>
  );
}
