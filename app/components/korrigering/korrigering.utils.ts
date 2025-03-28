import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { konverterFraISO8601Varighet, konverterTilISO8601Varighet } from "~/utils/dato.utils";
import type { IAktivitet, IRapporteringsperiodeDag, TAktivitetType } from "~/utils/types";

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

  const arbeidAktivitet = dag.aktiviteter.find(
    (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Arbeid
  );
  if (arbeidAktivitet) {
    leggerTilAktiviteterFraValueSomMangler.push(arbeidAktivitet);
  }

  setKorrigerteDager((prevDager) => {
    const index = prevDager.findIndex((prevDag) => prevDag.dato === dag.dato);

    const oppdatertDager = prevDager.toSpliced(index, 1, {
      ...dag,
      aktiviteter: leggerTilAktiviteterFraValueSomMangler,
    });

    return oppdatertDager;
  });
}

export function endreArbeid(
  event: React.ChangeEvent<HTMLInputElement>,
  dag: IRapporteringsperiodeDag,
  setKorrigerteDager: SetKorrigerteDager
) {
  const timer = event.target.value;
  if (isNaN(Number(timer))) return;

  setKorrigerteDager((prevDager) => {
    const index = prevDager.findIndex((prevDag) => prevDag.dato === dag.dato);

    // Hvis timer er tom fjerner aktiviteten arbeid fra dag
    if (!timer) {
      const oppdatertDager = prevDager.toSpliced(index, 1, {
        ...dag,
        aktiviteter: dag.aktiviteter.filter(
          (aktivitet) => aktivitet.type !== AKTIVITET_TYPE.Arbeid
        ),
      });

      return oppdatertDager;
    }

    const dagHarArbeid = dag.aktiviteter.find(
      (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Arbeid
    );

    const oppdatertDager = prevDager.toSpliced(index, 1, {
      ...dag,
      aktiviteter: [
        ...dag.aktiviteter.filter((aktivitet) => aktivitet.type !== AKTIVITET_TYPE.Arbeid),
        {
          // Vi gjenbruker aktivitetens ID hvis den allerede eksisterer
          id: dagHarArbeid?.id ?? uuidv7(),
          type: AKTIVITET_TYPE.Arbeid,
          dato: dag.dato,
          timer: konverterTilISO8601Varighet(timer),
        },
      ],
    });

    return oppdatertDager;
  });
}

export function erIkkeAktiv(aktiviteter: TAktivitetType[], aktivitet: TAktivitetType): boolean {
  if (
    aktiviteter.includes(AKTIVITET_TYPE.Arbeid) &&
    ([AKTIVITET_TYPE.Syk, AKTIVITET_TYPE.Fravaer] as TAktivitetType[]).includes(aktivitet)
  ) {
    return true;
  }

  if (aktiviteter.includes(AKTIVITET_TYPE.Syk) && aktivitet === AKTIVITET_TYPE.Arbeid) {
    return true;
  }

  if (aktiviteter.includes(AKTIVITET_TYPE.Fravaer) && aktivitet === AKTIVITET_TYPE.Arbeid) {
    return true;
  }

  return false;
}
