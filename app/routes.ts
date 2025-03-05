import { type RouteConfig, route } from "@react-router/dev/routes";

const routes = [
  { file: "", path: "routes/index.tsx" },
  { file: "behandling", path: "routes/behandling.tsx" },
  { file: "behandling/:id", path: "routes/behandling.$id.tsx" },
  { file: "api/internal/isalive", path: "routes/api.internal.isalive.ts" },
  { file: "api/internal/isready", path: "routes/api.internal.isready.ts" },
];

if (process.env.NODE_ENV !== "development") {
  routes.map((route) => ({
    ...route,
    file: `/rapportering/${route.file}`,
  }));
}

export default routes.map((r) => route(r.file, r.path)) satisfies RouteConfig;
