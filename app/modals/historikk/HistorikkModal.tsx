import { Heading, Label, Modal } from "@navikt/ds-react";

import { groupByYear, sortYearsDescending } from "~/utils/dato.utils";

import { HistorikkListeItem } from "./components/HistorikkListeItem";
import styles from "./historikkModal.module.css";

export interface IHendelse {
  dato: Date;
  innsendtDato: string;
  time: string;
  event: string;
  hendelseType?: "Innsendt" | "Korrigert";
  type?: "Elektronisk" | "Manuell";
  kategori: "Meldekort" | "System";
  erSendtForSent?: boolean;
}

interface HistorikkModalProps {
  open: boolean;
  onClose: () => void;
  hendelser: IHendelse[];
}

export function HistorikkModal({ open, onClose, hendelser }: HistorikkModalProps) {
  const hendelserEtterAar = groupByYear(hendelser, (hendelse) => hendelse.dato);
  const sortedYears = sortYearsDescending(hendelserEtterAar);

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="historikk-heading" closeOnBackdropClick>
      <Modal.Header>
        <Heading level="2" size="small" id="historikk-heading">
          Historikk
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.modalContent}>
          {sortedYears.map((year) => (
            <div key={year} className={styles.yearList}>
              <div className={styles.listTitle}>
                <Label size="small">{year}</Label>
              </div>
              <ol className={styles.list}>
                {hendelserEtterAar[year].map((hendelse, id) => (
                  <HistorikkListeItem key={`${hendelse.innsendtDato}-${id}`} hendelse={hendelse} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
