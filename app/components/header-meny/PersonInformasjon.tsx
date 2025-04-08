import { Button } from "@navikt/ds-react";
import { useState } from "react";

import type { IPerson } from "~/utils/types";

import HistorikkModal from "./HistorikkModal";
import styles from "./PersonInformasjon.module.css";

interface IProps {
  person: IPerson;
}

export default function PersonInformasjon({ person }: IProps) {
  const fulltNavn = [person.fornavn, person.mellomnavn, person.etternavn].join(" ");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.personInformasjonContainer}>
      <div className={styles.personInformasjon}>
        <div>{fulltNavn}</div>
        <div>
          Personnummer: <strong>{person.ident}</strong>
        </div>
        <div>
          Statsborgerskap: <strong>{person.statsborgerskap}</strong>
        </div>
      </div>
      <div className={styles.headerKnapper}>
        <Button variant="primary-neutral" size="small" className="nytt-meldekort-knapp">
          Nytt meldekort
        </Button>
        <Button variant="secondary-neutral" size="small" onClick={() => setModalOpen(true)}>
          Historikk
        </Button>
      </div>

      <HistorikkModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
