import { index, route } from "@react-router/dev/routes";

const routes = [
  index("routes/index.tsx"),
  route("/bruker", "routes/bruker.tsx"),
  route("/bruker/:id", "routes/bruker.$id.tsx"),
  route("/periode/:id", "routes/periode.$id.tsx"),
  route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/api/internal/isready", "routes/api.internal.isready.ts"),
];

export default routes;
