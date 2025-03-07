// import { route, type RouteConfig } from "@react-router/dev/routes";

// const routes = [
//   { path: "/", file: "routes/index.tsx" },
//   { path: "/behandling", file: "routes/behandling.tsx" },
//   { path: "/behandling/:id", file: "routes/behandling.$id.tsx" },
//   { path: "/api/internal/isalive", file: "routes/api.internal.isalive.ts" },
//   { path: "/api/internal/isready", file: "routes/api.internal.isready.ts" },
// ];

// // if (process.env.NODE_ENV === "development") {
// //   routes = routes.map((route) => ({
// //     ...route,
// //     path: route.path.replace(/^\/rapportering/, ""),
// //   }));
// // }

// export default routes.map(({ path, file }) => route(path, file)) satisfies RouteConfig;

import type { RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [...(await flatRoutes())] satisfies RouteConfig;
