import { Button, DatePicker, Textarea } from "@navikt/ds-react";
import classNames from "classnames";
import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { useFetcher, useNavigate, useRevalidator } from "react-router";

import { useNavigationWarning } from "~/hooks/useNavigationWarning";
import { MODAL_ACTION_TYPE, RAPPORTERINGSPERIODE_STATUS } from "~/utils/constants";
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
    originalPeriode.meldedato ? new Date(originalPeriode.meldedato) : undefined,
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
      personId: person.id,
      status: RAPPORTERINGSPERIODE_STATUS.Innsendt,
      meldedato: korrigertMeldedato ? format(korrigertMeldedato, "yyyy-MM-dd") : prev.meldedato,
      dager: korrigerteDager.map(konverterTimerTilISO8601Varighet),
      begrunnelse: korrigertBegrunnelse,
      kilde: {
        rolle: "Saksbehandler",
        ident: saksbehandler.onPremisesSamAccountName,
      },
    }));
  }, [korrigerteDager, korrigertBegrunnelse, korrigertMeldedato, saksbehandler]);

  const harEndringer =
    (korrigertMeldedato &&
      format(korrigertMeldedato, "yyyy-MM-dd") !== originalPeriode.meldedato) ||
    JSON.stringify(korrigertPeriode.dager) !== JSON.stringify(originalPeriode.dager);

  const hasChanges = harEndringer || korrigertBegrunnelse.trim() !== "";
  useNavigationWarning({ hasChanges });

  return (
    <div className={styles.korrigering}>
      <div className={styles.rad}>
        <DatePicker
          mode="single"
          selected={korrigertMeldedato}
          onSelect={handleDateSelect}
          defaultMonth={korrigertMeldedato}
          toDate={new Date()}
          fromDate={subDays(originalPeriode.periode.tilOgMed, 1)}
        >
          <DatePicker.Input
            label="Sett meldedato"
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
            size="small"
            label="Begrunnelse"
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
