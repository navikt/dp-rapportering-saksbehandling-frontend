import { useState } from "react";
import { Checkbox, Table } from "@navikt/ds-react";
import type { IRapporteringsperiode } from "~/utils/types";
import { TypeAktivitet } from "./TypeAktivitet";
import { FormattertDato } from "./FormattertDato";
import { formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { InnsendtDato } from "./InnsendtDato";
import { Status } from "./Status";

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
        {perioder.map((periode) => {
          const ukenummer = formaterPeriodeTilUkenummer(
            periode.periode.fraOgMed,
            periode.periode.tilOgMed
          );
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
              <Table.DataCell scope="row">{ukenummer}</Table.DataCell>
              <Table.DataCell scope="row">
                <FormattertDato dato={periode.periode.fraOgMed} /> -{" "}
                <FormattertDato dato={periode.periode.tilOgMed} />
              </Table.DataCell>
              <Table.DataCell>
                <Status status={periode.status} />
              </Table.DataCell>
              <Table.DataCell>
                <TypeAktivitet periode={periode} />
              </Table.DataCell>
              <Table.DataCell>
                <InnsendtDato
                  mottattDato={periode.mottattDato ?? ""}
                  tilOgMed={periode.periode.tilOgMed}
                />
              </Table.DataCell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};
