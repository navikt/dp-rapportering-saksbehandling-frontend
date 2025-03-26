import { Checkbox, TextField } from "@navikt/ds-react";
import classNames from "classnames";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, hentUkedag } from "~/utils/dato.utils";
import type { IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./Korrigering.module.css";
import { endreArbeid, endreDag, erIkkeAktiv, type SetKorrigerteDager } from "./korrigering.utils";

interface IProps {
  uke: IRapporteringsperiodeDag[];
  setKorrigerteDager: SetKorrigerteDager;
  ukenummer: number;
}

export function KorrigeringUke({ uke, setKorrigerteDager, ukenummer }: IProps) {
  return (
    <div className={styles.korrigeringUke}>
      <h3 className={styles.ukenummer}>Uke {ukenummer}</h3>
      <table className={classNames(styles.uke)}>
        <thead>
          <tr>
            {uke.map((dag) => (
              <td key={dag.dato}>
                <h4>{hentUkedag(dag.dato)}</h4>
                {formatterDag(dag.dato)}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {uke.map((dag) => {
              const aktiviteter = dag.aktiviteter.map((aktivitet) => aktivitet.type);

              return (
                <td key={dag.dato}>
                  <TextField
                    data-dato={dag.dato}
                    label="arbeid"
                    hideLabel
                    value={dag.arbeid ?? ""}
                    onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
                    readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid)}
                    className={classNames("arbeidInput")}
                  />
                </td>
              );
            })}
          </tr>
          {[AKTIVITET_TYPE.Syk, AKTIVITET_TYPE.Fravaer, AKTIVITET_TYPE.Utdanning].map(
            (aktivitet) => (
              <tr key={aktivitet}>
                {uke.map((dag) => {
                  const aktiviteter = dag.aktiviteter.map((aktivitet) => aktivitet.type);

                  return (
                    <td key={dag.dato}>
                      <Checkbox
                        value={AKTIVITET_TYPE[aktivitet]}
                        hideLabel
                        readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE[aktivitet])}
                        className={classNames(styles.checkbox)}
                        checked={dag.aktiviteter.some((a) => a.type === AKTIVITET_TYPE[aktivitet])}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          const updatedAktiviteter = isChecked
                            ? [...aktiviteter, AKTIVITET_TYPE[aktivitet]]
                            : aktiviteter.filter((a) => a !== AKTIVITET_TYPE[aktivitet]);

                          endreDag(updatedAktiviteter, dag, setKorrigerteDager);
                        }}
                      >
                        {aktivitet}
                      </Checkbox>
                    </td>
                  );
                })}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
