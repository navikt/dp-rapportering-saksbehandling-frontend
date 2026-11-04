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
  const arbeidssokerperioderSortert = [...arbeidssokerperioder].sort(
    (a, b) => new Date(b.startDato).getTime() - new Date(a.startDato).getTime(),
  );

  const hendelser: {
    event: IHendelse;
    periodeId?: string;
    erAvregistrering?: boolean;
  }[] = [
    ...arbeidssokerperioderSortert.flatMap((periode) =>
      transformArbeidssokerperioderToHistoryEvents([periode]).map((event, index) => ({
        event,
        periodeId: periode.periodeId,
        erAvregistrering: index === 1,
      })),
    ),
    ...transformPerioderToHistoryEvents(perioder).map((event) => ({ event })),
  ].sort((a, b) => b.event.dato.getTime() - a.event.dato.getTime());

  for (let index = arbeidssokerperioderSortert.length - 1; index > 0; index--) {
    const eldrePeriode = arbeidssokerperioderSortert[index];
    const nyerePeriode = arbeidssokerperioderSortert[index - 1];
    if (!nyerePeriode || !eldrePeriode?.sluttDato) continue;

    const eldreSlutt = new Date(eldrePeriode.sluttDato);
    const nyereStart = new Date(nyerePeriode.startDato);
    if (
      eldreSlutt.getTime() < nyereStart.getTime() ||
      eldreSlutt.toISOString().slice(0, 10) !== nyereStart.toISOString().slice(0, 10)
    ) {
      continue;
    }

    const avregistreringIndex = hendelser.findIndex(
      (hendelse) =>
        hendelse.periodeId === eldrePeriode.periodeId && hendelse.erAvregistrering === true,
    );
    const registreringIndex = hendelser.findIndex(
      (hendelse) =>
        hendelse.periodeId === nyerePeriode.periodeId && hendelse.erAvregistrering === false,
    );

    if (avregistreringIndex < 0 || avregistreringIndex >= registreringIndex) continue;

    const [avregistrering] = hendelser.splice(avregistreringIndex, 1);
    // Fjerning før registreringen forskyver den ett hakk, så originalindeksen er plassen etter den.
    hendelser.splice(registreringIndex, 0, avregistrering!);
  }

  return hendelser.map(({ event }) => event);
};
