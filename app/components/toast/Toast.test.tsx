import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ToastMessage } from "./Toast";
import { Toast } from "./Toast";

describe("Toast", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    vi.clearAllTimers();
  });

  describe("Rendering", () => {
    it("skal vise toast med tittel", () => {
      const toast: ToastMessage = {
        id: "test-1",
        variant: "success",
        title: "Suksess!",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      expect(screen.getByRole("heading", { name: "Suksess!", level: 3 })).toBeInTheDocument();
    });

    it("skal vise toast med tittel og melding", () => {
      const toast: ToastMessage = {
        id: "test-2",
        variant: "info",
        title: "Info",
        message: "Dette er en infomelding",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      expect(screen.getByRole("heading", { name: "Info", level: 3 })).toBeInTheDocument();
      expect(screen.getByText("Dette er en infomelding")).toBeInTheDocument();
    });

    it("skal vise success variant med riktig Alert", () => {
      const toast: ToastMessage = {
        id: "test-3",
        variant: "success",
        title: "Vellykket",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const alert = container.querySelector(".aksel-alert--success");
      expect(alert).toBeInTheDocument();
    });

    it("skal vise error variant med riktig Alert", () => {
      const toast: ToastMessage = {
        id: "test-4",
        variant: "error",
        title: "Feil",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const alert = container.querySelector(".aksel-alert--error");
      expect(alert).toBeInTheDocument();
    });
  });

  describe("Auto-lukking", () => {
    it("skal auto-lukke success toast etter kort duration", async () => {
      const toast: ToastMessage = {
        id: "test-5",
        variant: "success",
        title: "Suksess",
        duration: 100, // Kort duration for test
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      // Vent på at onClose blir kalt
      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalledWith("test-5");
        },
        { timeout: 500 },
      );
    });

    it("skal auto-lukke info toast etter spesifisert duration", async () => {
      const toast: ToastMessage = {
        id: "test-6",
        variant: "info",
        title: "Info",
        duration: 100, // Kort duration for test
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      // Vent på at onClose blir kalt
      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalledWith("test-6");
        },
        { timeout: 500 },
      );
    });

    it("skal IKKE auto-lukke error toast", async () => {
      const toast: ToastMessage = {
        id: "test-7",
        variant: "error",
        title: "Feil",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      // Vent litt og verifiser at onClose IKKE blir kalt
      await new Promise((resolve) => setTimeout(resolve, 200));

      // onClose skal IKKE bli kalt
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Manuell lukking", () => {
    it("skal kunne lukkes manuelt via close-knapp", async () => {
      const user = userEvent.setup();

      const toast: ToastMessage = {
        id: "test-8",
        variant: "success",
        title: "Suksess",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: /lukk/i });
      await user.click(closeButton);

      // onClose skal kalles med exit animation delay (300ms)
      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalledWith("test-8");
        },
        { timeout: 500 },
      );
    });
  });

  describe("CorrelationId", () => {
    it("skal vise correlationId med copy-knapp når det finnes i meldingen", () => {
      const toast: ToastMessage = {
        id: "test-9",
        variant: "error",
        title: "Feil oppstod",
        message: "Noe gikk galt\n\nFeil-ID: abc-123-xyz",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      expect(screen.getByText("Noe gikk galt")).toBeInTheDocument();
      expect(screen.getByText(/Feil-ID: abc-123-xyz/)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /kopier/i })).toBeInTheDocument();
    });

    it("skal ikke vise copy-knapp når det ikke finnes correlationId", () => {
      const toast: ToastMessage = {
        id: "test-10",
        variant: "error",
        title: "Feil oppstod",
        message: "Noe gikk galt",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      expect(screen.getByText("Noe gikk galt")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /kopier/i })).not.toBeInTheDocument();
    });

    it("skal parse correlationId korrekt fra meldingen", () => {
      const toast: ToastMessage = {
        id: "test-11",
        variant: "error",
        title: "Feil",
        message: "Detaljert feilmelding\n\nFeil-ID: 550e8400-e29b-41d4-a716-446655440000",
      };

      render(<Toast toast={toast} onClose={mockOnClose} />);

      expect(screen.getByText("Detaljert feilmelding")).toBeInTheDocument();
      expect(screen.getByText(/Feil-ID: 550e8400-e29b-41d4-a716-446655440000/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("skal ha role='alert' for error toasts", () => {
      const toast: ToastMessage = {
        id: "test-12",
        variant: "error",
        title: "Feil",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const alert = container.querySelector("[role='alert']");
      expect(alert).toBeInTheDocument();
    });

    it("skal ha role='status' for success toasts", () => {
      const toast: ToastMessage = {
        id: "test-13",
        variant: "success",
        title: "Suksess",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const status = container.querySelector("[role='status']");
      expect(status).toBeInTheDocument();
    });

    it("skal ha role='status' for info toasts", () => {
      const toast: ToastMessage = {
        id: "test-14",
        variant: "info",
        title: "Info",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const status = container.querySelector("[role='status']");
      expect(status).toBeInTheDocument();
    });

    it("skal ha role='status' for warning toasts", () => {
      const toast: ToastMessage = {
        id: "test-15",
        variant: "warning",
        title: "Advarsel",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const status = container.querySelector("[role='status']");
      expect(status).toBeInTheDocument();
    });
  });

  describe("Multiline messages", () => {
    it("skal vise meldinger med linjeskift korrekt", () => {
      const toast: ToastMessage = {
        id: "test-16",
        variant: "info",
        title: "Info",
        message: "Linje 1\nLinje 2\nLinje 3",
      };

      const { container } = render(<Toast toast={toast} onClose={mockOnClose} />);

      const messageDiv = container.querySelector("div[style*='white-space']");
      expect(messageDiv).toBeInTheDocument();
      expect(messageDiv).toHaveStyle({ whiteSpace: "pre-line" });
    });
  });
});
