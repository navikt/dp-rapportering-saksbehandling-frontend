import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  route("", "routes/index.tsx"),
  ...prefix("rapportering/", [
    index("routes/rapportering.tsx"),
    route("isalive", "routes/api.internal.isalive.ts"),
    route("isready", "routes/api.internal.isready.ts"),
  ]),
] satisfies RouteConfig;
