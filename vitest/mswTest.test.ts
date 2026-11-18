import { afterEach, expect, test, vi } from "vitest";

import { mockPersons } from "~/mocks/data/mock-persons";
import { buildHistoryEvents } from "~/modals/historikk/historikk.utils";
import { getEnv } from "~/utils/env.utils";
import type { IArbeidssokerperiode, IRapporteringsperiode } from "~/utils/types";

afterEach(() => {
  vi.useRealTimers();
});

test("fetches user data", async () => {
  const response = await fetch(
    `${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${mockPersons[0].id}/meldekort`,
  );
  expect(response.status).toBe(200);
});

test.each(mockPersons.slice(0, 2))(
  "henter bare arbeidssøkerperiodene til $fornavn",
  async (person) => {
    const response = await fetch(
      `${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/${person.id}`,
    );
    const perioder: IArbeidssokerperiode[] = await response.json();

    expect(response.status).toBe(200);
    expect(perioder).toHaveLength(1);
    expect(perioder[0].ident).toBe(person.ident);
  },
);

test("returnerer tom liste for en person uten arbeidssøkerperioder", async () => {
  const response = await fetch(
    `${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/${mockPersons[2].id}`,
  );

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([]);
});

test("returnerer 404 for en ukjent person", async () => {
  const response = await fetch(`${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/ukjent`);

  expect(response.status).toBe(404);
});

test("Kari Utsatt har bare hendelser fra 2026 i november 2026", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-18T10:00:00Z"));
  const person = mockPersons[1];
  const headers = { Cookie: "sessionId=historikk-ett-aar" };

  const [arbeidssokerResponse, meldekortResponse] = await Promise.all([
    fetch(`${getEnv("DP_PERSONREGISTER_URL")}/arbeidssokerperioder/${person.id}`, { headers }),
    fetch(`${getEnv("DP_MELDEKORTREGISTER_URL")}/sb/person/${person.id}/meldekort`, { headers }),
  ]);
  expect(arbeidssokerResponse.status).toBe(200);
  expect(meldekortResponse.status).toBe(200);
  const arbeidssokerperioder: IArbeidssokerperiode[] = await arbeidssokerResponse.json();
  const meldekort: IRapporteringsperiode[] = await meldekortResponse.json();
  const hendelser = buildHistoryEvents(arbeidssokerperioder, meldekort);

  expect(hendelser.some((hendelse) => hendelse.kategori === "System")).toBe(true);
  expect(hendelser.some((hendelse) => hendelse.kategori === "Meldekort")).toBe(true);
  expect([...new Set(hendelser.map((hendelse) => hendelse.dato.getFullYear()))]).toEqual([2026]);
});
