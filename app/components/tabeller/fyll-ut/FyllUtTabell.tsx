import { BodyShort, Checkbox } from "@navikt/ds-react";
import classNames from "classnames";
import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, hentUkedag, hentUkerFraPeriode } from "~/utils/dato.utils";
import type { IPeriode, TAktivitetType } from "~/utils/types";

import {
  endreDag,
  erIkkeAktiv,
  type IKorrigertDag,
  type SetKorrigerteDager,
} from "../../../utils/korrigering.utils";
import styles from "./fyllUtTabell.module.css";
import { NumberInput } from "./NumberInput";

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

function DagHeader({ dag }: { dag: IKorrigertDag }) {
  return (
    <th scope="col">
      <BodyShort size="small" className={styles.ukedag}>
        <span>{hentUkedag(dag.dato)}</span>
        <span>{formatterDag(dag.dato)}</span>
      </BodyShort>
    </th>
  );
}

function DagCell({
  dag,
  type,
  label,
  setKorrigerteDager,
}: {
  dag: IKorrigertDag;
  type: TAktivitetType;
  label: string;
  setKorrigerteDager: SetKorrigerteDager;
}) {
  const aktivitetstyper = dag.aktiviteter.map((a) => a.type);
  const aktiv = dag.aktiviteter.find((a) => a.type === type);
  const erDisabled = erIkkeAktiv(aktivitetstyper, type);
  const inputId = `${type}-${dag.dato}`;

  if (type === AKTIVITET_TYPE.Arbeid) {
    return (
      <td>
        <NumberInput
          label={`Timer jobb ${formatterDag(dag.dato)}`}
          value={aktiv?.timer ?? ""}
          onChange={(value) => {
            let updated;

            if (value === "" || value === "0") {
              // Fjern arbeid-aktiviteten hvis feltet tømmes
              updated = dag.aktiviteter.filter((a) => a.type !== type);
            } else if (aktivitetstyper.includes(type)) {
              // Oppdater eksisterende aktivitet
              updated = dag.aktiviteter.map((a) => (a.type === type ? { ...a, timer: value } : a));
            } else {
              // Legg til ny aktivitet
              updated = [...dag.aktiviteter, { id: uuidv7(), type, timer: value, dato: dag.dato }];
            }
            setKorrigerteDager((prev) =>
              prev.map((d) => (d.dato === dag.dato ? { ...d, aktiviteter: updated } : d)),
            );
          }}
          readOnly={erDisabled}
        />
      </td>
    );
  }

  return (
    <td>
      <div className={styles.checkboxWrapper}>
        <Checkbox
          size="small"
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
}

export function FyllUtTabell({ dager, setKorrigerteDager, periode }: IProps) {
  const [uke1, uke2] = hentUkerFraPeriode(periode);
  const uke1Dager = dager.slice(0, 7);
  const uke2Dager = dager.slice(7, 14);

  return (
    <table className={styles.fyllUtTabell}>
      <caption className="sr-only">Registrer aktiviteter</caption>
      <thead>
        <tr>
          <th scope="col" className="sr-only">
            Aktivitet
          </th>
          <th className={styles.gap} aria-hidden="true"></th>
          <th colSpan={7} className={styles.label} scope="colgroup">
            <BodyShort weight="semibold">Uke {uke1}</BodyShort>
          </th>
          <th className={styles.gap} aria-hidden="true"></th>
          <th colSpan={7} className={styles.label} scope="colgroup">
            <BodyShort weight="semibold">Uke {uke2}</BodyShort>
          </th>
          <th colSpan={2} scope="col" className="sr-only">
            Oppsummering
          </th>
        </tr>
        <tr>
          <th scope="col" className="sr-only">
            Aktivitet
          </th>
          <th className={styles.gap} aria-hidden="true"></th>
          {uke1Dager.map((dag) => (
            <DagHeader key={`header-${dag.dato}`} dag={dag} />
          ))}
          <th className={styles.gap} aria-hidden="true"></th>
          {uke2Dager.map((dag) => (
            <DagHeader key={`header-${dag.dato}`} dag={dag} />
          ))}
          <th scope="col" colSpan={2} className="sr-only">
            Sum
          </th>
        </tr>
      </thead>
      <tbody>
        {aktiviteter.map(({ type, label }) => {
          const hoverClass = styles[`trHover${type.charAt(0).toUpperCase() + type.slice(1)}`];
          const aktivitetClass = styles[`aktivitet${type.charAt(0).toUpperCase() + type.slice(1)}`];
          return (
            <tr key={type} className={hoverClass}>
              <th scope="row">
                <div className={classNames(styles.aktivitet, aktivitetClass)}>{label}</div>
              </th>
              <td className={styles.gap} aria-hidden="true"></td>
              {uke1Dager.map((dag) => (
                <DagCell
                  key={dag.dato}
                  dag={dag}
                  type={type}
                  label={label}
                  setKorrigerteDager={setKorrigerteDager}
                />
              ))}
              <td className={styles.gap} aria-hidden="true"></td>
              {uke2Dager.map((dag) => (
                <DagCell
                  key={dag.dato}
                  dag={dag}
                  type={type}
                  label={label}
                  setKorrigerteDager={setKorrigerteDager}
                />
              ))}
              <td aria-hidden="true">=</td>
              <td className={styles.oppsummeringTall}>
                {type === AKTIVITET_TYPE.Arbeid
                  ? dager
                      .reduce((sum, dag) => {
                        const aktivitet = dag.aktiviteter.find((a) => a.type === type);
                        const timer = aktivitet?.timer ? parseFloat(aktivitet.timer) || 0 : 0;
                        return sum + timer;
                      }, 0)
                      .toString()
                      .replace(".", ",")
                  : dager.filter((dag) => dag.aktiviteter.some((a) => a.type === type)).length}
              </td>
              <td className={styles.oppsummeringEnhet}>
                {type === AKTIVITET_TYPE.Arbeid
                  ? "timer"
                  : (() => {
                      const antallDager = dager.filter((dag) =>
                        dag.aktiviteter.some((a) => a.type === type),
                      ).length;
                      return antallDager === 1 ? "dag" : "dager";
                    })()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
