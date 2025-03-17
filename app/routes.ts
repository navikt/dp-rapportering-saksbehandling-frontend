import { index, prefix, route } from "@react-router/dev/routes";

const routes = [
  index("routes/index.tsx"),
  ...prefix("person", [
    index("routes/person.tsx"),
    route(":personId", "routes/person.$personId.tsx"),
    route(":personId/perioder", "routes/person.$personId.perioder.tsx"),
    route(":personId/periode", "routes/person.$personId.periode.tsx"),
    route(":personId/periode/:periodeId", "routes/person.$personId.periode.$periodeId.tsx"),
  ]),
  route("/api/internal/isalive", "routes/api.internal.isalive.ts"),
  route("/api/internal/isready", "routes/api.internal.isready.ts"),
];

export default routes;
