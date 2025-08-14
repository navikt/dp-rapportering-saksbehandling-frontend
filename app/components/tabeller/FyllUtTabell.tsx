import { Checkbox, TextField } from "@navikt/ds-react";
import classNames from "classnames";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, hentUkedag, hentUkerFraPeriode } from "~/utils/dato.utils";
import type { IPeriode } from "~/utils/types";

import {
  endreArbeid,
  endreDag,
  erIkkeAktiv,
  type IKorrigertDag,
  type SetKorrigerteDager,
} from "../korrigering/korrigering.utils";
import styles from "./tabeller.module.css";

interface IProps {
  dager: IKorrigertDag[];
  setKorrigerteDager: SetKorrigerteDager;
  periode: IPeriode;
}

const aktiviteter = [
  { type: AKTIVITET_TYPE.Arbeid, label: "Jobb" },
  { type: AKTIVITET_TYPE.Syk, label: "Syk" },
  { type: AKTIVITET_TYPE.Fravaer, label: "Ferie, fravær eller utenlandsopphold" },
  { type: AKTIVITET_TYPE.Utdanning, label: "Tiltak, kurs eller utdanning" },
];

export function FyllUtTabell({ dager, setKorrigerteDager, periode }: IProps) {
  const [uke1, uke2] = hentUkerFraPeriode(periode);
  return (
    <table>
      <caption className={styles.label}>Registrer aktiviteter:</caption>
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Aktivitet
          </th>
          <th aria-hidden="true" className={styles.gap}></th> {/* gap */}
          <th colSpan={7} className={styles.label}>
            Uke {uke1}
          </th>
          <th aria-hidden="true" className={styles.gap}></th> {/* gap */}
          <th colSpan={7} className={styles.label}>
            Uke {uke2}
          </th>
          <th aria-hidden="true" className={styles.gap}></th> {/* gap */}
          <th scope="col" className="sr-only">
            Oppsummering
          </th>
        </tr>
        <tr>
          <th aria-hidden="true" className={styles.gap}></th> {/* gap */}
          <th aria-hidden="true" className={styles.gap}></th> {/* gap */}
          {dager.slice(0, 7).map((dag) => (
            <th key={`ukedag-${dag.dato}`} className={styles.ukedag}>
              {hentUkedag(dag.dato)}
            </th>
          ))}
          <th aria-hidden="true" className={styles.gap}></th> {/* gap */}
          {dager.slice(7, 14).map((dag) => (
            <th key={`ukedag-${dag.dato}`} className={styles.ukedag}>
              {hentUkedag(dag.dato)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {aktiviteter.map(({ type, label }) => {
          const hoverClass = styles[`trHover${type.charAt(0).toUpperCase() + type.slice(1)}`];
          const aktivitetClass = styles[`aktivitet${type.charAt(0).toUpperCase() + type.slice(1)}`];
          return (
            <tr key={type} className={hoverClass}>
              <th scope="row">
                <div className={classNames(styles.aktivitet, aktivitetClass)}> {label}</div>
              </th>
              <td aria-hidden="true" className={styles.gap}></td>
              {/* Uke 1: Første 7 dager */}
              {dager.slice(0, 7).map((dag) => {
                const aktivitetstyper = dag.aktiviteter.map((a) => a.type);
                const aktiv = dag.aktiviteter.find((a) => a.type === type);
                const erDisabled = erIkkeAktiv(aktivitetstyper, type);
                const inputId = `${type}-${dag.dato}`;

                if (type === AKTIVITET_TYPE.Arbeid) {
                  return (
                    <td key={dag.dato}>
                      <TextField
                        size="small"
                        id={inputId}
                        label={`Timer jobb ${formatterDag(dag.dato)}`}
                        hideLabel
                        value={aktiv?.timer ?? ""}
                        onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
                        readOnly={erDisabled}
                      />
                    </td>
                  );
                }
                return (
                  <td key={dag.dato}>
                    <div className={styles.checkboxWrapper}>
                      <Checkbox
                        id={inputId}
                        value={type}
                        hideLabel
                        checked={!!aktiv}
                        readOnly={erDisabled}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          const updated = checked
                            ? [...aktivitetstyper, type]
                            : aktivitetstyper.filter((a) => a !== type);
                          endreDag(updated, dag, setKorrigerteDager);
                        }}
                      >
                        {`${label}, ${formatterDag(dag.dato)}`}
                      </Checkbox>
                    </div>
                  </td>
                );
              })}
              <td aria-hidden="true" className={styles.gap}></td> {/* gap */}
              {/* Uke 2: Siste 7 dager */}
              {dager.slice(7, 14).map((dag) => {
                const aktivitetstyper = dag.aktiviteter.map((a) => a.type);
                const aktiv = dag.aktiviteter.find((a) => a.type === type);
                const erDisabled = erIkkeAktiv(aktivitetstyper, type);
                const inputId = `${type}-${dag.dato}`;

                if (type === AKTIVITET_TYPE.Arbeid) {
                  return (
                    <td key={dag.dato}>
                      <TextField
                        size="small"
                        id={inputId}
                        label={`Timer jobb ${formatterDag(dag.dato)}`}
                        hideLabel
                        value={aktiv?.timer ?? ""}
                        onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
                        readOnly={erDisabled}
                      />
                    </td>
                  );
                }

                return (
                  <td key={dag.dato}>
                    <div className={styles.checkboxWrapper}>
                      <Checkbox
                        id={inputId}
                        value={type}
                        hideLabel
                        checked={!!aktiv}
                        readOnly={erDisabled}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          const updated = checked
                            ? [...aktivitetstyper, type]
                            : aktivitetstyper.filter((a) => a !== type);
                          endreDag(updated, dag, setKorrigerteDager);
                        }}
                      >
                        {`${label}, ${formatterDag(dag.dato)}`}
                      </Checkbox>
                    </div>
                  </td>
                );
              })}
              <td aria-hidden="true" className={styles.gap}>
                =
              </td>
              {/* Oppsummeringscelle */}
              <td>
                {type === AKTIVITET_TYPE.Arbeid
                  ? `${dager.reduce((sum, dag) => {
                      const aktivitet = dag.aktiviteter.find((a) => a.type === type);
                      const timer = aktivitet?.timer ? parseFloat(aktivitet.timer) || 0 : 0;
                      return sum + timer;
                    }, 0)} timer`
                  : `${
                      dager.filter((dag) => dag.aktiviteter.some((a) => a.type === type)).length
                    } dager`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
