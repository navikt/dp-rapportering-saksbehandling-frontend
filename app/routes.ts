import { type RouteConfig, route } from "@react-router/dev/routes";

let routes = [
  { path: "/rapportering/", file: "routes/index.tsx" },
  { path: "/rapportering/behandling", file: "routes/behandling.tsx" },
  { path: "/rapportering/behandling/:id", file: "routes/behandling.$id.tsx" },
  { path: "/rapportering/api/internal/isalive", file: "routes/api.internal.isalive.ts" },
  { path: "/rapportering/api/internal/isready", file: "routes/api.internal.isready.ts" },
];

if (process.env.NODE_ENV === "development") {
  routes = routes.map((route) => ({
    ...route,
    path: route.path.replace(/^\/rapportering/, ""),
  }));
}

export default routes.map(({ path, file }) => route(path, file)) satisfies RouteConfig;
