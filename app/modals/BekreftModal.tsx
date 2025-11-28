import { Button, Modal, Theme } from "@navikt/ds-react";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";

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
  const { tema } = useSaksbehandler();

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
    <Modal open={open} onClose={onClose} portal aria-label={tittel}>
      <Theme theme={tema} hasBackground>
        <Modal.Header>
          <h2>{tittel}</h2>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: tema === "dark" ? "#333" : "#fff" }}>
          {tekst}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleBekreft} size="small">
            {bekreftTekst}
          </Button>
          <Button variant="secondary" onClick={handleAvbryt} size="small">
            {avbrytTekst}
          </Button>
        </Modal.Footer>
      </Theme>
    </Modal>
  );
}
