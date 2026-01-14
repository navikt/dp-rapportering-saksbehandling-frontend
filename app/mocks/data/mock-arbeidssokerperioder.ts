import { addDays } from "date-fns";

import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

import { lagArbeidssokerperiode } from "../mock.utils";

export function hentArbeidssokerperioder(
  perioder: IRapporteringsperiode[],
  person?: IPerson,
  kunEnArbeidssokerperiode = false,
): IArbeidssokerperiode[] {
  const sortedPerioder = [...perioder].sort((a, b) =>
    a.periode.fraOgMed > b.periode.fraOgMed ? 1 : -1,
  );
  const periode1StartDato = sortedPerioder[0]?.periode.fraOgMed;

  if (!periode1StartDato) {
    return [];
  }

  if (kunEnArbeidssokerperiode) {
    return [
      lagArbeidssokerperiode(
        {
          startDato: new Date(periode1StartDato).toISOString(),
        },
        person,
      ),
    ];
  }

  const meldekortInnsendtForSent = sortedPerioder.filter(
    ({ meldedato, sisteFristForTrekk }) =>
      meldedato && sisteFristForTrekk && new Date(meldedato) > new Date(sisteFristForTrekk),
  );

  if (meldekortInnsendtForSent.length === 0) {
    return [
      lagArbeidssokerperiode(
        {
          startDato: new Date(periode1StartDato).toISOString(),
        },
        person,
      ),
    ];
  }

  const arbeidssokerperioder = meldekortInnsendtForSent.map((meldekort, index) => {
    if (index === 0) {
      return lagArbeidssokerperiode(
        {
          startDato: addDays(new Date(periode1StartDato), 1).toISOString(),
          sluttDato: new Date(meldekort.sisteFristForTrekk as string).toISOString(),
        },
        person,
      );
    }

    const forrigeMeldekort = meldekortInnsendtForSent[index - 1];

    return lagArbeidssokerperiode(
      {
        startDato: addDays(
          new Date(forrigeMeldekort.sisteFristForTrekk as string),
          1,
        ).toISOString(),
        sluttDato: new Date(meldekort.sisteFristForTrekk as string).toISOString(),
      },
      person,
    );
  });

  return [
    ...arbeidssokerperioder,
    lagArbeidssokerperiode(
      {
        startDato: addDays(
          new Date(
            meldekortInnsendtForSent[meldekortInnsendtForSent.length - 1]
              .sisteFristForTrekk as string,
          ),
          1,
        ).toISOString(),
      },
      person,
    ),
  ];
}
