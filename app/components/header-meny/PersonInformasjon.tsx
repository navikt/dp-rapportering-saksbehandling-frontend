import {
  FigureCombinationFillIcon,
  FigureInwardFillIcon,
  FigureOutwardFillIcon,
} from "@navikt/aksel-icons";
import classNames from "classnames";

import type { IPerson } from "~/utils/types";

import styles from "./PersonInformasjon.module.css";

interface IProps {
  person: IPerson;
}

const ikoner = {
  UKJENT: FigureCombinationFillIcon,
  MANN: FigureInwardFillIcon,
  KVINNE: FigureOutwardFillIcon,
};

export default function PersonInformasjon({ person }: IProps) {
  const fulltNavn = [person.fornavn, person.mellomnavn, person.etternavn].join(" ");

  const Kjonn = ikoner[person.kjonn];

  return (
    <div className={styles.personInformasjon}>
      <div className={classNames(styles.kjonnIkon, styles[person.kjonn.toLowerCase()])}>
        <Kjonn fontSize="1.5rem" fill="#ffff00" />
      </div>
      <div>
        <a href="/person/17051412345">{fulltNavn}</a>
      </div>
      <div>
        Personnummer: <strong>{person.ident}</strong>
      </div>
      <div>
        Alder: <strong>{person.alder}</strong>
      </div>
      <div>
        Kjønn: <strong>{person.kjonn}</strong>
      </div>
      <div>
        Statsborgerskap: <strong>{person.statsborgerskap}</strong>
      </div>
    </div>
  );
}
