import { Checkbox, Table } from "@navikt/ds-react";
import classNames from "classnames";

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
  const radKlasse = valgt ? styles["periodeListe__row--selected"] : undefined;
  const ukeKlasse = classNames(styles.periodeListe__week, {
    [styles["periodeListe__week--selected"]]: valgt,
    [styles["periodeListe__row--selected"]]: valgt,
  });

  const handleCheckboxChange = () => toggle(periode.id);
  const periodeDatoTekst = `${formatterDato({ dato: periode.periode.fraOgMed })} - ${formatterDato({
    dato: periode.periode.tilOgMed,
  })}`;

  return (
    <Table.Row selected={valgt} className={radKlasse} onClick={() => toggle(periode.id)}>
      <Table.DataCell className={ukeKlasse}>
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
        >
          {`Velg rapporteringsperiode uke ${ukenummer(periode)}`}
        </Checkbox>
      </Table.DataCell>
      <Table.DataCell className={radKlasse}>{ukenummer(periode)}</Table.DataCell>
      <Table.DataCell className={radKlasse}>{periodeDatoTekst}</Table.DataCell>
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
      <Table.DataCell className={radKlasse}>
        {formatterDato({ dato: periode.sisteFristForTrekk })}
      </Table.DataCell>
    </Table.Row>
  );
}
