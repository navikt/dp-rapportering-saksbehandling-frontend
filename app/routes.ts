import { type RouteConfig, route } from "@react-router/dev/routes";

const routes = [
  { file: "/rapportering/", path: "routes/index.tsx" },
  { file: "/rapportering/behandling", path: "routes/behandling.tsx" },
  { file: "/rapportering/behandling/:id", path: "routes/behandling.$id.tsx" },
  { file: "/rapportering/api/internal/isalive", path: "routes/api.internal.isalive.ts" },
  { file: "/rapportering/api/internal/isready", path: "routes/api.internal.isready.ts" },
];

// if (process.env.NODE_ENV !== "development") {
//   routes.map((route) => ({
//     ...route,
//     file: `/rapportering/${route.file}`,
//   }));
// }

export default routes.map((r) => route(r.file, r.path)) satisfies RouteConfig;
