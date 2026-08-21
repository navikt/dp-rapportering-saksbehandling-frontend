import { BodyShort, Checkbox, Label } from "@navikt/ds-react";
import classNames from "classnames";
import { uuidv7 } from "uuidv7";

import { useGlobalSanityData } from "~/hooks/useGlobalSanityData";
import { sanityTekst } from "~/sanity/utils";
import type { ABTestVariant } from "~/utils/ab-test.utils";
import { AKTIVITET_TYPE } from "~/utils/constants";
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
} from "./AktivitetsTabell.helpers";
import stylesOriginal from "./aktivitetsTabell.module.css";
import stylesVariantB from "./aktivitetsTabellVariantB.module.css";
import { NumberInput } from "./NumberInput";

interface IProps {
  dager: IKorrigertDag[];
  setKorrigerteDager: SetKorrigerteDager;
  periode: IPeriode;
  variant?: ABTestVariant;
  isKorrigering?: boolean;
}

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
          label="Timer"
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
          {label}
        </Checkbox>
      </div>
    </td>
  );
}

export function AktivitetsTabell({ dager, setKorrigerteDager, periode, variant = null }: IProps) {
  const sanityData = useGlobalSanityData();
  const [uke1, uke2] = hentUkerFraPeriode(periode);
  const uke1Dager = dager.slice(0, 7);
  const uke2Dager = dager.slice(7, 14);

  // Velg styles basert på variant
  const styles = variant === "B" ? stylesVariantB : stylesOriginal;

  // Hent aktivitetstabell-tekster fra Sanity
  const aktivitetstabellData = sanityData?.aktivitetstabell;
  const fieldsetLegend = sanityTekst(
    aktivitetstabellData?.fieldsetLegend,
    "aktivitetstabell.fieldsetLegend",
  );

  // Funksjon for å pluralisere enhet basert på Sanity-data
  const pluraliser = (antall: number, type: TAktivitetType): string => {
    if (type === AKTIVITET_TYPE.Arbeid) {
      // For arbeid bruker vi alltid "timer" (plural)
      return sanityTekst(
        aktivitetstabellData?.enheter?.hours?.plural,
        "aktivitetstabell.enheter.hours.plural",
      );
    }
    // For andre aktiviteter bruker vi dag/dager basert på antall
    if (antall === 1) {
      return sanityTekst(
        aktivitetstabellData?.enheter?.days?.singular,
        "aktivitetstabell.enheter.days.singular",
      );
    }
    return sanityTekst(
      aktivitetstabellData?.enheter?.days?.plural,
      "aktivitetstabell.enheter.days.plural",
    );
  };

  const aktiviteter = [
    {
      type: AKTIVITET_TYPE.Arbeid,
      label: sanityTekst(sanityData?.aktiviteter?.jobb?.lang, "aktiviteter.jobb.lang"),
    },
    {
      type: AKTIVITET_TYPE.Syk,
      label: sanityTekst(sanityData?.aktiviteter?.syk?.lang, "aktiviteter.syk.lang"),
    },
    {
      type: AKTIVITET_TYPE.Fravaer,
      label: sanityTekst(sanityData?.aktiviteter?.ferie?.lang, "aktiviteter.ferie.lang"),
    },
    {
      type: AKTIVITET_TYPE.Utdanning,
      label: sanityTekst(sanityData?.aktiviteter?.utdanning?.lang, "aktiviteter.utdanning.lang"),
    },
  ];

  // Horisontal layout: begge ukene side ved side
  return (
    <fieldset className={styles.fieldset}>
      <legend className="sr-only">
        <Label size="small">{fieldsetLegend}</Label>
      </legend>
      <table className={styles.fyllUtTabell}>
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
                <td className={styles.oppsummeringEnhet}>{pluraliser(antallDager, type)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </fieldset>
  );
}
