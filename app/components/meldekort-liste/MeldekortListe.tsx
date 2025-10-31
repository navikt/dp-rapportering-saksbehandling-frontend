import { Table } from "@navikt/ds-react";

import type { IRapporteringsperiode, TAnsvarligSystem } from "~/utils/types";

import { MeldekortRad } from "./components/rad/MeldekortRad";
import styles from "./meldekortListe.module.css";

interface IProps {
  perioder: IRapporteringsperiode[];
  personId?: string;
  ansvarligSystem: TAnsvarligSystem;
}

const KOLONNE_TITLER = ["", "Uke", "Dato", "Status", "Aktiviteter", "Meldedato", "Frist"];

const KOLONNE_BREDDER = ["5%", "10%", "20%", "18%", "18%", "14%", "15%"];

export function MeldekortListe({ perioder, personId, ansvarligSystem }: IProps) {
  return (
    <div className={styles.periodeListe}>
      <Table>
        <colgroup>
          {KOLONNE_BREDDER.map((bredde, index) => (
            <col key={index} style={{ width: bredde }} />
          ))}
        </colgroup>
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
              <MeldekortRad
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
