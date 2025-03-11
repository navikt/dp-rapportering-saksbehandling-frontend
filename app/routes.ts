import { prefix, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  ...prefix("/rapportering", [
    route("/", "routes/index.tsx"),
    route("/behandling", "routes/behandling.tsx"),
    route("/behandling/:id", "routes/behandling.$id.tsx"),
    route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
    route("/api/internal/isready", "routes/api.internal.isready.ts"),
  ]),
] satisfies RouteConfig;

// if (process.env.NODE_ENV === "development") {
//   routes = routes.map((route) => ({
//     ...route,
//     path: route.path.replace(/^\/rapportering/, ""),
//   }));
// }

// export default routes.map(({ path, file }) => route(path, file)) satisfies RouteConfig;

// import type { RouteConfig } from "@react-router/dev/routes";
// import { flatRoutes } from "@react-router/fs-routes";

// export default [...(await flatRoutes())] satisfies RouteConfig;
