import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("isalive", "routes/api.internal.isalive.ts"),
  route("isready", "routes/api.internal.isready.ts"),
] satisfies RouteConfig;
