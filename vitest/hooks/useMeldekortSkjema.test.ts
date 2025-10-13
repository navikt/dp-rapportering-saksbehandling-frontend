import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMeldekortSkjema } from "~/hooks/useMeldekortSkjema";
import { MODAL_ACTION_TYPE } from "~/utils/constants";
import type { IKorrigertDag } from "~/utils/korrigering.utils";

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
    setKorrigerteDager: mockSetKorrigerteDager,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
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

    it("should validate arbeidssoker field when showArbeidssokerField is true", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          showArbeidssokerField: true, // Fyll-ut krever arbeidssoker
        }),
      );

      act(() => {
        result.current.handlers.handleBegrunnelseChange("Test begrunnelse");
        const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
        result.current.handlers.handleSubmit(mockEvent);
      });

      expect(result.current.state.visValideringsfeil.arbeidssoker).toBe(true);
    });

    it("should NOT validate arbeidssoker field when showArbeidssokerField is false", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          showArbeidssokerField: false, // Korrigering krever ikke arbeidssoker
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
      it("should send registrertArbeidssoker when showArbeidssokerField is true", () => {
        const { result } = renderHook(() =>
          useMeldekortSkjema({
            ...getDefaultProps(),
            showArbeidssokerField: true, // Fyll-ut scenario
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

      it("should NOT send registrertArbeidssoker when showArbeidssokerField is false", () => {
        const { result } = renderHook(() =>
          useMeldekortSkjema({
            ...getDefaultProps(),
            showArbeidssokerField: false, // Korrigering scenario
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

  describe("hiddenFormValues", () => {
    it("should return correct hidden form values", () => {
      const testDate = new Date("2024-01-15");
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          initialMeldedato: testDate,
          initialBegrunnelse: "Test begrunnelse",
          showArbeidssokerField: true,
        }),
      );

      act(() => {
        result.current.handlers.handleArbeidssokerChange(true);
      });

      expect(result.current.hiddenFormValues.meldedato).toBe("2024-01-15");
      expect(result.current.hiddenFormValues.registrertArbeidssoker).toBe("true");
      expect(result.current.hiddenFormValues.begrunnelse).toBe("Test begrunnelse");
      expect(result.current.hiddenFormValues.dager).toBe(JSON.stringify(mockDager));
    });

    it("should handle empty date correctly", () => {
      const { result } = renderHook(() => useMeldekortSkjema(getDefaultProps()));

      expect(result.current.hiddenFormValues.meldedato).toBe("");
    });

    it("should return empty string for registrertArbeidssoker when showArbeidssokerField is false", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          showArbeidssokerField: false, // Korrigering
        }),
      );

      expect(result.current.hiddenFormValues.registrertArbeidssoker).toBe("");
    });

    it("should return boolean string for registrertArbeidssoker when showArbeidssokerField is true", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          showArbeidssokerField: true, // Fyll-ut
        }),
      );

      act(() => {
        result.current.handlers.handleArbeidssokerChange(true);
      });

      expect(result.current.hiddenFormValues.registrertArbeidssoker).toBe("true");
    });

    it("should return empty string when registrertArbeidssoker is null", () => {
      const { result } = renderHook(() =>
        useMeldekortSkjema({
          ...getDefaultProps(),
          showArbeidssokerField: true, // Selv ved fyll-ut, før bruker svarer
        }),
      );

      // registrertArbeidssoker starter som null
      expect(result.current.hiddenFormValues.registrertArbeidssoker).toBe("");
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
});
