import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

import { lagArbeidssokerperiode } from "../mock.utils";

export function hentArbeidssokerperioder(
  perioder: IRapporteringsperiode[],
  person?: IPerson,
): IArbeidssokerperiode[] {
  const sortedPerioder = [...perioder].sort((a, b) =>
    a.periode.fraOgMed > b.periode.fraOgMed ? 1 : -1,
  );
  const startDato = sortedPerioder[0]?.periode.fraOgMed;

  if (!startDato) {
    return [];
  }

  // Lag en dato 1 måned etter startdato for avregistrering (sikrer at den er i fortiden)
  const avregistreringsDato = new Date(startDato);
  avregistreringsDato.setMonth(avregistreringsDato.getMonth() + 1);
  avregistreringsDato.setDate(avregistreringsDato.getDate() + 5); // Legg til 5 dager også

  return [
    // En periode med både start og slutt vil gi både "Registrert" og "Avregistrert" hendelser
    lagArbeidssokerperiode(
      {
        startDato: new Date(startDato).toISOString(),
        sluttDato: avregistreringsDato.toISOString(),
      },
      person,
    ),
  ];
}
