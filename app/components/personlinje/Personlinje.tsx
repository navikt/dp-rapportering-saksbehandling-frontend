import { FigureOutwardFillIcon, SilhouetteFillIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, CopyButton } from "@navikt/ds-react";
import classNames from "classnames";
import { useMemo, useState } from "react";

import type { IMeldekortPersonlinje } from "~/sanity/fellesKomponenter/personlinje/types";
import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

import {
  transformArbeidssokerperioderToHistoryEvents,
  transformPerioderToHistoryEvents,
} from "../../modals/historikk/historikk.utils";
import { HistorikkModal } from "../../modals/historikk/HistorikkModal";
import {
  beregnAlder,
  byggFulltNavn,
  erKvinne,
  erMann,
  getKjonnKlasse,
} from "./Personlinje.helpers";
import styles from "./personlinje.module.css";

const defaultPersonlinjeData: IMeldekortPersonlinje = {
  sectionAriaLabel: "Informasjon om valgt person",
  birthNumberLabel: "Fødselsnummer",
  ageLabel: "Alder",
  genderLabel: "Kjønn",
  citizenshipLabel: "Statsborgerskap",
  historyButton: "Historikk",
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

  // Sjekk om data er maskert (kommer fra server-side maskering)
  const erMaskert = fulltNavn.includes("•") || person.ident.includes("•");

  const texts = { ...defaultPersonlinjeData, ...(personlinjeData ?? {}) };

  const events = useMemo(() => {
    return [
      ...transformArbeidssokerperioderToHistoryEvents(arbeidssokerperioder),
      ...transformPerioderToHistoryEvents(perioder),
    ].sort((a, b) => (a.dato < b.dato ? 1 : -1));
  }, [perioder, arbeidssokerperioder]);

  return (
    <div className={styles.personlinjeContainer}>
      <div className={styles.personlinje}>
        <div className={styles.navnContainer}>
          {person.kjonn && (
            <span
              className={classNames(
                styles.iconContainer,
                person.kjonn ? styles[getKjonnKlasse(person.kjonn)] : undefined,
              )}
            >
              {erMann(person.kjonn) && (
                <SilhouetteFillIcon title="" fontSize="1.5rem" color="white" />
              )}
              {erKvinne(person.kjonn) && (
                <FigureOutwardFillIcon title="" fontSize="1.5rem" color="white" />
              )}
            </span>
          )}
          <BodyShort size="small">
            <strong className={erMaskert ? styles.sensitiv : undefined}>{fulltNavn}</strong>
          </BodyShort>
        </div>

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
      </div>
      <div className={styles.historikkKnapp}>
        <Button variant="secondary-neutral" size="xsmall" onClick={() => setModalOpen(true)}>
          {texts.historyButton}
        </Button>
      </div>

      <HistorikkModal open={modalOpen} onClose={() => setModalOpen(false)} hendelser={events} />
    </div>
  );
}
