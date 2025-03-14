import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { konverterFraISO8601Varighet } from "~/utils/dato.utils";
import type { IAktivitet, IRapporteringsperiodeDag } from "~/utils/types";

export type SetKorrigerteDager = React.Dispatch<React.SetStateAction<IRapporteringsperiodeDag[]>>;

export function hentAktiviteter(dag: IRapporteringsperiodeDag): {
  arbeid: number | undefined;
  syk: boolean;
  fravaer: boolean;
  utdanning: boolean;
} {
  const timer = dag.aktiviteter.find(
    (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Arbeid
  )?.timer;

  const arbeid = timer ? konverterFraISO8601Varighet(timer) : undefined;
  const syk = !!dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Syk);
  const fravaer = !!dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Fravaer);
  const utdanning = !!dag.aktiviteter.find(
    (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Utdanning
  );

  return {
    arbeid,
    syk,
    fravaer,
    utdanning,
  };
}

export function endreDag(
  value: string[],
  dag: IRapporteringsperiodeDag,
  setKorrigerteDager: SetKorrigerteDager
) {
  const beholderAktiviteterSomErIValue = dag.aktiviteter.filter((aktivitet) =>
    value.includes(aktivitet.type)
  );

  const leggerTilAktiviteterFraValueSomMangler: IAktivitet[] = value.map((type) => {
    const aktivitetFinnes = beholderAktiviteterSomErIValue.find(
      (aktivitet) => aktivitet.type === type
    );

    if (aktivitetFinnes) return aktivitetFinnes;

    return {
      id: uuidv7(),
      type,
      dato: dag.dato,
    } as IAktivitet;
  });

  setKorrigerteDager((prevDager) => {
    const index = prevDager.findIndex((prevDag) => prevDag.dato === dag.dato);

    const oppdatertDager = prevDager.toSpliced(index, 1, {
      ...dag,
      aktiviteter: leggerTilAktiviteterFraValueSomMangler,
    });

    return oppdatertDager;
  });
}
