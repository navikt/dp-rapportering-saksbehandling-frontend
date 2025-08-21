import { Button, DatePicker, Textarea } from "@navikt/ds-react";
import classNames from "classnames";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate, useRevalidator } from "react-router";

import { MODAL_ACTION_TYPE } from "~/utils/constants";
import { DatoFormat, formatterDato } from "~/utils/dato.utils";
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
  const [korrigertMeldedato, setKorrigertMeldedato] = useState<Date | undefined>(
    originalPeriode.innsendtTidspunkt ? new Date(originalPeriode.innsendtTidspunkt) : undefined,
  );
  const [korrigertBegrunnelse, setKorrigertBegrunnelse] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);

  function openModal(type: string) {
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
    if (modalType === MODAL_ACTION_TYPE.FULLFOR) {
      setIsSubmitting(true);
      fetcher.submit(
        { rapporteringsperiode: JSON.stringify(korrigertPeriode) },
        { method: "post", action: "/api/rapportering" },
      );
    } else if (modalType === MODAL_ACTION_TYPE.AVBRYT) {
      navigate(`/person/${person.id}/perioder`);
    }
  }

  function handleDateSelect(date?: Date) {
    setKorrigertMeldedato(date);
  }

  useEffect(() => {
    setKorrigertPeriode((prev) => ({
      ...prev,
      innsendtTidspunkt: korrigertMeldedato
        ? format(korrigertMeldedato, "yyyy-MM-dd")
        : prev.innsendtTidspunkt,
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
  }, [korrigerteDager, korrigertBegrunnelse, korrigertMeldedato, saksbehandler]);

  const harEndringer =
    (korrigertMeldedato &&
      format(korrigertMeldedato, "yyyy-MM-dd") !== originalPeriode.innsendtTidspunkt) ||
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
        <DatePicker
          mode="single"
          selected={korrigertMeldedato}
          onSelect={handleDateSelect}
          defaultMonth={korrigertMeldedato}
          toDate={new Date()}
        >
          <DatePicker.Input
            label="Manuell meldedato"
            description="Ved behov for å korrigere meldedato"
            size="small"
            value={
              korrigertMeldedato
                ? formatterDato({
                    dato: korrigertMeldedato.toISOString(),
                    format: DatoFormat.Kort,
                  })
                : undefined
            }
          />
        </DatePicker>
        <div className={styles.begrunnelse}>
          <Textarea
            label="Begrunnelse:"
            placeholder="Obligatorisk"
            onChange={(event) => setKorrigertBegrunnelse(event.target.value)}
            className="korrigering-tekstfelt"
          ></Textarea>
        </div>
      </div>
      <div className={styles.rad}>
        <div className={styles.skjema}>
          <FyllUtTabell
            dager={korrigerteDager}
            setKorrigerteDager={setKorrigerteDager}
            periode={originalPeriode.periode}
          />
        </div>
      </div>
      <div className={classNames(styles.rad, styles.knapper)}>
        <Button
          variant="secondary"
          onClick={() => openModal(MODAL_ACTION_TYPE.AVBRYT)}
          size="small"
        >
          Avbryt korrigering
        </Button>
        <Button
          variant="primary"
          onClick={() => openModal(MODAL_ACTION_TYPE.FULLFOR)}
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
          modalType === MODAL_ACTION_TYPE.AVBRYT
            ? "Vil du avbryte korrigeringen?"
            : "Vil du fullføre korrigeringen?"
        }
        tekst={
          modalType === MODAL_ACTION_TYPE.AVBRYT ? (
            <>
              Hvis du avbryter, vil <strong>ikke</strong> endringene du har gjort så langt
              korrigeres
            </>
          ) : (
            "Ved å trykke “Ja” vil korrigeringen sendes inn."
          )
        }
        bekreftTekst={modalType === MODAL_ACTION_TYPE.AVBRYT ? "Ja, avbryt" : "Ja, fullfør"}
        avbrytTekst={modalType === MODAL_ACTION_TYPE.AVBRYT ? "Nei, fortsett" : "Nei, avbryt"}
        onBekreft={handleBekreft}
      />
    </div>
  );
}
