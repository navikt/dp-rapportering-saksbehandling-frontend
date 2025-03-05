import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  route("/rapportering", "routes/index.tsx"),
  route("/rapportering/behandling", "routes/behandling.tsx"),
  route("/rapportering/behandling/:id", "routes/behandling.$id.tsx"),
  route("/rapportering/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/rapportering/api/internal/isready", "routes/api.internal.isready.ts"),
] satisfies RouteConfig;
