import { Heading, Modal } from "@navikt/ds-react";

import styles from "./historikkModal.module.css";

export interface Hendelse {
  date: string;
  time: string;
  event: string;
  type?: string;
}

interface HistorikkModalProps {
  open: boolean;
  onClose: () => void;
  fulltNavn: string;
  hendelse: Hendelse[];
}

export function HistorikkModal({ open, onClose, fulltNavn, hendelse }: HistorikkModalProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="historikk-heading" closeOnBackdropClick>
      <Modal.Header>
        <Heading level="2" size="medium" id="historikk-heading">
          {`Historikk — ${fulltNavn}`}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <ol className={styles.list}>
          {hendelse.map((item, idx) => (
            <li key={`${item.date}-${idx}`} className={styles.row}>
              <dl className={styles.tidspunkt}>
                <dt className="sr-only">Dato</dt>
                <dd>{item.date}</dd>
                <dt className="sr-only">Tid</dt>
                <dd>kl {item.time}</dd>
              </dl>
              <div aria-hidden="true" className={styles.line}>
                <span
                  className={`${styles.marker} ${item.type === "Elektronisk" ? styles.meldekort : styles.andreHendelser}`}
                />
              </div>
              <dl className={styles.hendelse}>
                legg til innhold i historikk
                <dt className="sr-only">Hendelse</dt>
                <dd>{item.event}</dd>
                <dt className="sr-only">Type</dt>
                <dd className={styles.subtle}>{item.type || "x"}</dd>
              </dl>
            </li>
          ))}
        </ol>
      </Modal.Body>
    </Modal>
  );
}
