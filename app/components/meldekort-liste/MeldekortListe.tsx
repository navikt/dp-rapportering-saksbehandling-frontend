import { useState, useEffect, useCallback } from "react";
import { Checkbox, Table } from "@navikt/ds-react";
import type { IRapporteringsperiode } from "~/utils/types";
import { TypeAktivitet } from "./TypeAktivitet";
import { FormattertDato } from "./FormattertDato";
import { formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { InnsendtDato } from "./InnsendtDato";
import { Status } from "./Status";
import styles from "./MeldekortListe.module.css";
import { useSearchParams } from "react-router";

interface IProps {
  perioder: IRapporteringsperiode[];
}

export function MeldekortListe({ perioder }: IProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentQueryParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set("rapporteringsid", selectedRows.join(","));
    setSearchParams(params);

    if (!selectedRows.length) {
      params.delete("rapporteringsid");
      setSearchParams(params);
    }
  }, [selectedRows]);

  const toggleSelectedRow = useCallback((value: string) => {
    setSelectedRows((prev) =>
      prev.includes(value)
        ? prev.filter((id) => id !== value)
        : prev.length < 3
        ? [...prev, value]
        : prev
    );
  }, []);

  const toggleSelectAll = () => {
    setSelectedRows((prev) => (prev.length ? [] : perioder.slice(0, 3).map(({ id }) => id)));
  };

  return (
    <div className={styles.tabell}>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.DataCell>
              <Checkbox
                checked={selectedRows.length === perioder.length}
                indeterminate={selectedRows.length > 0 && selectedRows.length !== perioder.length}
                onChange={toggleSelectAll}
                hideLabel
              >
                Velg de 3 første meldekortene
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
                    Velg meldekort
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
    </div>
  );
}
