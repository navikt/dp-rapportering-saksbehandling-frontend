import { type RouteConfig, prefix, route } from "@react-router/dev/routes";

export default [
  ...prefix("rapportering", [
    route("", "routes/index.tsx"),
    route(":id", "routes/rapportering.$id.tsx"),
    route("isalive", "routes/api.internal.isalive.ts"),
    route("isready", "routes/api.internal.isready.ts"),
  ]),
] satisfies RouteConfig;
