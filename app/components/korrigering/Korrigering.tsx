import { Button, Textarea } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate, useRevalidator } from "react-router";

import type { IPerson, IRapporteringsperiode, ISaksbehandler } from "~/utils/types";

import { BekreftModal } from "../../modals/BekreftModal";
import { FyllUtTabell } from "../tabeller/FyllUtTabell";
import styles from "./Korrigering.module.css";
import {
  type IKorrigertDag,
  konverterTimerFraISO8601Varighet,
  konverterTimerTilISO8601Varighet,
} from "./korrigering.utils";

interface IProps {
  korrigertPeriode: IRapporteringsperiode;
  setKorrigertPeriode: React.Dispatch<React.SetStateAction<IRapporteringsperiode>>;
  originalPeriode: IRapporteringsperiode;
  person: IPerson;
  saksbehandler: ISaksbehandler;
}

export function Korrigering({
  originalPeriode,
  korrigertPeriode,
  setKorrigertPeriode,
  person,
  saksbehandler,
}: IProps) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [korrigerteDager, setKorrigerteDager] = useState<IKorrigertDag[]>(
    korrigertPeriode.dager.map(konverterTimerFraISO8601Varighet),
  );
  const [korrigertBegrunnelse, setKorrigertBegrunnelse] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"avbryt" | "fullfor" | null>(null);

  function openModal(type: "avbryt" | "fullfor") {
    setModalType(type);
    setModalOpen(true);
  }

  useEffect(() => {
    if (isSubmitting && fetcher.state === "idle" && fetcher.data) {
      const nyPeriodeId = fetcher.data?.id || korrigertPeriode.id;

      // Revalider data for å oppdatere listen
      revalidator.revalidate();

      navigate(`/person/${person.id}/perioder?updated=${nyPeriodeId}`);
      setIsSubmitting(false);
    }
  }, [
    fetcher.state,
    fetcher.data,
    navigate,
    person.id,
    isSubmitting,
    korrigertPeriode.id,
    revalidator,
  ]);

  function handleBekreft() {
    if (modalType === "fullfor") {
      setIsSubmitting(true);
      fetcher.submit(
        { rapporteringsperiode: JSON.stringify(korrigertPeriode) },
        { method: "post", action: "/api/rapportering" },
      );
    } else if (modalType === "avbryt") {
      navigate(`/person/${person.id}/perioder`);
    }
  }

  useEffect(() => {
    setKorrigertPeriode((prev) => ({
      ...prev,
      innsendtTidspunkt: new Date().toISOString(),
      dager: korrigerteDager.map(konverterTimerTilISO8601Varighet),
      korrigering: {
        korrigererMeldekortId: prev.id,
        begrunnelse: korrigertBegrunnelse,
      },
      kilde: {
        rolle: "Saksbehandler",
        ident: saksbehandler.onPremisesSamAccountName,
      },
    }));
  }, [korrigerteDager, korrigertBegrunnelse, saksbehandler]);

  const harEndringer =
    JSON.stringify(korrigertPeriode.dager) !== JSON.stringify(originalPeriode.dager);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (harEndringer || korrigertBegrunnelse.trim()) {
        event.preventDefault();
        event.returnValue = ""; // For moderne nettlesere
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [harEndringer, korrigertBegrunnelse]);

  return (
    <div className={styles.korrigering}>
      <div className={styles.rad}>
        <div className={styles.skjema}>
          <FyllUtTabell
            dager={korrigerteDager}
            setKorrigerteDager={setKorrigerteDager}
            periode={originalPeriode.periode}
          />
        </div>
        <div className={styles.begrunnelse}>
          <Textarea
            label="Begrunnelse:"
            placeholder="Obligatorisk"
            onChange={(event) => setKorrigertBegrunnelse(event.target.value)}
            className="korrigering-tekstfelt"
          ></Textarea>
        </div>
      </div>

      <div className={styles.knapper}>
        <Button variant="secondary" onClick={() => openModal("avbryt")} size="small">
          Avbryt korrigering
        </Button>
        <Button
          variant="primary"
          onClick={() => openModal("fullfor")}
          disabled={!korrigertBegrunnelse.trim() || !harEndringer}
          size="small"
        >
          Fullfør korrigering
        </Button>
      </div>
      <BekreftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        tittel={
          modalType === "avbryt"
            ? "Vil du avbryte korrigeringen?"
            : "Vil du fullføre korrigeringen?"
        }
        tekst={
          modalType === "avbryt"
            ? "Du er i ferd med å avbryte korrigeringen du har begynt på. Er du sikker på at du vil avbryte? Endringene du har gjort så langt vil ikke lagres."
            : 'Du er i ferd med å fullføre korrigeringen. Ved å trykke "Ja" vil korrigeringen sendes til beregning.'
        }
        bekreftTekst={modalType === "avbryt" ? "Ja, avbryt" : "Ja, fullfør"}
        avbrytTekst={modalType === "avbryt" ? "Nei, fortsett" : "Nei, avbryt"}
        onBekreft={handleBekreft}
      />
    </div>
  );
}
