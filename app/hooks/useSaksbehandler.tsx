import { useContext } from "react";

import { SaksbehandlerContext } from "~/context/saksbehandler-context";

export function useSaksbehandler() {
  const context = useContext(SaksbehandlerContext);
  if (!context) {
    throw new Error("useSaksbehandler must be used within an SaksbehandlerProvider");
  }
  return context;
}
