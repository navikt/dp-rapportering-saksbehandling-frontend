import { index, route } from "@react-router/dev/routes";

const routes = [
  index("routes/index.tsx"),
  route("/bruker", "routes/bruker.tsx"),
  route("/bruker/:brukerId", "routes/bruker.$brukerid.tsx"),
  route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/api/internal/isready", "routes/api.internal.isready.ts"),
];

export default routes;
