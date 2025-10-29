import {
  DatoFormat,
  formatterDato,
  formatterDatoUTC,
  formatterKlokkeslettUTC,
  ukenummer,
} from "~/utils/dato.utils";
import { erMeldekortSendtForSent } from "~/utils/rapporteringsperiode.utils";
import type { IArbeidssokerperiode, IRapporteringsperiode } from "~/utils/types";

import type { IHendelse } from "./HistorikkModal";

export const transformPerioderToHistoryEvents = (
  perioder: IRapporteringsperiode[],
): IHendelse[] => {
  return perioder
    .filter((periode) => periode.innsendtTidspunkt) // Kun innsendte meldekort
    .map((periode) => {
      const innsendtDato = new Date(periode.innsendtTidspunkt!);
      const ukenummerTekst = ukenummer(periode).replace(" - ", " og ");
      const erSendtForSent = erMeldekortSendtForSent(periode);
      return {
        dato: innsendtDato,
        innsendtDato: formatterDatoUTC({
          dato: periode.innsendtTidspunkt!,
          format: DatoFormat.DagMndAar,
        }),
        time: formatterKlokkeslettUTC(periode.innsendtTidspunkt!),
        event: `Meldekort uke ${ukenummerTekst}, ${innsendtDato.getUTCFullYear()}`,
        hendelseType: periode.originalMeldekortId ? "Korrigert" : "Innsendt",
        type: "Elektronisk",
        kategori: "Meldekort",
        erSendtForSent: erSendtForSent,
      };
    });
};

export const transformArbeidssokerperioderToHistoryEvents = (
  arbeidssokerperioder: IArbeidssokerperiode[],
): IHendelse[] => {
  const expanded = arbeidssokerperioder.reduce((hendelser, periode) => {
    if (periode.sluttDato) {
      // Legg til avregistrering først (sluttDato)
      const avregistrering: IArbeidssokerperiode = {
        ...periode,
        startDato: periode.sluttDato,
      };
      // Legg til registrering (startDato)
      const registrering: IArbeidssokerperiode = {
        ...periode,
        sluttDato: null,
      };
      return [...hendelser, registrering, avregistrering];
    }
    return [...hendelser, periode];
  }, [] as IArbeidssokerperiode[]);

  return expanded.map((periode) => {
    const erAvregistrering = periode.startDato === periode.sluttDato;
    const dato = erAvregistrering ? periode.sluttDato! : periode.startDato;

    return {
      dato: new Date(dato),
      innsendtDato: formatterDato({ dato: dato, format: DatoFormat.DagMndAar }),
      time: "--:--",
      event: erAvregistrering ? "Avregistrert som arbeidssøker" : "Registrert som arbeidssøker",
      kategori: "System",
    };
  });
};
