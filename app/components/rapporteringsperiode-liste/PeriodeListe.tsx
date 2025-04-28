import { Checkbox, Table } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { ukenummer } from "~/utils/dato.utils";
import type { IRapporteringsperiode } from "~/utils/types";

import { Dato } from "./Dato";
import { Innsendt } from "./Innsendt";
import styles from "./PeriodeListe.module.css";
import { Status } from "./Status";
import { TypeAktivitet } from "./TypeAktivitet";

interface IProps {
  perioder: IRapporteringsperiode[];
}

const MAKS_ANTALL_VALGTE_RAPPORTERINGSPERIODER = 3;

export function RapporteringsperiodeListe({ perioder }: IProps) {
  const [searchParams, setParams] = useSearchParams();
  const ids = searchParams.get("rapporteringsid")?.split(",") ?? [];

  function toggleRow(event: React.ChangeEvent<HTMLInputElement>) {
    const id = event.target.dataset.id;
    if (!id) return;

    updateParams(id);
  }

  function toggleRowViaRowClick(id: string) {
    updateParams(id);
  }

  function updateParams(id: string) {
    const params = new URLSearchParams(window.location.search);
    const _ids = [...ids].filter((value) => value && perioder.map(({ id }) => id).includes(value));

    if (_ids.includes(id) && _ids.length > 1) {
      params.set("rapporteringsid", _ids.filter((i) => i !== id).join(","));
    } else if (_ids.includes(id)) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", [..._ids, id].join(","));
    }

    if (params.get("rapporteringsid") === "") {
      params.delete("rapporteringsid");
    }

    setParams(params);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFraUrlSomErIPerioder = ids.filter((valgtId) =>
      perioder.map(({ id }) => id).includes(valgtId)
    );

    if (!idFraUrlSomErIPerioder.length) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", idFraUrlSomErIPerioder.join(","));
    }

    setParams(params);
  }, []);

  return (
    <div className={styles.tabell}>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Vis</Table.HeaderCell>
            <Table.HeaderCell scope="col">Uke</Table.HeaderCell>
            <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            <Table.HeaderCell scope="col">Aktiviteter</Table.HeaderCell>
            <Table.HeaderCell scope="col">Innsendt</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            const valgt = ids.includes(periode.id);
            const valgtStil = { [styles.valgt]: valgt };

            return (
              <Table.Row
                key={periode.id}
                selected={valgt}
                tabIndex={0} // Tab-navigasjon støttes
                onClick={() => toggleRowViaRowClick(periode.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault(); // Unngå scrolling ved mellomrom
                    toggleRowViaRowClick(periode.id);
                  }
                }}
              >
                <Table.DataCell className={styles.checkboxTd} scope="row">
                  <Checkbox
                    className={styles.checkbox}
                    hideLabel
                    data-id={periode.id}
                    checked={valgt}
                    onChange={toggleRow}
                    onClick={(e) => e.stopPropagation()} // Hindre radklikk
                    readOnly={!valgt && ids.length >= MAKS_ANTALL_VALGTE_RAPPORTERINGSPERIODER}
                    aria-labelledby={`id-${periode.id}`}
                  >
                    {`Velg rapporteringsperiode uke ${ukenummer(periode)}`}
                  </Checkbox>
                </Table.DataCell>
                <Table.DataCell className={classNames(styles.week, valgtStil)} scope="row">
                  {ukenummer(periode)}
                </Table.DataCell>
                <Table.DataCell className={classNames(valgtStil)} scope="row">
                  <Dato periode={periode} />
                </Table.DataCell>
                <Table.DataCell className={classNames(valgtStil)}>
                  <Status status={periode.status} />
                </Table.DataCell>
                <Table.DataCell className={classNames(valgtStil)}>
                  <TypeAktivitet periode={periode} />
                </Table.DataCell>
                <Table.DataCell className={classNames(valgtStil)}>
                  <Innsendt
                    mottattDato={periode.mottattDato ?? ""}
                    tilOgMed={periode.periode.tilOgMed}
                    sisteFristForTrekk={periode.sisteFristForTrekk}
                    status={periode.status}
                  />
                </Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
