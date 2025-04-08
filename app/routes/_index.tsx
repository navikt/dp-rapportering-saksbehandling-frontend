import { Link, useLoaderData } from "react-router";

import { hentPersoner } from "~/models/person.server";
import { usesMsw } from "~/utils/env.utils";

import type { Route } from "../+types/root";

export async function loader({ request }: Route.LoaderArgs) {
  if (usesMsw) {
    const personer = await hentPersoner(request);
    return { personer };
  }

  return {};
}

export default function Rapportering() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      {data.personer && (
        <>
          <h1>Saksbehandlerflate for meldekort</h1>
          <p>Velkommen til demoversjonen! Du må velge en person:</p>
          <ul>
            {data.personer.map((person) => (
              <li key={person.ident}>
                <Link to={`/person/${person.ident}/perioder`}>
                  {`${person.fornavn} ${person.mellomnavn} ${person.etternavn}`}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
