import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("rapportering/isalive", "routes/api.internal.isalive.ts"),
  route("rapportering/isready", "routes/api.internal.isready.ts"),
  route("rapportering/", "routes/home.tsx"),
] satisfies RouteConfig;
