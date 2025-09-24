import { useRouteLoaderData } from "react-router";

import { RapporteringsperiodeListeByYear } from "~/components/rapporteringsperiode-liste/PeriodeListe";
import { useTestCase } from "~/hooks/useTestCase";
import styles from "~/route-styles/person.module.css";
import type { loader as personLoader } from "~/routes/person.$personId";
import { DEFAULT_PERSON, TEST_CASE } from "~/utils/constants";

import type { Route } from "./+types/person.$personId.perioder";

export default function Rapportering({ params }: Route.ComponentProps) {
  const data = useRouteLoaderData<typeof personLoader>("routes/person.$personId");
  const perioder = data?.perioder ?? [];
  const person = data?.person ?? DEFAULT_PERSON;

  const { setTestCase } = useTestCase();

  setTestCase(TEST_CASE.ALTERNATIVE_PERIODER);

  return (
    <div className={styles.rapporteringsperiodeListe}>
      <RapporteringsperiodeListeByYear
        perioder={perioder}
        personId={params.personId}
        ansvarligSystem={person.ansvarligSystem}
      />
    </div>
  );
}
