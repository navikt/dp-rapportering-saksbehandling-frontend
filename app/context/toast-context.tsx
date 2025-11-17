import { createContext, useCallback, useContext, useState } from "react";
import { uuidv7 } from "uuidv7";

import { ToastContainer } from "~/components/toast/ToastContainer";

import type { ToastMessage } from "../components/toast/Toast";

interface ToastOptions {
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    variant: ToastMessage["variant"],
    title: string,
    message?: string,
    duration?: number,
  ) => void;
  showSuccess: (title: string, options?: string | ToastOptions) => void;
  showError: (title: string, options?: string | ToastOptions) => void;
  showInfo: (title: string, options?: string | ToastOptions) => void;
  showWarning: (title: string, options?: string | ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      variant: ToastMessage["variant"],
      title: string,
      message?: string,
      duration: number = 5000,
    ) => {
      const id = uuidv7();
      const newToast: ToastMessage = {
        id,
        variant,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    [],
  );

  const showSuccess = useCallback(
    (title: string, options?: string | ToastOptions) => {
      const { message, duration } =
        typeof options === "string" ? { message: options, duration: 5000 } : (options ?? {});
      showToast("success", title, message, duration);
    },
    [showToast],
  );

  const showError = useCallback(
    (title: string, options?: string | ToastOptions) => {
      const { message, duration } =
        typeof options === "string" ? { message: options, duration: 8000 } : (options ?? {});
      // Error toasts har lengre default varighet, men auto-lukkes ikke uansett
      showToast("error", title, message, duration ?? 8000);
    },
    [showToast],
  );

  const showInfo = useCallback(
    (title: string, options?: string | ToastOptions) => {
      const { message, duration } =
        typeof options === "string" ? { message: options, duration: 5000 } : (options ?? {});
      showToast("info", title, message, duration);
    },
    [showToast],
  );

  const showWarning = useCallback(
    (title: string, options?: string | ToastOptions) => {
      const { message, duration } =
        typeof options === "string" ? { message: options, duration: 5000 } : (options ?? {});
      showToast("warning", title, message, duration);
    },
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast må brukes innenfor ToastProvider");
  }
  return context;
}
