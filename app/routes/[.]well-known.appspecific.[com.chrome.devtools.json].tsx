import path from "path";

import { getEnv } from "~/utils/env.utils";

// Denne route håndterer forespørselen om Chrome DevTools spesifikke innstillinger
export async function loader() {
  if (getEnv("IS_LOCALHOST")) {
    const projectRoot = path.resolve();
    const jsonData = {
      workspace: {
        root: projectRoot,
        uuid: "my-uuid-xxx",
      },
    };
    return Response.json(jsonData);
  }
}
