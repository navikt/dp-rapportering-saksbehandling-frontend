import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider, useToast } from "./toast-context";

// Test komponent som bruker useToast hook
function TestComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div>
      <button onClick={() => showSuccess("Suksess tittel")}>Vis suksess</button>
      <button onClick={() => showSuccess("Suksess med melding", "Dette er en melding")}>
        Vis suksess med melding
      </button>
      <button
        onClick={() => showSuccess("Suksess med options", { message: "Melding", duration: 3000 })}
      >
        Vis suksess med options
      </button>
      <button onClick={() => showError("Feil tittel")}>Vis feil</button>
      <button onClick={() => showError("Feil med melding", "Dette er en feilmelding")}>
        Vis feil med melding
      </button>
      <button onClick={() => showInfo("Info tittel")}>Vis info</button>
      <button onClick={() => showWarning("Advarsel tittel")}>Vis advarsel</button>
    </div>
  );
}

describe("ToastContext", () => {
  describe("useToast hook", () => {
    it("skal kaste feil når brukt utenfor ToastProvider", () => {
      // Forvent at rendering kaster feil
      expect(() => {
        render(<TestComponent />);
      }).toThrow("useToast må brukes innenfor ToastProvider");
    });

    it("skal ikke kaste feil når brukt innenfor ToastProvider", () => {
      expect(() => {
        render(
          <ToastProvider>
            <TestComponent />
          </ToastProvider>,
        );
      }).not.toThrow();
    });
  });

  describe("showSuccess", () => {
    it("skal vise success toast med bare tittel", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis suksess" });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Suksess tittel", level: 3 }),
        ).toBeInTheDocument();
      });
    });

    it("skal vise success toast med tittel og melding (string)", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis suksess med melding" });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Suksess med melding", level: 3 }),
        ).toBeInTheDocument();
        expect(screen.getByText("Dette er en melding")).toBeInTheDocument();
      });
    });

    it("skal vise success toast med options object", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis suksess med options" });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Suksess med options", level: 3 }),
        ).toBeInTheDocument();
        expect(screen.getByText("Melding")).toBeInTheDocument();
      });
    });
  });

  describe("showError", () => {
    it("skal vise error toast med bare tittel", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis feil" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Feil tittel", level: 3 })).toBeInTheDocument();
      });
    });

    it("skal vise error toast med tittel og melding", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis feil med melding" });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Feil med melding", level: 3 }),
        ).toBeInTheDocument();
        expect(screen.getByText("Dette er en feilmelding")).toBeInTheDocument();
      });
    });
  });

  describe("showInfo", () => {
    it("skal vise info toast", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis info" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Info tittel", level: 3 })).toBeInTheDocument();
      });
    });
  });

  describe("showWarning", () => {
    it("skal vise warning toast", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis advarsel" });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Advarsel tittel", level: 3 }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Multiple toasts", () => {
    it("skal kunne vise flere toasts samtidig", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      // Klikk flere knapper
      await user.click(screen.getByRole("button", { name: "Vis suksess" }));
      await user.click(screen.getByRole("button", { name: "Vis feil" }));
      await user.click(screen.getByRole("button", { name: "Vis info" }));

      // Alle tre toasts skal vises samtidig
      await waitFor(() => {
        expect(
          screen.getByRole("heading", { name: "Suksess tittel", level: 3 }),
        ).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Feil tittel", level: 3 })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Info tittel", level: 3 })).toBeInTheDocument();
      });
    });
  });

  describe("Toast closing", () => {
    it("skal kunne lukke toast manuelt", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis info" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Info tittel", level: 3 })).toBeInTheDocument();
      });

      // Finn og klikk close-knapp
      const closeButtons = screen.getAllByRole("button", { name: /lukk/i });
      await user.click(closeButtons[0]);

      // Toast skal forsvinne
      await waitFor(
        () => {
          expect(
            screen.queryByRole("heading", { name: "Info tittel", level: 3 }),
          ).not.toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });

    it("skal IKKE auto-lukke error toast", async () => {
      const user = userEvent.setup();

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>,
      );

      const button = screen.getByRole("button", { name: "Vis feil" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Feil tittel", level: 3 })).toBeInTheDocument();
      });

      // Vent litt og verifiser at toast fortsatt er synlig
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Toast skal fortsatt være synlig
      expect(screen.getByRole("heading", { name: "Feil tittel", level: 3 })).toBeInTheDocument();
    });
  });
});
