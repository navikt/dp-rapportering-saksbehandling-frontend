import { useState } from "react";
import { Checkbox, Table } from "@navikt/ds-react";
import type { IRapporteringsperiode } from "~/utils/types";

export const MeldekortListe = ({ perioder }: { perioder: IRapporteringsperiode[] }) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const toggleSelectedRow = (value: string) =>
    setSelectedRows((list) =>
      list.includes(value) ? list.filter((id) => id !== value) : [...list, value]
    );

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.DataCell>
            <Checkbox
              checked={selectedRows.length === perioder.length}
              indeterminate={selectedRows.length > 0 && selectedRows.length !== perioder.length}
              onChange={() => {
                selectedRows.length
                  ? setSelectedRows([])
                  : setSelectedRows(perioder.map(({ id }) => id));
              }}
              hideLabel
            >
              Velg alle rader
            </Checkbox>
          </Table.DataCell>

          <Table.HeaderCell scope="col">Uke</Table.HeaderCell>
          <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
          <Table.HeaderCell scope="col">Status</Table.HeaderCell>
          <Table.HeaderCell scope="col">Type aktivitet</Table.HeaderCell>
          <Table.HeaderCell scope="col">Innsendt dato</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {perioder.map((periode, i) => {
          return (
            <Table.Row key={periode.id} selected={selectedRows.includes(periode.id)}>
              <Table.DataCell>
                <Checkbox
                  hideLabel
                  checked={selectedRows.includes(periode.id)}
                  onChange={() => toggleSelectedRow(periode.id)}
                  aria-labelledby={`id-${periode.id}`}
                >
                  {" "}
                </Checkbox>
              </Table.DataCell>
              <Table.DataCell scope="row"></Table.DataCell>
              <Table.DataCell scope="row">
                {periode.periode.fraOgMed} - {periode.periode.tilOgMed}
              </Table.DataCell>
              <Table.DataCell>{periode.status}</Table.DataCell>
              <Table.DataCell>{}</Table.DataCell>
              <Table.DataCell>{periode.mottattDato}</Table.DataCell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
