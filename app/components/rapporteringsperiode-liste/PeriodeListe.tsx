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

// Hjelpefunksjon for å lage en Set med gyldige ID-er
function getGyldigeRapporteringsIder(perioder: IRapporteringsperiode[]) {
  return new Set(perioder.map((p) => p.id));
}

export function RapporteringsperiodeListe({ perioder }: IProps) {
  const [searchParams, setParams] = useSearchParams();
  const ids = searchParams.get("rapporteringsid")?.split(",") ?? [];

  function toggleRapporteringsperiode(id: string) {
    const gyldigeIds = getGyldigeRapporteringsIder(perioder);
    const gjeldendeValgte = ids.filter((valgtId) => gyldigeIds.has(valgtId));
    const alleredeValgt = gjeldendeValgte.includes(id);

    // Ikke tillat flere enn maks hvis man prøver å legge til en ny
    if (!alleredeValgt && gjeldendeValgte.length >= MAKS_ANTALL_VALGTE_RAPPORTERINGSPERIODER) {
      return;
    }

    const nyeValgte = alleredeValgt
      ? gjeldendeValgte.filter((valgtId) => valgtId !== id)
      : [...gjeldendeValgte, id];

    const params = new URLSearchParams(searchParams);
    if (nyeValgte.length === 0) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", nyeValgte.join(","));
    }

    setParams(params);
  }

  function toggleRow(event: React.ChangeEvent<HTMLInputElement>) {
    const id = event.target.dataset.id;
    if (id) toggleRapporteringsperiode(id);
  }

  function toggleRowViaRowClick(id: string) {
    toggleRapporteringsperiode(id);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gyldigeIds = getGyldigeRapporteringsIder(perioder);
    const urlValgte = params.get("rapporteringsid")?.split(",") ?? [];
    const filtrerteValgte = urlValgte.filter((id) => gyldigeIds.has(id));

    const nyeParams = new URLSearchParams();
    if (filtrerteValgte.length > 0) {
      nyeParams.set("rapporteringsid", filtrerteValgte.join(","));
    }

    setParams(nyeParams);
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
            const valgtStil = classNames({ [styles.valgt]: valgt });

            return (
              <Table.Row
                key={periode.id}
                selected={valgt}
                tabIndex={0}
                onClick={() => toggleRowViaRowClick(periode.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleRowViaRowClick(periode.id);
                  }
                }}
              >
                <Table.DataCell className={classNames(styles.week, valgtStil)} scope="row">
                  <Checkbox
                    className={styles.checkbox}
                    hideLabel
                    data-id={periode.id}
                    checked={valgt}
                    onChange={toggleRow}
                    onClick={(e) => e.stopPropagation()}
                    readOnly={!valgt && ids.length >= MAKS_ANTALL_VALGTE_RAPPORTERINGSPERIODER}
                    aria-labelledby={`id-${periode.id}`}
                  >
                    {`Velg rapporteringsperiode uke ${ukenummer(periode)}`}
                  </Checkbox>
                </Table.DataCell>
                <Table.DataCell className={valgtStil} scope="row">
                  {ukenummer(periode)}
                </Table.DataCell>
                <Table.DataCell className={valgtStil} scope="row">
                  <Dato periode={periode} />
                </Table.DataCell>
                <Table.DataCell className={valgtStil}>
                  <Status status={periode.status} />
                </Table.DataCell>
                <Table.DataCell className={valgtStil}>
                  <TypeAktivitet periode={periode} />
                </Table.DataCell>
                <Table.DataCell className={valgtStil}>
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
