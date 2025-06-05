import { BodyShort, Heading, Modal, Tag } from "@navikt/ds-react";

import styles from "./historikkModal.module.css";

interface HistoryEvent {
  date: string;
  event: string;
  tag?: string;
}

interface HistorikkModalProps {
  open: boolean;
  onClose: () => void;
  fulltNavn: string;
}

const events: HistoryEvent[] = [
  { date: "14. april 2025", event: "Meldekort uke 14 og 15 levert", tag: "Elektronisk" },
  { date: "31. mars 2025", event: "Meldekort uke 12 og 13 levert", tag: "Elektronisk" },
  { date: "20. mars 2025", event: `Meldegruppe “Dagpenger”` },
  { date: "15. mars 2025", event: `Meldegruppe “Arbeidssøker uten ytelse”` },
  { date: "15. mars 2025", event: "Registrert som arbeidssøker" },
  { date: "12. mars 2025", event: "Inaktivert som arbeidssøker" },
  { date: "10. mars 2025", event: "Registrert som arbeidssøker" },
];

export function HistorikkModal({ open, onClose, fulltNavn }: HistorikkModalProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="historikk-heading" closeOnBackdropClick>
      <Modal.Header>
        <Heading level="2" size="medium" id="historikk-heading">
          {`Historikk — ${fulltNavn}`}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <ol className={styles.list}>
          {events.map((item, idx) => {
            const isCurrent = idx === 0;
            const hasLine = idx !== events.length - 1;

            return (
              <li key={`${item.date}-${idx}`} className={styles.listItem}>
                <div className={styles.timeline}>
                  <span
                    className={`${styles.circle} ${isCurrent ? styles.current : ""}`}
                    aria-hidden="true"
                  />
                  {hasLine && <span className={styles.line} aria-hidden="true" />}
                </div>
                <div className={styles.content}>
                  <BodyShort size="small" weight="semibold">
                    {item.date}
                  </BodyShort>
                  <BodyShort size="small">{item.event}</BodyShort>
                  {item.tag && <Tag variant="neutral">{item.tag}</Tag>}
                </div>
              </li>
            );
          })}
        </ol>
      </Modal.Body>
    </Modal>
  );
}
