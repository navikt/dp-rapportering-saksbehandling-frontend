import {
  DatoFormat,
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
        sisteFristForTrekk: periode.sisteFristForTrekk
          ? formatterDatoUTC({
              dato: periode.sisteFristForTrekk,
              format: DatoFormat.DagMndAar,
            })
          : null,
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
      innsendtDato: formatterDatoUTC({ dato: dato, format: DatoFormat.DagMndAar }),
      time: formatterKlokkeslettUTC(dato),
      event: erAvregistrering ? "Avregistrert som arbeidssøker" : "Registrert som arbeidssøker",
      kategori: "System",
    };
  });
};

export const buildHistoryEvents = (
  arbeidssokerperioder: IArbeidssokerperiode[],
  perioder: IRapporteringsperiode[],
): IHendelse[] => {
  const chronologicalEvents = [
    ...transformArbeidssokerperioderToHistoryEvents(arbeidssokerperioder),
    ...transformPerioderToHistoryEvents(perioder),
  ].sort((a, b) => b.dato.getTime() - a.dato.getTime());

  const workerEvents = [...arbeidssokerperioder]
    .sort((a, b) => new Date(b.startDato).getTime() - new Date(a.startDato).getTime())
    .flatMap((periode) => {
      const events = transformArbeidssokerperioderToHistoryEvents([periode]);
      return periode.sluttDato ? events.reverse() : events;
    });

  let workerEventIndex = 0;
  return chronologicalEvents.map((event) =>
    event.kategori === "System" ? workerEvents[workerEventIndex++]! : event,
  );
};
