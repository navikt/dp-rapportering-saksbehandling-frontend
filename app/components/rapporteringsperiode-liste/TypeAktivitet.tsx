import type { IRapporteringsperiode } from "~/utils/types";

import { aktivitetMapping, sorterAktiviteter, unikeAktiviteter } from "./utils";

interface IProps {
  periode: IRapporteringsperiode;
}

export function TypeAktivitet({ periode }: IProps) {
  const aktiviteter = unikeAktiviteter(periode);
  const sorterteAktiviteter = sorterAktiviteter(aktiviteter);

  return (
    <ul className="aktiviteter">
      {sorterteAktiviteter.map((type) => (
        <li key={type} className={`aktivitet ${aktivitetMapping[type].color}`}>
          {aktivitetMapping[type].label}
        </li>
      ))}
    </ul>
  );
}
