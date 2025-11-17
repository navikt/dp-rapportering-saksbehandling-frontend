import { useDatepicker } from "@navikt/ds-react";
import { subDays } from "date-fns";
import { useReducer, useRef, useState } from "react";

import { useNavigationWarning } from "~/hooks/useNavigationWarning";
import { MELDEKORT_TYPE, MODAL_ACTION_TYPE } from "~/utils/constants";
import {
  harMinstEnGyldigAktivitet,
  type IKorrigertDag,
  type SetKorrigerteDager,
} from "~/utils/korrigering.utils";
import type { IValideringsFeil, IValideringsKontekst } from "~/utils/meldekort-validering.helpers";
import {
  fokuserPaForsteFeil,
  lagValideringsFeilmeldinger,
  skalViseArbeidssokerSporsmal,
  validerMeldekortSkjema,
} from "~/utils/meldekort-validering.helpers";
import type { IPeriode, IRapporteringsperiodeDag, TMeldekortType } from "~/utils/types";

export interface IMeldekortSkjemaSubmitData {
  meldedato: Date | undefined;
  registrertArbeidssoker?: boolean | null;
  begrunnelse: string;
  dager: IKorrigertDag[];
}

// Validation actions
type ValidationAction =
  | { type: "SET_ALL"; payload: IValideringsFeil }
  | { type: "CLEAR_MELDEDATO" }
  | { type: "CLEAR_ARBEIDSSOKER" }
  | { type: "CLEAR_BEGRUNNELSE" }
  | { type: "CLEAR_AKTIVITETER" };

function validationReducer(state: IValideringsFeil, action: ValidationAction): IValideringsFeil {
  switch (action.type) {
    case "SET_ALL":
      return action.payload;
    case "CLEAR_MELDEDATO":
      return { ...state, meldedato: false };
    case "CLEAR_ARBEIDSSOKER":
      return { ...state, arbeidssoker: false };
    case "CLEAR_BEGRUNNELSE":
      return { ...state, begrunnelse: false };
    case "CLEAR_AKTIVITETER":
      return { ...state, aktiviteter: false, aktiviteterType: undefined };
    default:
      return state;
  }
}

interface UseMeldekortSkjemaOptions {
  periode: { periode: IPeriode };
  dager: IKorrigertDag[];
  setKorrigerteDager: SetKorrigerteDager;
  onSubmit: (data: IMeldekortSkjemaSubmitData) => void;
  onCancel: () => void;
  initialMeldedato?: Date;
  initialBegrunnelse?: string;
  /** Om dette er en korrigering av eksisterende meldekort */
  isKorrigering?: boolean;
  /** Type meldekort fra backend (brukes for å sjekke om arbeidssøker-spørsmål skal vises) */
  meldekortType?: TMeldekortType;
  /** Originale data for sammenligning ved korrigering */
  originalData?: {
    meldedato: string | null;
    dager: IRapporteringsperiodeDag[];
  };
}

export function useMeldekortSkjema({
  periode,
  dager,
  setKorrigerteDager,
  onSubmit,
  onCancel,
  initialMeldedato,
  initialBegrunnelse = "",
  isKorrigering = false,
  meldekortType,
  originalData,
}: UseMeldekortSkjemaOptions) {
  // Saksbehandlerflaten er alltid true i denne konteksten
  const erSaksbehandlerFlate = true;

  // Bestem om arbeidssøker-feltet skal vises
  const visArbeidsokerSpm = skalViseArbeidssokerSporsmal(meldekortType, erSaksbehandlerFlate);

  // Bygg valideringskontekst
  const valideringsKontekst: IValideringsKontekst = {
    isKorrigering,
    showArbeidssokerField: visArbeidsokerSpm,
    originalData,
  };

  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const meldedatoRef = useRef<HTMLInputElement>(null);
  const arbeidssokerRef = useRef<HTMLInputElement>(null);
  const begrunnelseRef = useRef<HTMLTextAreaElement>(null);
  const aktiviteterRef = useRef<HTMLDivElement>(null);

  // State
  // For etterregistrerte meldekort, sett automatisk registrertArbeidssoker til true
  const initialRegistrertArbeidssoker =
    meldekortType === MELDEKORT_TYPE.ETTERREGISTRERT ? true : null;
  const [registrertArbeidssoker, setRegistrertArbeidssoker] = useState<boolean | null>(
    initialRegistrertArbeidssoker,
  );
  const [begrunnelse, setBegrunnelse] = useState<string>(initialBegrunnelse);
  const [valgtDato, setValgtDato] = useState<Date | undefined>(initialMeldedato);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [visValideringsfeil, dispatchValidation] = useReducer(validationReducer, {
    meldedato: false,
    arbeidssoker: false,
    begrunnelse: false,
    aktiviteter: false,
    aktiviteterType: undefined,
  });

  // Navigation warning
  const hasChanges =
    registrertArbeidssoker !== null || begrunnelse.trim() !== "" || valgtDato !== undefined;
  const { disableWarning } = useNavigationWarning({ hasChanges });

  // Date picker
  const { inputProps, datepickerProps } = useDatepicker({
    onDateChange: setValgtDato,
    defaultSelected: valgtDato,
    fromDate: subDays(new Date(periode.periode.tilOgMed), 1),
    defaultMonth: new Date(periode.periode.tilOgMed),
    inputFormat: "dd.MM.yyyy",
  });

  const handleMeldedatoBlur = () => {
    if (valgtDato && visValideringsfeil.meldedato) {
      dispatchValidation({ type: "CLEAR_MELDEDATO" });
    }
  };

  // Handlers
  const handleSetKorrigerteDager: SetKorrigerteDager = (nyeDager) => {
    setKorrigerteDager(nyeDager);
    if (typeof nyeDager !== "function") {
      const harGyldigeAktiviteter = harMinstEnGyldigAktivitet(nyeDager);
      if (harGyldigeAktiviteter && visValideringsfeil.aktiviteter) {
        dispatchValidation({ type: "CLEAR_AKTIVITETER" });
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
        // Kun send registrertArbeidssoker ved fyll-ut (når showArbeidssokerField er true)
        registrertArbeidssoker:
          visArbeidsokerSpm && registrertArbeidssoker !== null ? registrertArbeidssoker : undefined, // undefined = ikke send dette feltet
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

    // Bruk ny valideringslogikk
    const skjemaData = {
      meldedato: valgtDato ?? null,
      registrertArbeidssoker,
      begrunnelse,
      dager,
    };

    const feil = validerMeldekortSkjema(skjemaData, valideringsKontekst);

    dispatchValidation({ type: "SET_ALL", payload: feil });

    // Sjekk om det er noen feil
    const harFeil = Object.values(feil).some((harFeil) => harFeil);
    if (harFeil) {
      fokuserPaForsteFeil(feil, {
        meldedatoRef,
        arbeidssokerRef,
        begrunnelseRef,
        aktiviteterRef,
      });
      return;
    }

    openModal(MODAL_ACTION_TYPE.FULLFOR);
  };

  const handleBegrunnelseChange = (value: string) => {
    setBegrunnelse(value);
  };

  const handleBegrunnelseBlur = () => {
    if (begrunnelse.trim() !== "" && visValideringsfeil.begrunnelse) {
      dispatchValidation({ type: "CLEAR_BEGRUNNELSE" });
    }
  };

  const handleArbeidssokerChange = (value: boolean) => {
    setRegistrertArbeidssoker(value);
    // Fjern feil umiddelbart når bruker velger et svar
    if (visValideringsfeil.arbeidssoker) {
      dispatchValidation({ type: "CLEAR_ARBEIDSSOKER" });
    }
  };

  // Generer feilmeldinger basert på kontekst og aktiviteterType
  const baseFeilmeldinger = lagValideringsFeilmeldinger(valideringsKontekst);

  // Generer aktivitet-feilmelding basert på type
  let aktivitetFeilmelding = baseFeilmeldinger.aktiviteter;
  if (visValideringsfeil.aktiviteterType === "ugyldige-verdier") {
    aktivitetFeilmelding =
      "Du må rette opp ugyldige timer-verdier (minimum 0 timer, kun hele eller halve timer)";
  }

  const feilmeldinger = {
    meldedato: baseFeilmeldinger.meldedato,
    arbeidssoker: baseFeilmeldinger.arbeidssoker,
    begrunnelse: baseFeilmeldinger.begrunnelse,
    aktiviteter: aktivitetFeilmelding,
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
      showArbeidssokerField: visArbeidsokerSpm,
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
      handleBegrunnelseBlur,
      handleMeldedatoBlur,
      handleArbeidssokerChange,
      openModal,
      setModalOpen,
    },

    // Feilmeldinger basert på kontekst
    feilmeldinger,
  };
}
