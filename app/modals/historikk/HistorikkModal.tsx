import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { BodyShort, Heading, Label, Modal, Process, Tag } from "@navikt/ds-react";

import { groupByYear, sortYearsDescending } from "~/utils/dato.utils";

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
  sisteFristForTrekk?: string | null;
}

interface HistorikkModalProps {
  open: boolean;
  onClose: () => void;
  hendelser: IHendelse[];
}

// Konstanter for event-typer
export const EVENT_TYPES = {
  REGISTERED: "Registrert som arbeidssøker",
  UNREGISTERED: "Avregistrert som arbeidssøker",
} as const;

function getBullet(event: string) {
  const isRegistered = event === EVENT_TYPES.REGISTERED;
  const isUnregistered = event === EVENT_TYPES.UNREGISTERED;

  if (isRegistered) {
    return <CheckmarkIcon title="" fontSize="1.5rem" />;
  }

  if (isUnregistered) {
    return <XMarkIcon title="" fontSize="1.5rem" />;
  }

  return undefined;
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
                <Label>{year}</Label>
              </div>
              <Process>
                {hendelserEtterAar[year].map((hendelse, id) => {
                  const visningDatoTekst =
                    hendelse.kategori === "Meldekort"
                      ? `Innsendt: ${hendelse.innsendtDato}, kl. ${hendelse.time}`
                      : `${hendelse.innsendtDato}, kl. ${hendelse.time}`;

                  const bullet = getBullet(hendelse.event);

                  return (
                    <Process.Event
                      key={`${hendelse.innsendtDato}-${id}`}
                      title={hendelse.event}
                      timestamp={visningDatoTekst}
                      status="completed"
                      bullet={bullet}
                    >
                      {hendelse.type && <BodyShort size="small">{hendelse.type}</BodyShort>}
                      {hendelse.erSendtForSent && (
                        <>
                          <BodyShort size="small">Frist: {hendelse.sisteFristForTrekk}</BodyShort>
                          <Tag variant="error" size="xsmall">
                            Innsendt etter fristen
                          </Tag>
                        </>
                      )}
                      {hendelse.hendelseType === "Korrigert" && (
                        <Tag variant="warning" size="small">
                          Korrigert
                        </Tag>
                      )}
                    </Process.Event>
                  );
                })}
              </Process>
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
