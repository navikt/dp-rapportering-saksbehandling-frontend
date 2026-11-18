import { CheckmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, BodyShort, Heading, Modal, Process, Tag } from "@navikt/ds-react";
import { useRouteLoaderData } from "react-router";

import { sanityTekst } from "~/sanity/utils";
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
  let rootData;
  try {
    rootData = useRouteLoaderData("root");
  } catch {
    rootData = null;
  }
  const tekster = rootData?.sanityData?.historikkModal;

  const hendelserEtterAar = groupByYear(hendelser, (hendelse) => hendelse.dato);
  const sortedYears = sortYearsDescending(hendelserEtterAar);

  const harMeldekort = hendelser.some((hendelse) => hendelse.kategori === "Meldekort");
  const harArbeidssokerperioder = hendelser.some((hendelse) => hendelse.kategori === "System");

  const harFeil = !harMeldekort || !harArbeidssokerperioder;

  const feilMelding =
    !harMeldekort && !harArbeidssokerperioder
      ? sanityTekst(tekster?.feilmeldinger?.ingenData, "historikkModal.feilmeldinger.ingenData")
      : !harMeldekort
        ? sanityTekst(
            tekster?.feilmeldinger?.ingenMeldekort,
            "historikkModal.feilmeldinger.ingenMeldekort",
          )
        : sanityTekst(
            tekster?.feilmeldinger?.ingenStatus,
            "historikkModal.feilmeldinger.ingenStatus",
          );

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="historikk-heading"
      closeOnBackdropClick
      className={styles.modal}
    >
      <Modal.Header>
        <Heading level="1" size="small" id="historikk-heading">
          {sanityTekst(tekster?.overskrift, "historikkModal.overskrift")}
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
                  <Process
                    aria-label={sanityTekst(
                      tekster?.prosessAriaLabel,
                      "historikkModal.prosessAriaLabel",
                    ).replace("{{aar}}", String(year))}
                  >
                    {hendelserEtterAar[year].map((hendelse, id) => {
                      const visningDatoTekst =
                        hendelse.kategori === "Meldekort"
                          ? sanityTekst(tekster?.innsendt, "historikkModal.innsendt")
                              .replace("{{dato}}", hendelse.innsendtDato)
                              .replace("{{tid}}", hendelse.time)
                          : `${hendelse.innsendtDato}, kl. ${hendelse.time}`;

                      const bullet = getBullet(
                        hendelse.event,
                        sanityTekst(
                          tekster?.hendelsetyper?.registrert,
                          "historikkModal.hendelsetyper.registrert",
                        ),
                        sanityTekst(
                          tekster?.hendelsetyper?.avregistrert,
                          "historikkModal.hendelsetyper.avregistrert",
                        ),
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
                                ? sanityTekst(
                                    tekster?.typeLabels?.elektronisk,
                                    "historikkModal.typeLabels.elektronisk",
                                  )
                                : hendelse.type === "Manuell"
                                  ? sanityTekst(
                                      tekster?.typeLabels?.manuell,
                                      "historikkModal.typeLabels.manuell",
                                    )
                                  : hendelse.type}
                            </BodyShort>
                          )}
                          {hendelse.erSendtForSent && (
                            <>
                              <BodyShort size="small">
                                {sanityTekst(
                                  tekster?.fristLabel,
                                  "historikkModal.fristLabel",
                                ).replace("{{dato}}", hendelse.sisteFristForTrekk || "")}
                              </BodyShort>
                              <Tag data-color="danger" variant="outline" size="xsmall">
                                {sanityTekst(
                                  tekster?.tags?.forSentInnsendt,
                                  "historikkModal.tags.forSentInnsendt",
                                )}
                              </Tag>
                            </>
                          )}
                          {hendelse.hendelseType === "Korrigert" && (
                            <Tag data-color="warning" variant="outline" size="small">
                              {sanityTekst(
                                tekster?.tags?.korrigert,
                                "historikkModal.tags.korrigert",
                              )}
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
    </Modal>
  );
}
