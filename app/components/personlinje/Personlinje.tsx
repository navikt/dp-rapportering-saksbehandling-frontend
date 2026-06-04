import {
  ChevronDownIcon,
  ChevronUpIcon,
  FigureOutwardFillIcon,
  SilhouetteFillIcon,
} from "@navikt/aksel-icons";
import { BodyShort, Button, CopyButton } from "@navikt/ds-react";
import classNames from "classnames";
import { useMemo, useState } from "react";

import type { IMeldekortPersonlinje } from "~/sanity/fellesKomponenter/personlinje/types";
import { deepMerge } from "~/utils/deep-merge.utils";
import { showOpprettMeldekortManuelt } from "~/utils/env.utils";
import { byggFulltNavn } from "~/utils/person.utils";
import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

import {
  transformArbeidssokerperioderToHistoryEvents,
  transformPerioderToHistoryEvents,
} from "../../modals/historikk/historikk.utils";
import { HistorikkModal } from "../../modals/historikk/HistorikkModal";
import { OpprettMeldekortModal } from "../../modals/opprett-meldekort/OpprettMeldekortModal";
import { beregnAlder, erKvinne, erMann, getKjonnKlasse } from "./Personlinje.helpers";
import styles from "./personlinje.module.css";

// Default tekster som fallback hvis Sanity-data ikke er tilgjengelig
const DEFAULT_PERSONLINJE: IMeldekortPersonlinje = {
  sectionAriaLabel: "Brukerinformasjon",
  birthNumberLabel: "Fødselsnummer:",
  ageLabel: "Alder:",
  genderLabel: "Kjønn:",
  citizenshipLabel: "Statsborgerskap:",
  historyButton: "Historikk",
  createReportCardButton: "Opprett meldekort",
};

interface IProps {
  person: IPerson;
  perioder?: IRapporteringsperiode[];
  arbeidssokerperioder?: IArbeidssokerperiode[];
  personlinjeData?: IMeldekortPersonlinje | null;
}

export default function Personlinje({
  person,
  perioder = [],
  arbeidssokerperioder = [],
  personlinjeData,
}: IProps) {
  const fulltNavn = byggFulltNavn(person.fornavn, person.mellomnavn, person.etternavn);
  const [modalOpen, setModalOpen] = useState(false);
  const [opprettModalOpen, setOpprettModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Sjekk om data er maskert (kommer fra server-side maskering)
  const erMaskert = fulltNavn.includes("•") || person.ident.includes("•");

  // Bruk Sanity-data hvis tilgjengelig, ellers bruk defaults
  const texts = deepMerge(DEFAULT_PERSONLINJE, personlinjeData);

  const events = useMemo(() => {
    return [
      ...transformArbeidssokerperioderToHistoryEvents(arbeidssokerperioder),
      ...transformPerioderToHistoryEvents(perioder),
    ].sort((a, b) => (a.dato < b.dato ? 1 : -1));
  }, [perioder, arbeidssokerperioder]);

  return (
    <section className={styles.personlinjeContainer} aria-label={texts.sectionAriaLabel}>
      <div className={styles.personlinje}>
        {/* Mobil - interactive button */}
        <button
          className={styles.navnContainerMobil}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="personlinje-detaljer"
          type="button"
        >
          {person.kjonn && (
            <span
              className={classNames(
                styles.iconContainer,
                person.kjonn ? styles[getKjonnKlasse(person.kjonn)] : undefined,
              )}
              aria-hidden="true"
            >
              {erMann(person.kjonn) && (
                <SilhouetteFillIcon title="" fontSize="1.5rem" color="white" />
              )}
              {erKvinne(person.kjonn) && (
                <FigureOutwardFillIcon title="" fontSize="1.5rem" color="white" />
              )}
            </span>
          )}
          <BodyShort size="small" as="span">
            <strong className={erMaskert ? styles.sensitiv : undefined}>{fulltNavn}</strong>
          </BodyShort>
          <span className={styles.chevronIcon} aria-hidden="true">
            {isOpen ? (
              <ChevronUpIcon title="" fontSize="1.5rem" />
            ) : (
              <ChevronDownIcon title="" fontSize="1.5rem" />
            )}
          </span>
        </button>

        {/* Desktop - static div */}
        <div className={styles.navnContainerDesktop}>
          {person.kjonn && (
            <span
              className={classNames(
                styles.iconContainer,
                person.kjonn ? styles[getKjonnKlasse(person.kjonn)] : undefined,
              )}
              aria-hidden="true"
            >
              {erMann(person.kjonn) && (
                <SilhouetteFillIcon title="" fontSize="1.5rem" color="white" />
              )}
              {erKvinne(person.kjonn) && (
                <FigureOutwardFillIcon title="" fontSize="1.5rem" color="white" />
              )}
            </span>
          )}
          <BodyShort size="small" as="span">
            <strong className={erMaskert ? styles.sensitiv : undefined}>{fulltNavn}</strong>
          </BodyShort>
        </div>

        <div
          id="personlinje-detaljer"
          className={classNames(styles.detaljer, { [styles.detaljerOpen]: isOpen })}
        >
          <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
            {texts.birthNumberLabel}{" "}
            <strong className={erMaskert ? styles.sensitiv : undefined}>{person.ident}</strong>{" "}
            {!erMaskert && <CopyButton copyText={person.ident} size="xsmall" />}
          </BodyShort>

          {person.fodselsdato && (
            <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
              {texts.ageLabel} <b>{beregnAlder(person.fodselsdato)}</b>
            </BodyShort>
          )}

          {person.kjonn && (
            <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
              {texts.genderLabel} <b>{person.kjonn}</b>
            </BodyShort>
          )}

          <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
            {texts.citizenshipLabel} <strong>{person.statsborgerskap}</strong>
          </BodyShort>

          <div className={styles.knappContainerMobil}>
            <div>
              <Button
                data-color="neutral"
                variant="secondary"
                size="xsmall"
                onClick={() => setModalOpen(true)}
              >
                {texts.historyButton}
              </Button>
            </div>
            {showOpprettMeldekortManuelt && (
              <div>
                <Button
                  data-color="neutral"
                  variant="secondary"
                  size="xsmall"
                  onClick={() => setOpprettModalOpen(true)}
                >
                  {texts.createReportCardButton}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={styles.knappContainerDesktop}>
        <Button
          data-color="neutral"
          variant="secondary"
          size="small"
          onClick={() => setModalOpen(true)}
        >
          {texts.historyButton}
        </Button>
        {showOpprettMeldekortManuelt && (
          <Button
            data-color="neutral"
            variant="secondary"
            size="small"
            onClick={() => setOpprettModalOpen(true)}
          >
            {texts.createReportCardButton}
          </Button>
        )}
      </div>
      <HistorikkModal open={modalOpen} onClose={() => setModalOpen(false)} hendelser={events} />
      <OpprettMeldekortModal
        open={opprettModalOpen}
        onClose={() => setOpprettModalOpen(false)}
        brukerNavn={fulltNavn}
      />
    </section>
  );
}
