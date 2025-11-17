import { Button, Modal } from "@navikt/ds-react";

interface IProps {
  open: boolean;
  onClose: () => void;
  type: string | null;
  tittel: string;
  tekst: React.ReactNode;
  bekreftTekst: string;
  avbrytTekst: string;
  onBekreft: () => void;
  onAvbryt?: () => void;
}

export function BekreftModal({
  open,
  onClose,
  type,
  tittel,
  tekst,
  bekreftTekst,
  avbrytTekst,
  onBekreft,
  onAvbryt,
}: IProps) {
  if (!type) return null;

  function handleBekreft() {
    onBekreft();
    onClose();
  }

  function handleAvbryt() {
    if (onAvbryt) {
      onAvbryt();
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} header={{ heading: tittel }} portal>
      <Modal.Body>{tekst}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleBekreft} size="small">
          {bekreftTekst}
        </Button>
        <Button variant="secondary" onClick={handleAvbryt} size="small">
          {avbrytTekst}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
