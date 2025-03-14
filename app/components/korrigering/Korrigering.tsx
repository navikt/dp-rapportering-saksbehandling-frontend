import { Checkbox, CheckboxGroup, TextField } from "@navikt/ds-react";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { hentUkedag } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./Korrigering.module.css";
import {
  endreArbeid,
  endreDag,
  hentAktiviteter,
  type SetKorrigerteDager,
} from "./korrigering.utils";

interface IProps {
  korrigerteDager: IRapporteringsperiodeDag[];
  setKorrigerteDager: SetKorrigerteDager;
}

export function Korrigering({ korrigerteDager, setKorrigerteDager }: IProps) {
  return (
    <div className={styles.grid}>
      <div className={styles.aktiviteter}>
        <div></div>
        <p className="arbeid">Jobb</p>
        <p className="syk">Syk</p>
        <p className="fravaer">Ferie, fravær og utenlandsopphold</p>
        <p className="utdanning">Tiltak, kurs eller utdanning</p>
      </div>
      {korrigerteDager.map((dag) => {
        const { arbeid, syk, fravaer, utdanning } = hentAktiviteter(dag);
        const value = [
          syk ? "Syk" : "",
          fravaer ? AKTIVITET_TYPE.Fravaer : "",
          utdanning ? AKTIVITET_TYPE.Utdanning : "",
        ].filter((v) => v);

        return (
          <div key={dag.dato}>
            <div>{hentUkedag(dag.dato)}</div>
            <TextField
              data-dato={dag.dato}
              label="arbeid"
              hideLabel
              value={arbeid ?? ""}
              onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
            ></TextField>
            <CheckboxGroup
              legend="Aktiviteter"
              hideLegend
              onChange={(value) => endreDag(value, dag, setKorrigerteDager)}
              value={value}
            >
              <Checkbox value={AKTIVITET_TYPE.Syk} hideLabel>
                Syk
              </Checkbox>
              <Checkbox value={AKTIVITET_TYPE.Fravaer} hideLabel>
                Fravaer
              </Checkbox>
              <Checkbox value={AKTIVITET_TYPE.Utdanning} hideLabel>
                Utdanning
              </Checkbox>
            </CheckboxGroup>
          </div>
        );
      })}
    </div>
  );
}
