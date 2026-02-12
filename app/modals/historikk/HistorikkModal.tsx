import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, BodyShort, Heading, Modal, Process, Tag, Theme } from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";
import type { IMeldekortHistorikkModal } from "~/sanity/modaler/historikk-modal/types";
import { groupByYear, sortYearsDescending } from "~/utils/dato.utils";

import styles from "./historikkModal.module.css";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_TEKSTER: IMeldekortHistorikkModal = {
  overskrift: "Historikk",
  prosessAriaLabel: "Meldekort for {{aar}}",
  hendelsetyper: {
    registrert: "Registrert som arbeidssøker",
    avregistrert: "Avregistrert som arbeidssøker",
  },
  innsendt: "Innsendt: {{dato}}, kl. {{tid}}",
  typeLabels: {
    elektronisk: "Elektronisk",
    manuell: "Manuell",
  },
  tags: {
    forSentInnsendt: "Innsendt etter fristen",
    korrigert: "Korrigert",
  },
  fristLabel: "Frist: {{dato}}",
  feilmeldinger: {
    ingenData: "Fant hverken meldekort eller arbeidssøkerstatus knyttet til denne personen",
    ingenMeldekort: "Fant ingen meldekort knyttet til denne personen",
    ingenStatus: "Fant ingen arbeidssøkerstatus knyttet til denne personen",
  },
};

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

// Konstanter for event-typer (for bakoverkompatibilitet med tester)
export const EVENT_TYPES = {
  REGISTERED: DEFAULT_TEKSTER.hendelsetyper.registrert,
  UNREGISTERED: DEFAULT_TEKSTER.hendelsetyper.avregistrert,
} as const;

function getBullet(event: string, registrertTekst: string, avregistrertTekst: string) {
  const isRegistered = event === registrertTekst;
  const isUnregistered = event === avregistrertTekst;

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

  // Hent tekster fra Sanity med fallback (safe for tests)
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    rootData = null;
  }
  const tekster = rootData?.sanityData?.historikkModal ?? DEFAULT_TEKSTER;

  const hendelserEtterAar = groupByYear(hendelser, (hendelse) => hendelse.dato);
  const sortedYears = sortYearsDescending(hendelserEtterAar);

  const harMeldekort = hendelser.some((hendelse) => hendelse.kategori === "Meldekort");
  const harArbeidssokerperioder = hendelser.some((hendelse) => hendelse.kategori === "System");

  const harFeil = !harMeldekort || !harArbeidssokerperioder;

  const feilMelding =
    !harMeldekort && !harArbeidssokerperioder
      ? tekster.feilmeldinger.ingenData
      : !harMeldekort
        ? tekster.feilmeldinger.ingenMeldekort
        : tekster.feilmeldinger.ingenStatus;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="historikk-heading"
      closeOnBackdropClick
      portal
      className={styles.modal}
    >
      <Theme theme={tema}>
        <Modal.Header>
          <Heading level="1" size="small" id="historikk-heading">
            {tekster.overskrift}
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.modalContent}>
            {harFeil && <Alert variant="error">{feilMelding}</Alert>}
            <Accordion indent={false} className={styles.yearList}>
              {sortedYears.map((year, index) => (
                <Accordion.Item key={year} defaultOpen={index === 0}>
                  <Accordion.Header>{year}</Accordion.Header>
                  <Accordion.Content>
                    <Process aria-label={tekster.prosessAriaLabel.replace("{{aar}}", String(year))}>
                      {hendelserEtterAar[year].map((hendelse, id) => {
                        const visningDatoTekst =
                          hendelse.kategori === "Meldekort"
                            ? tekster.innsendt
                                .replace("{{dato}}", hendelse.innsendtDato)
                                .replace("{{tid}}", hendelse.time)
                            : `${hendelse.innsendtDato}, kl. ${hendelse.time}`;

                        const bullet = getBullet(
                          hendelse.event,
                          tekster.hendelsetyper.registrert,
                          tekster.hendelsetyper.avregistrert,
                        );

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
                            {hendelse.type && (
                              <BodyShort size="small">
                                {hendelse.type === "Elektronisk"
                                  ? tekster.typeLabels.elektronisk
                                  : hendelse.type === "Manuell"
                                    ? tekster.typeLabels.manuell
                                    : hendelse.type}
                              </BodyShort>
                            )}
                            {hendelse.erSendtForSent && (
                              <>
                                <BodyShort size="small">
                                  {tekster.fristLabel.replace(
                                    "{{dato}}",
                                    hendelse.sisteFristForTrekk || "",
                                  )}
                                </BodyShort>
                                <Tag variant="error" size="xsmall">
                                  {tekster.tags.forSentInnsendt}
                                </Tag>
                              </>
                            )}
                            {hendelse.hendelseType === "Korrigert" && (
                              <Tag variant="warning" size="small">
                                {tekster.tags.korrigert}
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
