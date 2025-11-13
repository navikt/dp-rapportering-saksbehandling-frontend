import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IMeldekortSkjemaSubmitData, useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { MODAL_ACTION_TYPE } from "~/utils/constants";
import type { IKorrigertDag, SetKorrigerteDager } from "~/utils/korrigering.utils";

// Mock navigation warning hook
vi.mock("~/hooks/useNavigationWarning", () => ({
  useNavigationWarning: () => ({ disableWarning: vi.fn() }),
}));

// Mock date-fns
vi.mock("date-fns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("date-fns")>();
  return {
    ...actual,
    format: vi.fn((date: Date, formatString: string) => {
      if (formatString === "yyyy-MM-dd") {
        return date.toISOString().split("T")[0];
      }
      return date.toISOString();
    }),
    subDays: (date: Date, days: number) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
  };
});

// Mock NAV DS datepicker
vi.mock("@navikt/ds-react", () => ({
  useDatepicker: (config: unknown) => {
    const typedConfig = config as { defaultSelected?: Date };
    return {
      inputProps: { value: typedConfig.defaultSelected?.toISOString().split("T")[0] || "" },
      datepickerProps: { selected: typedConfig.defaultSelected },
    };
  },
}));

describe("useMeldekortSkjema", () => {
  const mockPeriode = {
    periode: {
      fraOgMed: "2024-01-01",
      tilOgMed: "2024-01-14",
    },
  };

  const mockDager: IKorrigertDag[] = [
    {
      type: "dag",
      dagIndex: 0,
      dato: "2024-01-01",
      aktiviteter: [{ id: "1", type: "Arbeid", dato: "2024-01-01", timer: "8" }],
    },
  ];

  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;
  let mockSetKorrigerteDager: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();
    mockSetKorrigerteDager = vi.fn();
    vi.clearAllMocks();
  });

  const getDefaultProps = () => ({
    periode: mockPeriode,
    dager: mockDager,
    setKorrigerteDager: mockSetKorrigerteDager as SetKorrigerteDager,
    onSubmit: mockOnSubmit as (data: IMeldekortSkjemaSubmitData) => void,
    onCancel: mockOnCancel as () => void,
  });

  describe("initial state", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.state.registrertArbeidssoker).toBe(null);
      expect(result.current.state.begrunnelse).toBe("");
      expect(result.current.state.valgtDato).toBe(undefined);
      expect(result.current.state.modalOpen).toBe(false);
      expect(result.current.state.modalType).toBe(null);
      expect(result.current.state.hasChanges).toBe(false);
    });

    it("should initialize with provided initial values", () => {
      const initialDate = new Date("2024-01-15");
      const initialBegrunnelse = "Test begrunnelse";

      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          initialMeldedato: initialDate,
          initialBegrunnelse,
        }),
      );

      expect(result.current.state.valgtDato).toBe(initialDate);
      expect(result.current.state.begrunnelse).toBe(initialBegrunnelse);
    });
  });

  describe("validation", () => {
    it("should validate required fields on submit", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      act(() => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        result.current.handlers.handleSubmit(mockEvent);
      });

      expect(result.current.state.visValideringsfeil.meldedato).toBe(true);
      expect(result.current.state.visValideringsfeil.begrunnelse).toBe(true);
    });

    it("should validate arbeidssoker field when meldekortType is true", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          meldekortType: "Ordinaert", // Fyll-ut krever arbeidssoker
        }),
      );

      act(() => {
        result.current.handlers.handleBegrunnelseChange("Test begrunnelse");
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        result.current.handlers.handleSubmit(mockEvent);
      });

      expect(result.current.state.visValideringsfeil.arbeidssoker).toBe(true);
    });

    it("should NOT validate arbeidssoker field when meldekortType is false", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          isKorrigering: true, // Korrigering krever ikke arbeidssoker
        }),
      );

      act(() => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        result.current.handlers.handleSubmit(mockEvent);
      });

      expect(result.current.state.visValideringsfeil.arbeidssoker).toBe(false);
    });

    it("should remove validation errors when fields are corrected", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      // First trigger validation errors
      act(() => {
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        result.current.handlers.handleSubmit(mockEvent);
      });

      expect(result.current.state.visValideringsfeil.begrunnelse).toBe(true);

      // Then fix the begrunnelse
      act(() => {
        result.current.handlers.handleBegrunnelseChange("Test begrunnelse");
      });

      act(() => {
        result.current.handlers.handleBegrunnelseBlur();
      });

      expect(result.current.state.visValideringsfeil.begrunnelse).toBe(false);
    });
  });

  describe("handlers", () => {
    it("should handle begrunnelse change", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      act(() => {
        result.current.handlers.handleBegrunnelseChange("Ny begrunnelse");
      });

      expect(result.current.state.begrunnelse).toBe("Ny begrunnelse");
    });

    it("should handle arbeidssøker change", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      act(() => {
        result.current.handlers.handleArbeidssokerChange(true);
      });

      expect(result.current.state.registrertArbeidssoker).toBe(true);
    });

    it("should handle modal opening", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      act(() => {
        result.current.handlers.openModal(MODAL_ACTION_TYPE.FULLFOR);
      });

      expect(result.current.state.modalOpen).toBe(true);
      expect(result.current.state.modalType).toBe(MODAL_ACTION_TYPE.FULLFOR);
    });

    it("should handle cancel action", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      act(() => {
        const mockEvent = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        } as unknown as React.MouseEvent;
        result.current.handlers.handleAvbryt(mockEvent);
      });

      expect(result.current.state.modalOpen).toBe(true);
      expect(result.current.state.modalType).toBe(MODAL_ACTION_TYPE.AVBRYT);
    });
  });

  describe("modal workflow", () => {
    it("should call onCancel when confirming cancel action", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      // Set modal to cancel type
      act(() => {
        result.current.handlers.openModal(MODAL_ACTION_TYPE.AVBRYT);
      });

      // Confirm the cancel
      act(() => {
        result.current.handlers.handleBekreft();
      });

      expect(mockOnCancel).toHaveBeenCalled();
      expect(result.current.state.modalOpen).toBe(false);
    });

    it("should call onSubmit when confirming submit action", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      // Set some data
      act(() => {
        result.current.handlers.handleBegrunnelseChange("Test begrunnelse");
      });

      // Set modal to submit type
      act(() => {
        result.current.handlers.openModal(MODAL_ACTION_TYPE.FULLFOR);
      });

      // Confirm the submit
      act(() => {
        result.current.handlers.handleBekreft();
      });

      expect(mockOnSubmit).toHaveBeenCalledWith({
        meldedato: undefined,
        registrertArbeidssoker: undefined,
        begrunnelse: "Test begrunnelse",
        dager: mockDager,
      });
      expect(result.current.state.modalOpen).toBe(false);
    });

    describe("registrertArbeidssoker logikk", () => {
      it("should send registrertArbeidssoker when meldekortType is true", () => {
        const { result } = renderHook(() =>
          useMeldekortSkjema({
            ...getDefaultProps(),
            meldekortType: "Ordinaert", // Fyll-ut scenario
          }),
        );

        // Set påkrevde felter FØRST
        act(() => {
          result.current.handlers.handleArbeidssokerChange(true);
          result.current.handlers.handleBegrunnelseChange("Test begrunnelse");
        });

        // Åpne modal direkte uten å kalle handleSubmit først
        act(() => {
          result.current.handlers.openModal(MODAL_ACTION_TYPE.FULLFOR);
        });

        // Bekreft submission
        act(() => {
          result.current.handlers.handleBekreft();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith({
          meldedato: undefined,
          registrertArbeidssoker: true, // Sendes ved fyll-ut
          begrunnelse: "Test begrunnelse",
          dager: mockDager,
        });
      });

      it("should NOT send registrertArbeidssoker when isKorrigering is true", () => {
        const { result } = renderHook(() =>
          useMeldekortSkjema({
            ...getDefaultProps(),
            isKorrigering: true, // Korrigering scenario
          }),
        );

        // Set kun påkrevde felter for korrigering
        act(() => {
          result.current.handlers.handleBegrunnelseChange("Test begrunnelse");
        });

        // Åpne modal direkte uten å kalle handleSubmit først
        act(() => {
          result.current.handlers.openModal(MODAL_ACTION_TYPE.FULLFOR);
        });

        // Bekreft submission
        act(() => {
          result.current.handlers.handleBekreft();
        });

        expect(mockOnSubmit).toHaveBeenCalledWith({
          meldedato: undefined,
          registrertArbeidssoker: undefined, // IKKE sendt ved korrigering
          begrunnelse: "Test begrunnelse",
          dager: mockDager,
        });
      });
    });
  });

  describe("hasChanges detection", () => {
    it("should detect changes when registrertArbeidssoker is set", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.state.hasChanges).toBe(false);

      act(() => {
        result.current.handlers.handleArbeidssokerChange(true);
      });

      expect(result.current.state.hasChanges).toBe(true);
    });

    it("should detect changes when begrunnelse is not empty", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.state.hasChanges).toBe(false);

      act(() => {
        result.current.handlers.handleBegrunnelseChange("Test");
      });

      expect(result.current.state.hasChanges).toBe(true);
    });

    it("should detect changes when valgtDato is set", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.state.hasChanges).toBe(false);

      // Simulate date change through the datepicker (this would normally come from useDatepicker)
      act(() => {
        result.current.handlers.openModal(MODAL_ACTION_TYPE.FULLFOR);
      });

      // Since we can't directly set valgtDato (it's controlled by useDatepicker),
      // we test the logic indirectly through the initial values
      const { result: resultWithInitialDate } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          initialMeldedato: new Date("2024-01-15"),
        }),
      );

      expect(resultWithInitialDate.current.state.hasChanges).toBe(true);
    });
  });

  describe("validation state management", () => {
    it("should clear validation errors when fields are corrected", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          meldekortType: "Ordinaert",
        }),
      );

      // Trigger validation errors by submitting without required fields
      act(() => {
        result.current.handlers.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.state.visValideringsfeil.arbeidssoker).toBe(true);

      // Fix the error by selecting an option
      act(() => {
        result.current.handlers.handleArbeidssokerChange(true);
      });

      // Error should be cleared
      expect(result.current.state.visValideringsfeil.arbeidssoker).toBe(false);
    });
  });

  describe("refs", () => {
    it("should provide all necessary refs", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.refs.formRef.current).toBe(null); // Referanser er først null
      expect(result.current.refs.meldedatoRef.current).toBe(null);
      expect(result.current.refs.arbeidssokerRef.current).toBe(null);
      expect(result.current.refs.begrunnelseRef.current).toBe(null);
      expect(result.current.refs.aktiviteterRef.current).toBe(null);
    });
  });

  describe("datepicker integrasjon", () => {
    it("skal gi datepicker props", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.datepicker.inputProps).toBeDefined();
      expect(result.current.datepicker.datepickerProps).toBeDefined();
    });
  });

  describe("dynamiske feilmeldinger", () => {
    it("skal vise spesifikk feilmelding for ugyldige timer-verdier ved korrigering", () => {
      const dagerMedUgyldigTimer: IKorrigertDag[] = [
        {
          type: "dag",
          dagIndex: 0,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: "Arbeid", dato: "2024-01-01", timer: "0" }],
        },
      ];

      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          isKorrigering: true,
          dager: dagerMedUgyldigTimer,
          originalData: {
            meldedato: "2024-01-15",
            dager: [],
          },
        }),
      );

      // Submit form to trigger validation
      act(() => {
        result.current.handlers.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      // Should have aktiviteter error with ugyldige-verdier type
      expect(result.current.state.visValideringsfeil.aktiviteter).toBe(true);
      expect(result.current.state.visValideringsfeil.aktiviteterType).toBe("ugyldige-verdier");

      // Should show specific error message for invalid values
      expect(result.current.feilmeldinger.aktiviteter).toBe(
        "Du må rette opp ugyldige timer-verdier (minimum 0,5 timer, kun hele eller halve timer)",
      );
    });

    it("skal vise generisk feilmelding for ingen endringer ved korrigering", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          isKorrigering: true,
          dager: mockDager,
          originalData: {
            meldedato: "2024-01-15",
            dager: mockDager,
          },
        }),
      );

      // Submit form to trigger validation
      act(() => {
        result.current.handlers.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      // Should have aktiviteter error with ingen-endringer type
      expect(result.current.state.visValideringsfeil.aktiviteter).toBe(true);
      expect(result.current.state.visValideringsfeil.aktiviteterType).toBe("ingen-endringer");

      // Should show generic error message for no changes
      expect(result.current.feilmeldinger.aktiviteter).toBe(
        "Du må endre enten meldedato eller aktivitet for å kunne sende inn korrigering",
      );
    });

    it("skal vise spesifikk feilmelding for ugyldige timer-verdier ved fyll-ut", () => {
      const dagerMedUgyldigTimer: IKorrigertDag[] = [
        {
          type: "dag",
          dagIndex: 0,
          dato: "2024-01-01",
          aktiviteter: [{ id: "1", type: "Arbeid", dato: "2024-01-01", timer: "0" }],
        },
      ];

      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          isKorrigering: false,
          dager: dagerMedUgyldigTimer,
        }),
      );

      // Submit form to trigger validation
      act(() => {
        result.current.handlers.handleSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      // Should have aktiviteter error with ugyldige-verdier type
      expect(result.current.state.visValideringsfeil.aktiviteter).toBe(true);
      expect(result.current.state.visValideringsfeil.aktiviteterType).toBe("ugyldige-verdier");

      // Should show specific error message for invalid values
      expect(result.current.feilmeldinger.aktiviteter).toBe(
        "Du må rette opp ugyldige timer-verdier (minimum 0,5 timer, kun hele eller halve timer)",
      );
    });
  });
});
