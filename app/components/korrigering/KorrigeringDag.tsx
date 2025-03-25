import { Checkbox, CheckboxGroup, TextField } from "@navikt/ds-react";
import classNames from "classnames";
import { Fragment } from "react";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, hentUkedag } from "~/utils/dato.utils";
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
  dag: IRapporteringsperiodeDag;
  index: number;
  setKorrigerteDager: SetKorrigerteDager;
}

export function KorrigeringDag({ dag, index, setKorrigerteDager }: IProps) {
  const { arbeid, syk, fravaer, utdanning } = hentAktiviteter(dag);
  const value = [
    syk ? AKTIVITET_TYPE.Syk : "",
    fravaer ? AKTIVITET_TYPE.Fravaer : "",
    utdanning ? AKTIVITET_TYPE.Utdanning : "",
  ].filter((v) => v);

  const aktiviteter = dag.aktiviteter.map((aktivitet) => aktivitet.type);

  return (
    <Fragment key={dag.dato}>
      <div className={classNames(styles[`col-${index + 2}`], styles.row2, styles.korrigeringDato)}>
        <h4>{hentUkedag(dag.dato)}</h4>
        <p>{formatterDag(dag.dato)}</p>
      </div>
      <TextField
        data-dato={dag.dato}
        label="arbeid"
        hideLabel
        value={arbeid ?? ""}
        onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
        readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid)}
        className={classNames(styles[`col-${index + 2}`], styles.row3, "arbeidInput")}
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
}
