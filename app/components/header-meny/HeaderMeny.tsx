import { NavLink } from "react-router";
import classnames from "classnames";

import { PersonSok } from "~/components/person-sok/PersonSok";
import { HeaderUtloggingMeny } from "~/components/header-meny/HeaderUtloggingMeny";
import styles from "~/components/header-meny/HeaderMeny.module.css";

interface IProps {
  saksbehandler: any; // Bruk riktig type hvis du har den
  antallOppgaverJegHarTilBehandling: number;
}

export function HeaderMeny({ saksbehandler, antallOppgaverJegHarTilBehandling }: IProps) {
  return (
    <div className={styles.container}>
      <div className={styles.linkContainer}>
        {/* <NavLink
          to="/"
          className={({ isActive }) =>
            classnames(styles.linkItem, { [styles.linkItemActive]: isActive })
          }
        >
          Oppgaver til behandling
        </NavLink> */}

        {/* <NavLink
          to="/mine-oppgaver"
          className={({ isActive }) =>
            classnames(styles.linkItem, { [styles.linkItemActive]: isActive })
          }
        >
          Mine oppgaver
          {antallOppgaverJegHarTilBehandling > 0 && (
            <span className={styles.antallOppgaverTilBehandling}>
              {antallOppgaverJegHarTilBehandling}
            </span>
          )}
        </NavLink> */}

        {/* <NavLink
          to="/alle-oppgaver"
          className={({ isActive }) =>
            classnames(styles.linkItem, { [styles.linkItemActive]: isActive })
          }
        >
          Alle oppgaver
        </NavLink> */}
      </div>

      <div className={styles.searchAndSaksbehandlerContainer}>
        <PersonSok />
        <HeaderUtloggingMeny saksbehandler={saksbehandler} />
      </div>
    </div>
  );
}
