import { useDatepicker } from "@navikt/ds-react";
import { format, subDays } from "date-fns";
import { useRef, useState } from "react";

import { useNavigationWarning } from "~/hooks/useNavigationWarning";
import { MODAL_ACTION_TYPE } from "~/utils/constants";
import {
  harMinstEnGyldigAktivitet,
  type IKorrigertDag,
  type SetKorrigerteDager,
} from "~/utils/korrigering.utils";
import type { IPeriode } from "~/utils/types";

export interface IMeldekortSkjemaSubmitData {
  meldedato: Date | undefined;
  registrertArbeidssoker?: boolean | null;
  begrunnelse: string;
  dager: IKorrigertDag[];
}

interface UseMeldekortSkjemaOptions {
  periode: { periode: IPeriode };
  dager: IKorrigertDag[];
  setKorrigerteDager: SetKorrigerteDager;
  onSubmit: (data: IMeldekortSkjemaSubmitData) => void;
  onCancel: () => void;
  showArbeidssokerField?: boolean;
  initialMeldedato?: Date;
  initialBegrunnelse?: string;
}

export function useMeldekortSkjema({
  periode,
  dager,
  setKorrigerteDager,
  onSubmit,
  onCancel,
  showArbeidssokerField = false,
  initialMeldedato,
  initialBegrunnelse = "",
}: UseMeldekortSkjemaOptions) {
  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const meldedatoRef = useRef<HTMLInputElement>(null);
  const arbeidssokerRef = useRef<HTMLInputElement>(null);
  const begrunnelseRef = useRef<HTMLTextAreaElement>(null);
  const aktiviteterRef = useRef<HTMLElement>(null);

  // State
  const [registrertArbeidssoker, setRegistrertArbeidssoker] = useState<boolean | null>(null);
  const [begrunnelse, setBegrunnelse] = useState<string>(initialBegrunnelse);
  const [valgtDato, setValgtDato] = useState<Date | undefined>(initialMeldedato);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [visValideringsfeil, setVisValideringsfeil] = useState({
    meldedato: false,
    arbeidssoker: false,
    begrunnelse: false,
    aktiviteter: false,
  });

  // Navigation warning
  const hasChanges =
    registrertArbeidssoker !== null || begrunnelse.trim() !== "" || valgtDato !== undefined;
  const { disableWarning } = useNavigationWarning({ hasChanges });

  // Date picker
  const { inputProps, datepickerProps } = useDatepicker({
    onDateChange: (date) => {
      setValgtDato(date);
      if (date && visValideringsfeil.meldedato) {
        setVisValideringsfeil((prev) => ({ ...prev, meldedato: false }));
      }
    },
    defaultSelected: valgtDato,
    fromDate: subDays(new Date(periode.periode.tilOgMed), 1),
    inputFormat: "dd.MM.yyyy",
  });

  // Handlers
  const handleSetKorrigerteDager: SetKorrigerteDager = (nyeDager) => {
    setKorrigerteDager(nyeDager);
    if (typeof nyeDager !== "function") {
      const harGyldigeAktiviteter = harMinstEnGyldigAktivitet(nyeDager);
      if (harGyldigeAktiviteter && visValideringsfeil.aktiviteter) {
        setVisValideringsfeil((prev) => ({ ...prev, aktiviteter: false }));
      }
    }
  };

  const openModal = (type: string) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleBekreft = () => {
    if (modalType === MODAL_ACTION_TYPE.AVBRYT) {
      disableWarning();
      onCancel();
    } else if (modalType === MODAL_ACTION_TYPE.FULLFOR) {
      disableWarning();
      onSubmit({
        meldedato: valgtDato,
        registrertArbeidssoker: showArbeidssokerField ? registrertArbeidssoker : undefined,
        begrunnelse,
        dager,
      });
    }
    setModalOpen(false);
  };

  const handleAvbryt = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(MODAL_ACTION_TYPE.AVBRYT);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const harGyldigeAktiviteter = harMinstEnGyldigAktivitet(dager);

    const feil = {
      meldedato: !valgtDato,
      arbeidssoker: showArbeidssokerField && registrertArbeidssoker === null,
      begrunnelse: begrunnelse.trim() === "",
      aktiviteter: !harGyldigeAktiviteter,
    };

    setVisValideringsfeil(feil);

    // Focus på første feil
    if (feil.meldedato) {
      meldedatoRef.current?.focus();
      return;
    }
    if (feil.arbeidssoker) {
      arbeidssokerRef.current?.focus();
      return;
    }
    if (feil.begrunnelse) {
      begrunnelseRef.current?.focus();
      return;
    }
    if (feil.aktiviteter) {
      aktiviteterRef.current?.focus();
      return;
    }

    openModal(MODAL_ACTION_TYPE.FULLFOR);
  };

  const handleBegrunnelseChange = (value: string) => {
    setBegrunnelse(value);
    if (value.trim() !== "" && visValideringsfeil.begrunnelse) {
      setVisValideringsfeil((prev) => ({ ...prev, begrunnelse: false }));
    }
  };

  const handleArbeidssokerChange = (value: boolean) => {
    setRegistrertArbeidssoker(value);
    if (visValideringsfeil.arbeidssoker) {
      setVisValideringsfeil((prev) => ({ ...prev, arbeidssoker: false }));
    }
  };

  // Hidden form values
  const hiddenFormValues = {
    meldedato: valgtDato ? format(valgtDato, "yyyy-MM-dd") : "",
    registrertArbeidssoker: registrertArbeidssoker?.toString() || "",
    begrunnelse,
    dager: JSON.stringify(dager),
  };

  return {
    // Refs
    refs: {
      formRef,
      meldedatoRef,
      arbeidssokerRef,
      begrunnelseRef,
      aktiviteterRef,
    },

    // State
    state: {
      registrertArbeidssoker,
      begrunnelse,
      valgtDato,
      modalOpen,
      modalType,
      visValideringsfeil,
      hasChanges,
    },

    // Date picker props
    datepicker: {
      inputProps,
      datepickerProps,
    },

    // Handlers
    handlers: {
      handleSetKorrigerteDager,
      handleSubmit,
      handleAvbryt,
      handleBekreft,
      handleBegrunnelseChange,
      handleArbeidssokerChange,
      openModal,
      setModalOpen,
    },

    // Form values
    hiddenFormValues,
  };
}
