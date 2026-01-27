import { createClient } from "@sanity/client";

import { getEnv } from "~/utils/env.utils";

export const sanityClient = createClient({
  dataset: getEnv("SANITY_DATASETT"),
  projectId: "rt6o382n",
  useCdn: true,
  token: getEnv("SANITY_TOKEN") || "",
  apiVersion: "2022-03-07",
});
