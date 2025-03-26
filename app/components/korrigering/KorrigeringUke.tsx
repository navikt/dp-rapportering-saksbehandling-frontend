import { Checkbox } from "@navikt/ds-react";
import classNames from "classnames";

import { AKTIVITET_TYPE } from "~/utils/constants";
import type { IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./Korrigering.module.css";
import { endreDag, erIkkeAktiv, type SetKorrigerteDager } from "./korrigering.utils";

interface IProps {
  uke: IRapporteringsperiodeDag[];
  setKorrigerteDager: SetKorrigerteDager;
  ukenummer: number;
}

export function KorrigeringUke({ uke, setKorrigerteDager, ukenummer }: IProps) {
  return (
    <>
      <h3>Uke {ukenummer}</h3>
      <table className={classNames(styles.uke)}>
        <thead>
          <tr>
            {uke.map((dag) => {
              return <td key={dag.dato}>{dag.dato}</td>;
            })}
          </tr>
        </thead>
        <tbody>
          {[AKTIVITET_TYPE.Syk, AKTIVITET_TYPE.Fravaer, AKTIVITET_TYPE.Utdanning].map(
            (aktivitet) => {
              return (
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
                          checked={dag.aktiviteter.some(
                            (a) => a.type === AKTIVITET_TYPE[aktivitet]
                          )}
                          onChange={(event) =>
                            endreDag(
                              event.target.checked ? [AKTIVITET_TYPE[aktivitet]] : [],
                              dag,
                              setKorrigerteDager
                            )
                          }
                        >
                          Utdanning
                        </Checkbox>
                      </td>
                    );
                  })}
                </tr>
              );
            }
          )}
          {/* //   {uke.map((dag, index) => (
        //     <KorrigeringDag
        //       key={dag.dato}
        //       dag={dag}
        //       index={index}
        //       setKorrigerteDager={setKorrigerteDager}
        //     />
        //   ))} */}
        </tbody>
      </table>
    </>
  );
}

<table>
  <thead>
    <tr>
      <td>Man 10.</td>
      <td>Tir 11.</td>
      <td>Ons 12.</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ARBEID</td>
      <td>ARBEID</td>
      <td>ARBEID</td>
    </tr>
    <tr>
      <td>Syk</td>
      <td>Syk</td>
      <td>Syk</td>
    </tr>
  </tbody>
</table>;
