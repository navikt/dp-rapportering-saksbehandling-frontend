import { Checkbox, CheckboxGroup, TextField } from "@navikt/ds-react";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { hentUkedag } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./Korrigering.module.css";
import {
  endreArbeid,
  endreDag,
  erIkkeAktiv,
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
          syk ? AKTIVITET_TYPE.Syk : "",
          fravaer ? AKTIVITET_TYPE.Fravaer : "",
          utdanning ? AKTIVITET_TYPE.Utdanning : "",
        ].filter((v) => v);

        const aktiviteter = dag.aktiviteter.map((aktivitet) => aktivitet.type);

        return (
          <div key={dag.dato}>
            <div>{hentUkedag(dag.dato)}</div>
            <TextField
              data-dato={dag.dato}
              label="arbeid"
              hideLabel
              value={arbeid ?? ""}
              onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
              disabled={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid)}
            ></TextField>
            <CheckboxGroup
              legend="Aktiviteter"
              hideLegend
              onChange={(value) => endreDag(value, dag, setKorrigerteDager)}
              value={value}
            >
              <Checkbox
                value={AKTIVITET_TYPE.Syk}
                hideLabel
                disabled={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Syk)}
              >
                Syk
              </Checkbox>
              <Checkbox
                value={AKTIVITET_TYPE.Fravaer}
                hideLabel
                disabled={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Fravaer)}
              >
                Fravær
              </Checkbox>
              <Checkbox
                value={AKTIVITET_TYPE.Utdanning}
                hideLabel
                disabled={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Utdanning)}
              >
                Utdanning
              </Checkbox>
            </CheckboxGroup>
          </div>
        );
      })}
    </div>
  );
}
