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
              checked={selectedRows.length === data.length}
              indeterminate={selectedRows.length > 0 && selectedRows.length !== data.length}
              onChange={() => {
                selectedRows.length
                  ? setSelectedRows([])
                  : setSelectedRows(data.map(({ ukeDato }) => ukeDato));
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

const data = [
  {
    ukeDato: "9-10 | 24.februar - 9.mars",
    status: "Beregning utført",
    typeAktivitet: "jobb, syk, ferie",
    innsendtDato: "13. mars 2025",
  },
  {
    ukeDato: "9-10 | 24.februar - 9.mars",
    status: "Skal ikke beregnes",
    typeAktivitet: "syk, ferie",
    innsendtDato: "11. mars 2025",
  },
  {
    ukeDato: "7-8 | 10.februar - 23.februar",
    status: "Beregning utført",
    typeAktivitet: "jobb, syk, ferie, utdanning",
    innsendtDato: "23. februar 2025",
  },
  {
    ukeDato: "5-6 | 27.januar - 9.februar",
    status: "Beregning utført",
    typeAktivitet: "",
    innsendtDato: "8. februar 2025",
  },
  {
    ukeDato: "3-4 | 13.januar - 26.januar",
    status: "Meldekort opprettet",
    typeAktivitet: "jobb",
    innsendtDato: "25. januar 2025",
  },
];
