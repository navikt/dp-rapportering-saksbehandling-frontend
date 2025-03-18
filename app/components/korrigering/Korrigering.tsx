import { Checkbox, CheckboxGroup, TextField } from "@navikt/ds-react";
import classNames from "classnames";
import { Fragment } from "react";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { hentUkedag, hentUkerFraPeriode, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

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
  originalPeriode: IRapporteringsperiode;
}

function beregnTotalt(periode: IRapporteringsperiode, type: string, erDager: boolean) {
  return periode.dager.reduce((sum, dag) => {
    const aktivitet = dag.aktiviteter.find((aktivitet) => aktivitet.type === type);
    if (!aktivitet) return sum;
    return erDager ? sum + 1 : sum + (konverterFraISO8601Varighet(aktivitet.timer) || 0);
  }, 0);
}

export function Korrigering({ korrigerteDager, setKorrigerteDager, originalPeriode }: IProps) {
  const [startUke, sluttUke] = hentUkerFraPeriode(originalPeriode.periode);

  const totalArbeid = beregnTotalt(originalPeriode, AKTIVITET_TYPE.Arbeid, false);
  const totalSyk = beregnTotalt(originalPeriode, AKTIVITET_TYPE.Syk, true);
  const totalFravaer = beregnTotalt(originalPeriode, AKTIVITET_TYPE.Fravaer, true);
  const totalUtdanning = beregnTotalt(originalPeriode, AKTIVITET_TYPE.Utdanning, true);

  return (
    <div className={styles.grid}>
      <h4 className={classNames(styles.row1, styles.col2)}>Uke {startUke}</h4>
      <h4 className={classNames(styles.row1, styles.col9)}>Uke {sluttUke}</h4>
      <div
        className={classNames(styles.aktivitet, styles.col1, styles.row3, styles.arbeid, "arbeid")}
      >
        Jobb
      </div>
      <div className={classNames(styles.aktivitet, styles.col1, styles.row4, styles.syk, "syk")}>
        Syk
      </div>
      <div
        className={classNames(
          styles.aktivitet,
          styles.col1,
          styles.row5,
          styles.fravaer,
          "fravaer"
        )}
      >
        Ferie, fravær og utenlandsopphold
      </div>
      <div
        className={classNames(
          styles.aktivitet,
          styles.col1,
          styles.row6,
          styles.utdanning,
          "utdanning"
        )}
      >
        Tiltak, kurs eller utdanning
      </div>

      {korrigerteDager.map((dag, index) => {
        const { arbeid, syk, fravaer, utdanning } = hentAktiviteter(dag);
        const value = [
          syk ? AKTIVITET_TYPE.Syk : "",
          fravaer ? AKTIVITET_TYPE.Fravaer : "",
          utdanning ? AKTIVITET_TYPE.Utdanning : "",
        ].filter((v) => v);

        const aktiviteter = dag.aktiviteter.map((aktivitet) => aktivitet.type);

        return (
          <Fragment key={dag.dato}>
            <div className={classNames(styles[`col-${index + 2}`], styles.row2)}>
              {hentUkedag(dag.dato)}
            </div>
            <TextField
              data-dato={dag.dato}
              label="arbeid"
              hideLabel
              value={arbeid ?? ""}
              onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
              readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid)}
              className={classNames(styles[`col-${index + 2}`], styles.row3, styles.arbeidInput)}
            ></TextField>
            <CheckboxGroup
              legend="Aktiviteter"
              hideLegend
              onChange={(value) => endreDag(value, dag, setKorrigerteDager)}
              value={value}
              className={classNames(
                styles[`col-${index + 2}`],
                styles.row4,
                styles.gridCheckboxGroup,
                "grid-checkbox-group"
              )}
            >
              <Checkbox
                value={AKTIVITET_TYPE.Syk}
                hideLabel
                readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Syk)}
                className={classNames(styles.checkbox, styles.row1)}
              >
                Syk
              </Checkbox>
              <Checkbox
                value={AKTIVITET_TYPE.Fravaer}
                hideLabel
                readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Fravaer)}
                className={classNames(styles.checkbox, styles.row2)}
              >
                Fravær
              </Checkbox>
              <Checkbox
                value={AKTIVITET_TYPE.Utdanning}
                hideLabel
                readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Utdanning)}
                className={classNames(styles.checkbox, styles.row3)}
              >
                Utdanning
              </Checkbox>
            </CheckboxGroup>
          </Fragment>
        );
      })}

      <div className={classNames(styles.col16, styles.row3, styles.oppsummering)}>
        <p>{totalArbeid} timer</p>
      </div>
      <div className={classNames(styles.col16, styles.row4, styles.oppsummering)}>
        <p>{totalSyk} dager</p>
      </div>
      <div className={classNames(styles.col16, styles.row5, styles.oppsummering)}>
        <p>{totalFravaer} dager</p>
      </div>
      <div className={classNames(styles.col16, styles.row6, styles.oppsummering)}>
        <p>{totalUtdanning} dager</p>
      </div>
    </div>
  );
}
