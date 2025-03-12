import { route } from "@react-router/dev/routes";

const routes = [
  route("/", "routes/index.tsx"),
  route("/behandling", "routes/behandling.tsx"),
  route("/behandling/:id", "routes/behandling.$id.tsx"),
  route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/api/internal/isready", "routes/api.internal.isready.ts"),
];

export default routes;
