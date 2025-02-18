import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  route("", "routes/home.tsx"),
  ...prefix("rapportering/:id", [
    index("routes/index.tsx"),
    route("isalive", "routes/api.internal.isalive.ts"),
    route("isready", "routes/api.internal.isready.ts"),
  ]),
] satisfies RouteConfig;
