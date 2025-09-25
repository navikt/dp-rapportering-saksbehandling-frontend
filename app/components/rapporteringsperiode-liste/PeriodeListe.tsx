import { Table } from "@navikt/ds-react";

import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { PeriodeRad } from "./components/rad/PeriodeRad";
import styles from "./PeriodeListe.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

const KOLONNE_TITLER = ["", "Uke", "Dato", "Status", "Aktiviteter", "Meldedato", "Frist"];

export function RapporteringsperiodeListe({ perioder, personId, ansvarligSystem }: IProps) {
  return (
    <div className={styles.periodeListe}>
      <Table size="small">
        <Table.Header>
          <Table.Row>
            {KOLONNE_TITLER.map((kolonne, index) => {
              return (
                <Table.HeaderCell key={index} scope="col" textSize="small">
                  {kolonne}
                </Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {perioder.map((periode) => {
            return (
              <PeriodeRad
                key={periode.id}
                periode={periode}
                personId={personId}
                ansvarligSystem={ansvarligSystem}
              />
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
