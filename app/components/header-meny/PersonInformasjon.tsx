import { BodyLong, Button, Heading, Modal } from "@navikt/ds-react";
import { useState } from "react";

import type { IPerson } from "~/utils/types";

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
      <Button variant="secondary-neutral" size="small" onClick={() => setModalOpen(true)}>
        Historikk
      </Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-heading">
        <Modal.Header>
          <Heading level="1" size="large" id="modal-heading">
            Laborum proident id ullamco
          </Heading>
        </Modal.Header>
        <Modal.Body>
          <BodyLong>
            Culpa aliquip ut cupidatat laborum minim quis ex in aliqua. Qui incididunt dolor do ad
            ut. Incididunt eiusmod nostrud deserunt duis laborum. Proident aute culpa qui nostrud
            velit adipisicing minim. Consequat aliqua aute dolor do sit Lorem nisi mollit velit.
            Aliqua exercitation non minim minim pariatur sunt laborum ipsum. Exercitation nostrud
            est laborum magna non non aliqua qui esse.
          </BodyLong>
        </Modal.Body>
      </Modal>
    </div>
  );
}
