import { Search } from "@navikt/ds-react";

import styles from "~/components/person-sok/PersokSok.module.css";

export function PersonSok() {
  return (
    <form className={styles.sokForm}>
      <input hidden={true} readOnly={true} name="_action" value="sok-person" />
      <Search
        hideLabel={false}
        size="small"
        label=""
        placeholder="Søk etter person"
        variant="secondary"
        clearButton
      />
    </form>
  );
}
