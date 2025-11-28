import { BodyShort, Checkbox, Label } from "@navikt/ds-react";
import classNames from "classnames";
import { uuidv7 } from "uuidv7";

import { AKTIVITET_LABELS_LANG, AKTIVITET_TYPE } from "~/utils/constants";
import { formatterDag, hentUkedag, hentUkerFraPeriode } from "~/utils/dato.utils";
import type { IPeriode, TAktivitetType } from "~/utils/types";

import {
  endreDag,
  erIkkeAktiv,
  type IKorrigertDag,
  type SetKorrigerteDager,
} from "../../../utils/korrigering.utils";
import {
  beregnTotaltAntallDager,
  formaterTotalBeløp,
  lagAktivitetKlassenavn,
  pluraliserEnhet,
} from "./FyllUtTabell.helpers";
import styles from "./fyllUtTabell.module.css";
import { NumberInput } from "./NumberInput";

interface IProps {
  dager: IKorrigertDag[];
  setKorrigerteDager: SetKorrigerteDager;
  periode: IPeriode;
}

const aktiviteter = [
  { type: AKTIVITET_TYPE.Arbeid, label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Arbeid] },
  { type: AKTIVITET_TYPE.Syk, label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Syk] },
  { type: AKTIVITET_TYPE.Fravaer, label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Fravaer] },
  { type: AKTIVITET_TYPE.Utdanning, label: AKTIVITET_LABELS_LANG[AKTIVITET_TYPE.Utdanning] },
];

function DagHeader({ dag, styles }: { dag: IKorrigertDag; styles: CSSModuleClasses }) {
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
  styles,
}: {
  dag: IKorrigertDag;
  type: TAktivitetType;
  label: string;
  setKorrigerteDager: SetKorrigerteDager;
  styles: CSSModuleClasses;
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

            if (value === "") {
              // Fjern arbeid-aktiviteten hvis feltet er helt tomt
              updated = dag.aktiviteter.filter((a) => a.type !== type);
            } else if (aktivitetstyper.includes(type)) {
              // Oppdater eksisterende aktivitet (behold verdien uansett, validering skjer på blur/submit)
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

  // Variant B: Both weeks side by side (horizontal layout)
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        <Label size="small">Før opp aktiviteter</Label>
      </legend>
      <table className={styles.fyllUtTabell}>
        <caption className="sr-only">Før opp aktiviteter</caption>
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
              <DagHeader key={`header-${dag.dato}`} dag={dag} styles={styles} />
            ))}
            <th className={styles.gap} aria-hidden="true"></th>
            {uke2Dager.map((dag) => (
              <DagHeader key={`header-${dag.dato}`} dag={dag} styles={styles} />
            ))}
            <th scope="col" colSpan={2} className="sr-only">
              Sum
            </th>
          </tr>
        </thead>
        <tbody>
          {aktiviteter.map(({ type, label }) => {
            const hoverClass = styles[lagAktivitetKlassenavn(type, "trHover")];
            const aktivitetClass = styles[lagAktivitetKlassenavn(type, "aktivitet")];
            const antallDager = beregnTotaltAntallDager(dager, type);

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
                    styles={styles}
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
                    styles={styles}
                  />
                ))}
                <td aria-hidden="true">=</td>
                <td className={styles.oppsummeringTall}>{formaterTotalBeløp(dager, type)}</td>
                <td className={styles.oppsummeringEnhet}>{pluraliserEnhet(antallDager, type)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </fieldset>
  );
}
