import { Checkbox, Table } from "@navikt/ds-react";
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

    const params = new URLSearchParams(window.location.search);
    const _ids = [...ids].filter((value) => value);

    if (_ids.includes(id) && _ids.length > 1) {
      params.set("rapporteringsid", _ids.filter((i) => i !== id).join(","));
    } else if (_ids.includes(id)) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", [..._ids, id].join(","));
    }

    const firstSelectedId = params.get("rapporteringsid")?.split(",")[0] ?? "";
    if (firstSelectedId) {
      params.set("valgtId", firstSelectedId);
    } else {
      params.delete("valgtId");
    }

    if (params.get("rapporteringsid") === "") {
      params.delete("rapporteringsid");
    }

    setParams(params);
  }

  return (
    <div className={styles.tabell}>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col"></Table.HeaderCell>
            <Table.HeaderCell scope="col">Uke</Table.HeaderCell>
            <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            <Table.HeaderCell scope="col">Aktiviteter</Table.HeaderCell>
            <Table.HeaderCell scope="col">Innsendt</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            return (
              <Table.Row key={periode.id} selected={ids.includes(periode.id)}>
                <Table.DataCell>
                  <Checkbox
                    hideLabel
                    data-id={periode.id}
                    checked={ids.includes(periode.id)}
                    onChange={toggleRow}
                    disabled={
                      !ids.includes(periode.id) &&
                      ids.length >= MAKS_ANTALL_VALGTE_RAPPORTERINGSPERIODER
                    }
                    aria-labelledby={`id-${periode.id}`}
                  >
                    Velg rapporteringsperiode
                  </Checkbox>
                </Table.DataCell>
                <Table.DataCell scope="row">{ukenummer(periode)}</Table.DataCell>
                <Table.DataCell scope="row">
                  <Dato periode={periode} />
                </Table.DataCell>
                <Table.DataCell>
                  <Status status={periode.status} />
                </Table.DataCell>
                <Table.DataCell>
                  <TypeAktivitet periode={periode} />
                </Table.DataCell>
                <Table.DataCell>
                  <Innsendt
                    mottattDato={periode.mottattDato ?? ""}
                    tilOgMed={periode.periode.tilOgMed}
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
