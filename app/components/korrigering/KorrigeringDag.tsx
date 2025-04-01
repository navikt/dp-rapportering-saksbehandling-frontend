import { Checkbox, TextField } from "@navikt/ds-react";
import classNames from "classnames";

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

export function KorrigeringDag({ dag, setKorrigerteDager }: IProps) {
  const { arbeid, syk, fravaer, utdanning } = hentAktiviteter(dag);
  const aktiviteter = dag.aktiviteter.map((aktivitet) => aktivitet.type);

  return (
    <tr key={dag.dato}>
      <td className={classNames(styles.korrigeringDato)}>
        <h4>{hentUkedag(dag.dato)}</h4>
        <p>{formatterDag(dag.dato)}</p>
      </td>
      <td>
        <TextField
          data-dato={dag.dato}
          label="arbeid"
          hideLabel
          value={arbeid ?? ""}
          onChange={(event) => endreArbeid(event, dag, setKorrigerteDager)}
          readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Arbeid)}
          className={classNames("arbeidInput")}
        ></TextField>
      </td>
      <td>
        <Checkbox
          value={AKTIVITET_TYPE.Syk}
          hideLabel
          readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Syk)}
          className={classNames(styles.checkbox)}
          checked={syk}
          onChange={(event) =>
            endreDag(event.target.checked ? [AKTIVITET_TYPE.Syk] : [], dag, setKorrigerteDager)
          }
        >
          Syk
        </Checkbox>
      </td>
      <td>
        <Checkbox
          value={AKTIVITET_TYPE.Fravaer}
          hideLabel
          readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Fravaer)}
          className={classNames(styles.checkbox)}
          checked={fravaer}
          onChange={(event) =>
            endreDag(event.target.checked ? [AKTIVITET_TYPE.Fravaer] : [], dag, setKorrigerteDager)
          }
        >
          Fravær
        </Checkbox>
      </td>
      <td>
        <Checkbox
          value={AKTIVITET_TYPE.Utdanning}
          hideLabel
          readOnly={erIkkeAktiv(aktiviteter, AKTIVITET_TYPE.Utdanning)}
          className={classNames(styles.checkbox)}
          checked={utdanning}
          onChange={(event) =>
            endreDag(
              event.target.checked ? [AKTIVITET_TYPE.Utdanning] : [],
              dag,
              setKorrigerteDager
            )
          }
        >
          Utdanning
        </Checkbox>
      </td>
    </tr>
  );
}
