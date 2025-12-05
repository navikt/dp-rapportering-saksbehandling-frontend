import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, BodyShort, Heading, Modal, Process, Tag, Theme } from "@navikt/ds-react";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";
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
  const { tema } = useSaksbehandler();
  const hendelserEtterAar = groupByYear(hendelser, (hendelse) => hendelse.dato);
  const sortedYears = sortYearsDescending(hendelserEtterAar);

  const harMeldekort = hendelser.some((hendelse) => hendelse.kategori === "Meldekort");
  const harArbeidssokerperioder = hendelser.some((hendelse) => hendelse.kategori === "System");

  const harFeil = !harMeldekort || !harArbeidssokerperioder;

  const feilMelding =
    !harMeldekort && !harArbeidssokerperioder
      ? "Fant hverken meldekort eller arbeidssøkerstatus knyttet til denne personen"
      : !harMeldekort
        ? "Fant ingen meldekort knyttet til denne personen"
        : "Fant ingen arbeidssøkerstatus knyttet til denne personen";

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="historikk-heading"
      closeOnBackdropClick
      portal
    >
      <Theme theme={tema}>
        <Modal.Header>
          <Heading level="1" size="small" id="historikk-heading">
            Historikk
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.modalContent}>
            {harFeil && <Alert variant="error">{feilMelding}</Alert>}
            <Accordion>
              {sortedYears.map((year, index) => (
                <Accordion.Item key={year} defaultOpen={index === 0}>
                  <Accordion.Header>{year}</Accordion.Header>
                  <Accordion.Content>
                    <Process aria-label={`Meldekort for ${year}`}>
                      {hendelserEtterAar[year].map((hendelse, id) => {
                        const visningDatoTekst =
                          hendelse.kategori === "Meldekort"
                            ? `Innsendt: ${hendelse.innsendtDato}, kl. ${hendelse.time}`
                            : `${hendelse.innsendtDato}, kl. ${hendelse.time}`;

                        const bullet = getBullet(hendelse.event);

                        // For skjermlesere: fjern "Meldekort" fra event tekst siden det er i aria-label på Process
                        const srEventText =
                          hendelse.kategori === "Meldekort"
                            ? hendelse.event.replace("Meldekort ", "")
                            : hendelse.event;

                        return (
                          <Process.Event
                            key={`${hendelse.innsendtDato}-${id}`}
                            title={hendelse.event}
                            timestamp={visningDatoTekst}
                            status="completed"
                            bullet={bullet}
                            aria-label={srEventText}
                          >
                            {hendelse.type && <BodyShort size="small">{hendelse.type}</BodyShort>}
                            {hendelse.erSendtForSent && (
                              <>
                                <BodyShort size="small">
                                  Frist: {hendelse.sisteFristForTrekk}
                                </BodyShort>
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
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </Modal.Body>
      </Theme>
    </Modal>
  );
}
