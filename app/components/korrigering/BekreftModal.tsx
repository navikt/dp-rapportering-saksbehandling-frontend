import { Button, Modal } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate, useRevalidator } from "react-router";

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
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isSubmitting && fetcher.state === "idle" && fetcher.data) {
      const nyPeriodeId = fetcher.data?.id || korrigertPeriode.id;

      // Revalider data for å oppdatere listen
      revalidator.revalidate();

      navigate(`/person/${person.ident}/perioder?updated=${nyPeriodeId}`);
      setIsSubmitting(false);
    }
  }, [
    fetcher.state,
    fetcher.data,
    navigate,
    person.ident,
    isSubmitting,
    korrigertPeriode.id,
    revalidator,
  ]);

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
      setIsSubmitting(true);
      onClose();
      fetcher.submit(
        { rapporteringsperiode: JSON.stringify(korrigertPeriode) },
        { method: "post", action: "/api/rapportering" }
      );
      // DON'T navigate here - let useEffect handle it
    } else if (type === "avbryt") {
      onClose();
      navigate(`/person/${person.ident}/perioder`);
    }
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
