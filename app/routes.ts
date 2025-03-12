import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
  route("", "routes/index.tsx"),
  ...prefix("rapportering", [
    index("routes/rapportering.tsx"),
    route("isalive", "routes/api.internal.isalive.ts"),
    route("isready", "routes/api.internal.isready.ts"),
    route("periode/:id", "routes/rapportering.periode.$id.tsx"),
    route(":id", "routes/rapportering.$id.tsx"),
  ]),
] satisfies RouteConfig;
