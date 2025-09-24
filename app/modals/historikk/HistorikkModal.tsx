import { Heading, Modal } from "@navikt/ds-react";

import styles from "./historikkModal.module.css";

export interface IHendelse {
  date: string;
  time: string;
  event: string;
  hendelseType?: "Innsendt" | "Korrigert";
  type?: "Elektronisk" | "Manuell";
  kategori: "Meldekort" | "System";
}

interface HistorikkModalProps {
  open: boolean;
  onClose: () => void;
  fulltNavn: string;
  hendelser: IHendelse[];
}

export function HistorikkModal({ open, onClose, fulltNavn, hendelser }: HistorikkModalProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="historikk-heading" closeOnBackdropClick>
      <Modal.Header>
        <Heading level="2" size="small" id="historikk-heading">
          {`Historikk — ${fulltNavn}`}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <ol className={styles.list}>
          {hendelser.map((hendelse, id) => (
            <li key={`${hendelse.date}-${id}`} className={styles.row}>
              <dl className={styles.tidspunkt}>
                <dt className="sr-only">Dato</dt>
                <dd>{hendelse.date}</dd>
                <dt className="sr-only">Tid</dt>
                <dd>kl {hendelse.time}</dd>
              </dl>
              <div aria-hidden="true" className={styles.line}>
                <span
                  className={`${styles.marker} ${hendelse.kategori === "Meldekort" ? styles.meldekort : styles.andreHendelser}`}
                />
              </div>
              <dl className={styles.hendelse}>
                <dt className="sr-only">Meldekort</dt>
                <dd>{hendelse.event}</dd>
                {hendelse.hendelseType && (
                  <>
                    <dt className="sr-only">Hendelsestype</dt>
                    <dd>{hendelse.hendelseType}</dd>
                  </>
                )}
                <dt className="sr-only">Type</dt>
                <dd className={styles.subtle}>{hendelse.type || "x"}</dd>
              </dl>
            </li>
          ))}
        </ol>
      </Modal.Body>
    </Modal>
  );
}
