import { FigureOutwardFillIcon, SilhouetteFillIcon } from "@navikt/aksel-icons";
import { BodyShort, Button, CopyButton, Skeleton } from "@navikt/ds-react";
import classNames from "classnames";
import { differenceInYears } from "date-fns";
import { useMemo, useState } from "react";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";
import { maskerVerdi } from "~/utils/skjul-sensitiv-opplysning";
import type { IArbeidssokerperiode, IPerson, IRapporteringsperiode } from "~/utils/types";

import {
  transformArbeidssokerperioderToHistoryEvents,
  transformPerioderToHistoryEvents,
} from "../../modals/historikk/historikk.utils";
import { HistorikkModal } from "../../modals/historikk/HistorikkModal";
import styles from "./personlinje.module.css";

interface IProps {
  person: IPerson;
  perioder?: IRapporteringsperiode[];
  arbeidssokerperioder?: IArbeidssokerperiode[];
}

export default function Personlinje({ person, perioder = [], arbeidssokerperioder = [] }: IProps) {
  const fulltNavn = [person.fornavn, person.mellomnavn, person.etternavn].join(" ");
  const [modalOpen, setModalOpen] = useState(false);
  const { skjulSensitiveOpplysninger, isReady } = useSaksbehandler();

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
              className={classNames(styles.iconContainer, {
                [styles.iconContainerMann]: person.kjonn === "MANN",
                [styles.iconContainerKvinne]: person.kjonn === "KVINNE",
              })}
            >
              {person.kjonn === "MANN" && (
                <SilhouetteFillIcon title="" fontSize="1.5rem" color="white" />
              )}
              {person.kjonn === "KVINNE" && (
                <FigureOutwardFillIcon title="" fontSize="1.5rem" color="white" />
              )}
            </span>
          )}
          {!isReady ? (
            <Skeleton variant="text" width="150px" />
          ) : (
            <BodyShort size="small">
              {skjulSensitiveOpplysninger ? (
                <span className={styles.sensitiv}>{maskerVerdi(fulltNavn)}</span>
              ) : (
                <strong>{fulltNavn}</strong>
              )}
            </BodyShort>
          )}
        </div>

        {!isReady ? (
          <Skeleton variant="text" width="200px" />
        ) : (
          <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
            Fødselsnummer:{" "}
            {skjulSensitiveOpplysninger ? (
              <span className={styles.sensitiv}>{maskerVerdi(person.ident)}</span>
            ) : (
              <strong>{person.ident}</strong>
            )}{" "}
            <CopyButton copyText={person.ident} size="xsmall" />
          </BodyShort>
        )}

        {person.fodselsdato && (
          <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
            Alder: <b>{differenceInYears(new Date(), person.fodselsdato)}</b>
          </BodyShort>
        )}

        {person.kjonn && (
          <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
            Kjønn: <b>{person.kjonn}</b>
          </BodyShort>
        )}

        <BodyShort size="small" textColor="subtle" className={styles.infoElement}>
          Statsborgerskap: <strong>{person.statsborgerskap}</strong>
        </BodyShort>
      </div>
      <div className={styles.historikkKnapp}>
        <Button variant="secondary-neutral" size="xsmall" onClick={() => setModalOpen(true)}>
          Historikk
        </Button>
      </div>

      <HistorikkModal open={modalOpen} onClose={() => setModalOpen(false)} hendelser={events} />
    </div>
  );
}
