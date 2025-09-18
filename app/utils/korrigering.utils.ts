import { uuidv7 } from "uuidv7";

import { AKTIVITET_TYPE } from "~/utils/constants";
import { konverterFraISO8601Varighet, konverterTilISO8601Varighet } from "~/utils/dato.utils";
import type { IAktivitet, IRapporteringsperiodeDag, TAktivitetType } from "~/utils/types";

export interface IKorrigertAktivitet extends Omit<IAktivitet, "timer"> {
  timer?: string | null; // string er desimaltall, null for ikke-arbeidsaktiviteter
}

export interface IKorrigertDag extends Omit<IRapporteringsperiodeDag, "aktiviteter"> {
  aktiviteter: IKorrigertAktivitet[];
}

export type SetKorrigerteDager = React.Dispatch<React.SetStateAction<IKorrigertDag[]>>;

export function konverterTimerFraISO8601Varighet(dag: IRapporteringsperiodeDag): IKorrigertDag {
  return {
    ...dag,
    aktiviteter: dag.aktiviteter.map((aktivitet) => ({
      ...aktivitet,
      timer: aktivitet.timer ? konverterFraISO8601Varighet(aktivitet.timer)?.toString() : null,
    })),
  };
}

export function konverterTimerTilISO8601Varighet(dag: IKorrigertDag): IRapporteringsperiodeDag {
  return {
    ...dag,
    aktiviteter: dag.aktiviteter.map((aktivitet) => ({
      ...aktivitet,
      timer: aktivitet.timer ? konverterTilISO8601Varighet(aktivitet.timer.toString()) : null,
    })),
  };
}

export function hentAktiviteter(dag: IRapporteringsperiodeDag): {
  arbeid: number | undefined;
  syk: boolean;
  fravaer: boolean;
  utdanning: boolean;
} {
  const timer = dag.aktiviteter.find(
    (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Arbeid,
  )?.timer;

  const arbeid = timer ? konverterFraISO8601Varighet(timer) : undefined;
  const syk = !!dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Syk);
  const fravaer = !!dag.aktiviteter.find((aktivitet) => aktivitet.type === AKTIVITET_TYPE.Fravaer);
  const utdanning = !!dag.aktiviteter.find(
    (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Utdanning,
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
  dag: IKorrigertDag,
  setKorrigerteDager: SetKorrigerteDager,
) {
  const beholderAktiviteterSomErIValue = dag.aktiviteter.filter((aktivitet) =>
    value.includes(aktivitet.type),
  );

  const leggerTilAktiviteterFraValueSomMangler: IKorrigertAktivitet[] = value.map((type) => {
    const aktivitetFinnes = beholderAktiviteterSomErIValue.find(
      (aktivitet) => aktivitet.type === type,
    );

    if (aktivitetFinnes) return aktivitetFinnes;

    return {
      id: uuidv7(),
      type,
      dato: dag.dato,
      timer: type === AKTIVITET_TYPE.Arbeid ? undefined : null,
    } as IKorrigertAktivitet;
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

function getTimerValidationMessage(timer: string): string | null {
  if (!timer || timer.trim() === "") return null;

  // Konverter komma til punktum for norske brukere
  const normalizedTimer = timer.replace(",", ".");
  const timerNum = Number(normalizedTimer);

  if (isNaN(timerNum)) return "Ugyldig tall";
  if (timerNum < 0.5) return "Minimum 0,5 timer";
  if (timerNum > 24) return "Maksimum 24 timer";
  if (Math.round(timerNum * 2) !== timerNum * 2)
    return "Kun hele og halve timer (0,5, 1, 1,5 osv.)";

  return null;
}

function erTimerGyldig(timer: string | null | undefined): boolean {
  if (!timer || timer.trim() === "") return false;
  return getTimerValidationMessage(timer) === null;
}

export function endreArbeid(
  event: React.ChangeEvent<HTMLInputElement>,
  dag: IKorrigertDag,
  setKorrigerteDager: SetKorrigerteDager,
) {
  const timer = event.target.value.replace(",", ".").trim();
  const input = event.target;

  setKorrigerteDager((prevDager) => {
    const index = prevDager.findIndex((prevDag) => prevDag.dato === dag.dato);

    // Hvis timer er tom fjerner aktiviteten arbeid fra dag
    if (!timer) {
      // Fjern error styling
      input.setCustomValidity("");

      const oppdatertDager = prevDager.toSpliced(index, 1, {
        ...dag,
        aktiviteter: dag.aktiviteter.filter(
          (aktivitet) => aktivitet.type !== AKTIVITET_TYPE.Arbeid,
        ),
      });

      return oppdatertDager;
    }

    // Valider timer-verdien og vis feilmelding hvis ugyldig
    const errorMessage = getTimerValidationMessage(timer);
    if (errorMessage) {
      input.setCustomValidity(errorMessage);
      input.reportValidity();
      return prevDager;
    }

    // Fjern error styling hvis gyldig
    input.setCustomValidity("");

    const dagHarArbeid = dag.aktiviteter.find(
      (aktivitet) => aktivitet.type === AKTIVITET_TYPE.Arbeid,
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
          timer,
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

function erArbeidsaktivitetGyldig(
  aktivitet: IKorrigertAktivitet | null,
  tomtFeltOK: boolean = false,
): boolean {
  if (!aktivitet) return !tomtFeltOK;

  // Ikke-arbeidsaktiviteter er alltid gyldige
  if (aktivitet.type !== AKTIVITET_TYPE.Arbeid) return true;

  // Sjekk om timer er tom
  if (!aktivitet.timer || aktivitet.timer.trim() === "") {
    return tomtFeltOK; // Tomt felt er OK i noen sammenhenger (f.eks. korriger)
  }

  // Bruk den delte valideringsfunksjonen
  return erTimerGyldig(aktivitet.timer);
}

export function harMinstEnGyldigAktivitet(dager: IKorrigertDag[]): boolean {
  return dager.some((dag) =>
    dag.aktiviteter.some((aktivitet) => erArbeidsaktivitetGyldig(aktivitet, false)),
  );
}

export function erAlleArbeidsaktiviteterGyldige(dager: IKorrigertDag[]): boolean {
  return dager.every((dag) =>
    dag.aktiviteter.every((aktivitet) => erArbeidsaktivitetGyldig(aktivitet, true)),
  );
}
