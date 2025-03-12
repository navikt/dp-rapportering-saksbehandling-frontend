import { index, route } from "@react-router/dev/routes";

const routes = [
  index("routes/index.tsx"),
  route("/person", "routes/person.tsx"),
  route("/person/:id", "routes/person.$id.tsx"),
  route("/periode/:id", "routes/periode.$id.tsx"),
  route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/api/internal/isready", "routes/api.internal.isready.ts"),
];

export default routes;
