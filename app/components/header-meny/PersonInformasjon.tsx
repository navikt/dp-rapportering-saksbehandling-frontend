import { BodyShort, Button } from "@navikt/ds-react";
import { useState } from "react";

import { DatoFormat, formatterDato, ukenummer } from "~/utils/dato.utils";
import type { IPerson, IRapporteringsperiode } from "~/utils/types";

import { HistorikkModal, type IHendelse } from "../../modals/historikk/HistorikkModal";
import styles from "./PersonInformasjon.module.css";

interface IProps {
  person: IPerson;
  perioder?: IRapporteringsperiode[];
}

const transformPerioderToHistoryEvents = (perioder: IRapporteringsperiode[]): IHendelse[] => {
  return perioder
    .filter((periode) => periode.innsendtTidspunkt) // Kun innsendte meldekort
    .sort(
      (a, b) => new Date(b.innsendtTidspunkt!).getTime() - new Date(a.innsendtTidspunkt!).getTime(),
    ) // Nyeste først
    .map((periode) => {
      const innsendtDato = new Date(periode.innsendtTidspunkt!);
      const ukenummerTekst = ukenummer(periode);

      return {
        date: formatterDato({ dato: periode.innsendtTidspunkt!, format: DatoFormat.DagMndAar }),
        time: innsendtDato.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
        event: `Meldekort uke ${ukenummerTekst} innsendt`,
        type: "Elektronisk",
        kategori: "Meldekort",
      };
    });
};

export default function PersonInformasjon({ person, perioder = [] }: IProps) {
  const fulltNavn = [person.fornavn, person.mellomnavn, person.etternavn].join(" ");
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<IHendelse[]>([]);

  const handleOpenModal = () => {
    setModalOpen(true);
    // TODO: Legg disse til i eget endepunkt fra backend.
    // Per nå så justerer denne perioder til history events når modalen åpnes
    const historyEvents = transformPerioderToHistoryEvents(perioder);

    // TODO: Dette skal komme fra endepunktet senere
    const registrertSomArbeidssøkerEvent: IHendelse = {
      date: formatterDato({ dato: "2024-01-15T08:30:00.000Z", format: DatoFormat.DagMndAar }),
      time: new Date("2024-01-15T08:30:00.000Z").toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      event: "Registrert som arbeidssøker",
      type: "Elektronisk",
      kategori: "System",
    };

    setEvents([...historyEvents, registrertSomArbeidssøkerEvent]);
  };

  return (
    <div className={styles.personInformasjonContainer}>
      <div className={styles.personInformasjon}>
        <BodyShort size="small">{fulltNavn}</BodyShort>
        <BodyShort size="small">
          Personnummer: <strong>{person.ident}</strong>
        </BodyShort>
        <BodyShort size="small">
          Statsborgerskap: <strong>{person.statsborgerskap}</strong>
        </BodyShort>
      </div>
      <div className={styles.headerKnapper}>
        <Button variant="secondary-neutral" size="small" onClick={handleOpenModal}>
          Historikk
        </Button>
      </div>

      <HistorikkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fulltNavn={fulltNavn}
        hendelser={events}
      />
    </div>
  );
}
