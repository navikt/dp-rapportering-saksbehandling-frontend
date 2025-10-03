import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

import { lagArbeidssokerperiode } from "../mock.utils";

export function hentArbeidssokerperioder(
  perioder: IRapporteringsperiode[],
  person?: IPerson,
): IArbeidssokerperiode[] {
  const startDato = perioder.sort((a, b) => (a.periode.fraOgMed > b.periode.fraOgMed ? 1 : -1))[0]
    ?.periode.fraOgMed;

  return [
    lagArbeidssokerperiode(
      { startDato: new Date(startDato).toISOString(), sluttDato: null },
      person,
    ),
  ];
}
