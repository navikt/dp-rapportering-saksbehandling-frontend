import { Checkbox, CheckboxGroup, TextField } from "@navikt/ds-react";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { hentUkedag, konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IRapporteringsperiode, IRapporteringsperiodeDag } from "~/utils/types";

import styles from "./Korrigering.module.css";

interface IProps {
  setKorrigertPeriode: React.Dispatch<React.SetStateAction<IRapporteringsperiode>>;
  korrigertPeriode: IRapporteringsperiode;
}

export function Korrigering({ setKorrigertPeriode, korrigertPeriode }: IProps) {
  const handleKorrigering = () => {
    setKorrigertPeriode((prevPeriode) => ({
      ...prevPeriode,
    }));
  };

  function hentAktiviteter(dag: IRapporteringsperiodeDag): {
    arbeid: number | undefined;
    syk: boolean;
    fravaer: boolean;
    utdanning: boolean;
  } {
    const timer = dag.aktiviteter.find(
      (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Arbeid
    )?.timer;

    return {
      arbeid: timer ? konverterFraISO8601Varighet(timer) : undefined,
      syk: dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Syk)
        ? true
        : false,
      fravaer: dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Fravaer)
        ? true
        : false,
      utdanning: dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Utdanning)
        ? true
        : false,
    };
  }

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.aktiviteter}>
          <div></div>
          <p className="arbeid">Jobb</p>
          <p className="syk">Syk</p>
          <p className="fravaer">Ferie, fravær og utenlandsopphold</p>
          <p className="utdanning">Tiltak, kurs eller utdanning</p>
        </div>
        {korrigertPeriode.dager.map((dag) => {
          const { arbeid, syk, fravaer, utdanning } = hentAktiviteter(dag);

          return (
            <div key={dag.dato}>
              <div>{hentUkedag(dag.dato)}</div>
              <TextField label="arbeid" hideLabel value={arbeid}></TextField>
              <CheckboxGroup legend="Aktiviteter" hideLegend>
                <Checkbox value="syk" hideLabel checked={syk}>
                  Syk
                </Checkbox>
                <Checkbox value="fravær" hideLabel checked={fravaer}>
                  Fravaer
                </Checkbox>
                <Checkbox value="utdanning" hideLabel checked={utdanning}>
                  Utdanning
                </Checkbox>
              </CheckboxGroup>
            </div>
          );
        })}
      </div>

      <button onClick={handleKorrigering}>Korriger Periode</button>
    </>
  );
}
