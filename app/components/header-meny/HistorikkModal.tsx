import { BodyLong, Heading, Modal } from "@navikt/ds-react";

interface HistorikkModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HistorikkModal({ open, onClose }: HistorikkModalProps) {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-heading">
      <Modal.Header>
        <Heading level="2" size="large" id="modal-heading">
          Historikk
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <BodyLong>
          Culpa aliquip ut cupidatat laborum minim quis ex in aliqua. Qui incididunt dolor do ad ut.
          Incididunt eiusmod nostrud deserunt duis laborum. Proident aute culpa qui nostrud velit
          adipisicing minim. Consequat aliqua aute dolor do sit Lorem nisi mollit velit. Aliqua
          exercitation non minim minim pariatur sunt laborum ipsum. Exercitation nostrud est laborum
          magna non non aliqua qui esse.
        </BodyLong>
      </Modal.Body>
    </Modal>
  );
}
