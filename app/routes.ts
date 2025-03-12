import { prefix, route, type RouteConfig } from "@react-router/dev/routes";

const routes = [
  route("/", "routes/index.tsx"),
  route("/behandling", "routes/behandling.tsx"),
  route("/behandling/:id", "routes/behandling.$id.tsx"),
  route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/api/internal/isready", "routes/api.internal.isready.ts"),
];

const prefixedRoutes = [...prefix("/rapportering", routes)];

export default process.env.NODE_ENV === "development"
  ? routes
  : (prefixedRoutes satisfies RouteConfig);
