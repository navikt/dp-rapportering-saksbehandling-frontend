import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("rapportering-saksbehandling-frontend/isalive", "routes/api.internal.isalive.ts"),
  route("rapportering-saksbehandling-frontend/isready", "routes/api.internal.isready.ts"),
  route("rapportering-saksbehandling-frontend/", "routes/home.tsx"),
] satisfies RouteConfig;
