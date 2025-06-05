import { Button, Modal } from "@navikt/ds-react";
import { useFetcher, useNavigate } from "react-router";

import type { IPerson, IRapporteringsperiode } from "~/utils/types";

interface IProps {
  open: boolean;
  onClose: () => void;
  type: "avbryt" | "fullfor" | null;
  korrigertPeriode: IRapporteringsperiode;
  person: IPerson;
}

export function BekreftModal({ open, onClose, type, korrigertPeriode, person }: IProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  if (!type) return null;

  const erAvbryt = type === "avbryt";
  const tittel = erAvbryt ? "Vil du avbryte korrigeringen?" : "Vil du fullføre korrigeringen?";
  const tekst = erAvbryt
    ? "Du er i ferd med å avbryte korrigeringen du har begynt på. Er du sikker på at du vil avbryte? Endringene du har gjort så langt vil ikke lagres."
    : "Du er i ferd med å fullføre korrigeringen. Ved å trykke “Ja” vil korrigeringen sendes til beregning.";
  const bekreft = erAvbryt ? "Ja, avbryt" : "Ja, fullfør";
  const avbryt = erAvbryt ? "Nei, fortsett" : "Nei, avbryt";

  function handleBekreft() {
    if (!type) return;

    if (type === "fullfor") {
      fetcher.submit(
        { rapporteringsperiode: JSON.stringify(korrigertPeriode) },
        { method: "post", action: "/api/rapportering" }
      );
    }

    navigate(`/person/${person.ident}/perioder`);
  }

  return (
    <Modal open={open} onClose={onClose} header={{ heading: tittel }}>
      <Modal.Body>{tekst}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleBekreft} size="small">
          {bekreft}
        </Button>
        <Button variant="secondary" onClick={onClose} size="small">
          {avbryt}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
