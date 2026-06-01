import { FaroErrorBoundary } from "@grafana/faro-react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <FaroErrorBoundary>
        <HydratedRouter />
      </FaroErrorBoundary>
    </StrictMode>,
  );
});
