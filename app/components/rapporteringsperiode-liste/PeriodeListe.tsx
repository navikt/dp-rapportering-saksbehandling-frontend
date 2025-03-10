import { Checkbox, Table } from "@navikt/ds-react";
import type { IRapporteringsperiode } from "~/utils/types";
import { TypeAktivitet } from "./TypeAktivitet";
import { ukenummer } from "~/utils/dato.utils";
import { Innsendt } from "./Innsendt";
import { Status } from "./Status";
import styles from "./PeriodeListe.module.css";
import { useSearchParams } from "react-router";
import { Dato } from "./Dato";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function RapporteringsperiodeListe({ perioder }: IProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const ids = searchParams.get("rapporteringsid")?.split(",") ?? [];

  function toggleRow(event: React.ChangeEvent<HTMLInputElement>) {
    const id = event.target.dataset.id;
    if (!id) return;

    const params = new URLSearchParams(window.location.search);
    const _ids = [...ids].filter((value) => value);

    if (_ids.includes(id)) {
      params.set("rapporteringsid", _ids.filter((i) => i !== id).join(","));
    } else {
      if (_ids.length < 3) {
        params.set("rapporteringsid", [..._ids, id].join(","));
      }
    }

    if (params.get("rapporteringsid") === "") {
      params.delete("rapporteringsid");
    }

    setSearchParams(params);
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
                    disabled={!ids.includes(periode.id) && ids.length >= 3}
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
