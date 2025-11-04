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
import type { IValideringsKontekst } from "~/utils/meldekort-validering.helpers";
import {
  fokuserPaForsteFeil,
  lagValideringsFeilmeldinger,
  skalViseArbeidssokerSporsmal,
  validerMeldekortSkjema,
} from "~/utils/meldekort-validering.helpers";
import type { IPeriode, IRapporteringsperiodeDag } from "~/utils/types";

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
  /** @deprecated Bruk isKorrigering, meldekortType, og originalData i stedet */
  showArbeidssokerField?: boolean;
  initialMeldedato?: Date;
  initialBegrunnelse?: string;
  /** @deprecated Bruk isKorrigering og originalData i stedet */
  onValidateChanges?: (data: IMeldekortSkjemaSubmitData) => boolean;
  /** Om dette er en korrigering av eksisterende meldekort */
  isKorrigering?: boolean;
  /** Type meldekort fra backend (brukes for å sjekke om arbeidssøker-spørsmål skal vises)
   * TODO: Aktiver når backend har lagt til "etterregistrert" type i meldekortregister */
  meldekortType?: string;
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
  showArbeidssokerField = false,
  initialMeldedato,
  initialBegrunnelse = "",
  onValidateChanges,
  isKorrigering = false,
  meldekortType,
  originalData,
}: UseMeldekortSkjemaOptions) {
  // Saksbehandlerflaten er alltid true i denne konteksten
  const erSaksbehandlerFlate = true;

  // Bestem om arbeidssøker-feltet skal vises
  const showArbeidssokerFieldCalculated =
    showArbeidssokerField ?? skalViseArbeidssokerSporsmal(meldekortType, erSaksbehandlerFlate);

  // Bygg valideringskontekst
  const valideringsKontekst: IValideringsKontekst = {
    isKorrigering,
    showArbeidssokerField: showArbeidssokerFieldCalculated,
    originalData,
  };

  // Hent feilmeldinger basert på kontekst
  const feilmeldinger = lagValideringsFeilmeldinger(valideringsKontekst);
  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const meldedatoRef = useRef<HTMLInputElement>(null);
  const arbeidssokerRef = useRef<HTMLInputElement>(null);
  const begrunnelseRef = useRef<HTMLTextAreaElement>(null);
  const aktiviteterRef = useRef<HTMLDivElement>(null);

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
  const [visIngenEndringerFeil, setVisIngenEndringerFeil] = useState(false);

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
        // Kun send registrertArbeidssoker ved fyll-ut (når showArbeidssokerField er true)
        registrertArbeidssoker:
          showArbeidssokerFieldCalculated && registrertArbeidssoker !== null
            ? registrertArbeidssoker
            : undefined, // undefined = ikke send dette feltet
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

    const submitData = {
      meldedato: valgtDato,
      registrertArbeidssoker:
        showArbeidssokerFieldCalculated && registrertArbeidssoker !== null
          ? registrertArbeidssoker
          : undefined,
      begrunnelse,
      dager,
    };

    // Fallback til gammel validering hvis onValidateChanges er gitt (bakoverkompatibilitet)
    if (onValidateChanges && !onValidateChanges(submitData)) {
      setVisIngenEndringerFeil(true);
      return;
    }

    setVisIngenEndringerFeil(false);

    // Bruk ny valideringslogikk
    const skjemaData = {
      meldedato: valgtDato ?? null,
      registrertArbeidssoker,
      begrunnelse,
      dager,
    };

    const feil = validerMeldekortSkjema(skjemaData, valideringsKontekst);

    setVisValideringsfeil(feil);

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
    // Kun send registrertArbeidssoker hvis showArbeidssokerField er true (dvs. ved fyll-ut)
    registrertArbeidssoker:
      showArbeidssokerFieldCalculated && registrertArbeidssoker !== null
        ? registrertArbeidssoker.toString()
        : "", // Tom string når ikke relevant (korrigering) eller ikke svart
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
      visIngenEndringerFeil,
      hasChanges,
      showArbeidssokerField: showArbeidssokerFieldCalculated,
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

    // Feilmeldinger basert på kontekst
    feilmeldinger,
  };
}
