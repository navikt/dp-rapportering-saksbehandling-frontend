import { redirect } from "react-router";

import type { Route } from "./+types";

export async function loader({ params }: Route.LoaderArgs) {
  return redirect(`person/${params.personId}/perioder`);
}
