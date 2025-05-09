import { Table } from "@navikt/ds-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import type { IRapporteringsperiode } from "~/utils/types";

import styles from "./PeriodeListe.module.css";
import { PeriodeRad } from "./PeriodeRad";

interface Props {
  perioder: IRapporteringsperiode[];
}

const MAKS_VALGTE = 3;

const getGyldigeRapporteringsIder = (perioder: IRapporteringsperiode[]) =>
  new Set(perioder.map((p) => p.id));

export function RapporteringsperiodeListe({ perioder }: Props) {
  const [searchParams, setParams] = useSearchParams();
  const valgteIds = searchParams.get("rapporteringsid")?.split(",") ?? [];

  const oppdaterURLMedValgte = (valgte: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (valgte.length === 0) {
      params.delete("rapporteringsid");
    } else {
      params.set("rapporteringsid", valgte.join(","));
    }
    setParams(params);
  };

  const toggleRapporteringsperiode = (id: string) => {
    const gyldigeIds = getGyldigeRapporteringsIder(perioder);
    const gjeldendeValgte = valgteIds.filter((valgtId) => gyldigeIds.has(valgtId));
    const alleredeValgt = gjeldendeValgte.includes(id);

    if (!alleredeValgt && gjeldendeValgte.length >= MAKS_VALGTE) return;

    const oppdatertValgte = alleredeValgt
      ? gjeldendeValgte.filter((valgtId) => valgtId !== id)
      : [...gjeldendeValgte, id];

    oppdaterURLMedValgte(oppdatertValgte);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gyldigeIds = getGyldigeRapporteringsIder(perioder);
    const urlValgte = params.get("rapporteringsid")?.split(",") ?? [];
    const filtrerteValgte = urlValgte.filter((id) => gyldigeIds.has(id));

    oppdaterURLMedValgte(filtrerteValgte);
  }, []);

  return (
    <div className={styles.periodeListe}>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              scope="col"
              className={styles.periodeListe__header + " " + styles["periodeListe__header--first"]}
            >
              Vis
            </Table.HeaderCell>
            <Table.HeaderCell scope="col" className={styles.periodeListe__header}>
              Uke
            </Table.HeaderCell>
            <Table.HeaderCell scope="col" className={styles.periodeListe__header}>
              Dato
            </Table.HeaderCell>
            <Table.HeaderCell scope="col" className={styles.periodeListe__header}>
              Status
            </Table.HeaderCell>
            <Table.HeaderCell scope="col" className={styles.periodeListe__header}>
              Aktiviteter
            </Table.HeaderCell>
            <Table.HeaderCell scope="col" className={styles.periodeListe__header}>
              Innsendt
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => (
            <PeriodeRad
              key={periode.id}
              periode={periode}
              valgt={valgteIds.includes(periode.id)}
              toggle={toggleRapporteringsperiode}
              valgteAntall={valgteIds.length}
              maksValgte={MAKS_VALGTE}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
