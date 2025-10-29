import { SealCheckmarkIcon, SealXMarkIcon } from "@navikt/aksel-icons";
import { BodyShort, Heading, Tag } from "@navikt/ds-react";
import classNames from "classnames";

import type { IHendelse } from "../HistorikkModal";
import styles from "./historikkListeItem.module.css";

// Konstanter for event-typer
export const EVENT_TYPES = {
  REGISTERED: "Registrert som arbeidssøker",
  UNREGISTERED: "Avregistrert som arbeidssøker",
} as const;

// Farger for ulike hendelsestyper
const BADGE_COLORS = {
  REGISTERED: "#CCF1D6",
  UNREGISTERED: "#FFC2C2",
} as const;

interface HistorikkListeItemProps {
  hendelse: IHendelse;
}

export function HistorikkListeItem({ hendelse }: HistorikkListeItemProps) {
  const { event, innsendtDato, time, type, hendelseType, kategori, erSendtForSent } = hendelse;
  const visningDatoTekst =
    kategori === "Meldekort"
      ? `Innsendt: ${innsendtDato}, kl. ${time}`
      : `${innsendtDato}, kl. ${time}`;

  const isRegistered = event === EVENT_TYPES.REGISTERED;
  const isUnregistered = event === EVENT_TYPES.UNREGISTERED;
  const needsContainer = isRegistered || isUnregistered;

  const getBulletBackgroundColor = () => {
    if (isUnregistered) return BADGE_COLORS.UNREGISTERED;
    if (isRegistered) return BADGE_COLORS.REGISTERED;
    return undefined;
  };

  const renderBulletIcon = () => {
    if (isRegistered) {
      return <SealCheckmarkIcon title="" fontSize="1.0625rem" />;
    }

    if (isUnregistered) {
      return <SealXMarkIcon title="" fontSize="1.0625rem" />;
    }

    // Andre hendelser: tom sirkel
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="17"
        viewBox="0 0 17 17"
        fill="none"
      >
        <circle cx="8.5" cy="8.5" r="8" fill="#D9D9D9" stroke="#D9D9D9" />
      </svg>
    );
  };

  const backgroundColor = getBulletBackgroundColor();
  return (
    <li className={styles.listItem}>
      <div
        className={classNames(styles.markerContainer, {
          [styles.markerContainerEmpty]: !needsContainer,
        })}
      >
        {needsContainer ? (
          <div className={styles.bulletContainer} style={{ backgroundColor }}>
            {renderBulletIcon()}
          </div>
        ) : (
          renderBulletIcon()
        )}
        <div className={styles.line} />
      </div>
      <div className={styles.listContent}>
        <Heading level="3" size="xsmall">
          {event}
        </Heading>
        <BodyShort size="small">{visningDatoTekst}</BodyShort>
        <BodyShort size="small"> {type}</BodyShort>

        {erSendtForSent && (
          <>
            <BodyShort size="small">Frist: {innsendtDato}</BodyShort>
            <Tag variant="error" size="xsmall">
              Innsendt etter fristen
            </Tag>
          </>
        )}
        {hendelseType === "Korrigert" && (
          <Tag variant="warning" size="small">
            Korrigert
          </Tag>
        )}
      </div>
    </li>
  );
}
