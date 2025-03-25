import type { IPerson } from "~/utils/types";

import styles from "./PersonInformasjon.module.css";

interface IProps {
  person: IPerson;
}

export default function PersonInformasjon({ person }: IProps) {
  const fulltNavn = [person.fornavn, person.mellomnavn, person.etternavn].join(" ");

  return (
    <div className={styles.personInformasjon}>
      <div>{fulltNavn}</div>
      <div>
        Personnummer: <strong>{person.ident}</strong>
      </div>
      <div>
        Statsborgerskap: <strong>{person.statsborgerskap}</strong>
      </div>
    </div>
  );
}
