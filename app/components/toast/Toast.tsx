import { Alert, CopyButton, Heading } from "@navikt/ds-react";
import { useEffect, useState } from "react";

import styles from "./toast.module.css";

export interface ToastMessage {
  id: string;
  variant: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Error toasts skal ikke auto-lukkes
    if (toast.variant === "error") {
      return;
    }

    const duration = toast.duration ?? 5000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.variant]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Match animation duration
  };

  // Sjekk om meldingen inneholder correlationId
  const correlationIdMatch = toast.message?.match(/Feil-ID:\s*([a-zA-Z0-9-]+)/);
  const correlationId = correlationIdMatch ? correlationIdMatch[1] : null;

  // Hvis vi har correlationId, fjern den fra meldingsteksten
  const messageWithoutId = correlationId
    ? toast.message?.replace(/\n\nFeil-ID:\s*[a-zA-Z0-9-]+/, "")
    : toast.message;

  return (
    <div className={`${styles.toast} ${isExiting ? styles.toastExit : styles.toastEnter}`}>
      <Alert
        variant={toast.variant}
        closeButton
        onClose={handleClose}
        size="small"
        role={toast.variant === "error" ? "alert" : "status"}
      >
        <Heading spacing size="xsmall" level="3">
          {toast.title}
        </Heading>
        <div style={{ whiteSpace: "pre-line" }}>{messageWithoutId}</div>
        {correlationId && (
          <div
            style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span>Feil-ID: {correlationId}</span>
            <CopyButton copyText={correlationId} size="small" />
          </div>
        )}
      </Alert>
    </div>
  );
}
