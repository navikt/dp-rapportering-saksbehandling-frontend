import { Dropdown, InternalHeader, Spacer } from "@navikt/ds-react";

//import classNames from "classnames";
//import { NavLink } from "react-router";
import type { ISaksbehandler } from "~/utils/types";

//import styles from "./header.module.css";

interface HeaderProps {
  saksbehandler: ISaksbehandler; // Bruk riktig type hvis du har den
  antallOppgaverJegHarTilBehandling: number;
}

const Header = ({ saksbehandler }: HeaderProps) => {
  return (
    <InternalHeader>
      <InternalHeader.Title href={"/"}>Dagpenger</InternalHeader.Title>
      {/* 
      <nav className={styles.nav}>
        <ul className={styles.list}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                classNames(styles.link, { [styles.linkActive]: isActive })
              }
            >
              Oppgaver til behandling
            </NavLink>
          </li>
<li>
            <NavLink
              to="/mine-oppgaver"
              className={({ isActive }) =>
                classNames(styles.link, { [styles.linkActive]: isActive })
              }
            >
              Mine oppgaver
              {antallOppgaverJegHarTilBehandling > 0 && (
                <span className={styles.antallOppgaverTilBehandling}>
                  {antallOppgaverJegHarTilBehandling}
                </span>
              )}
            </NavLink>
          </li> 
          <li>
            <NavLink
              to="/alle-oppgaver"
              className={({ isActive }) =>
                classNames(styles.link, { [styles.linkActive]: isActive })
              }
            >
              Alle oppgaver
            </NavLink>
          </li>
        </ul>
      </nav>
      */}
      <Spacer />
      <Dropdown>
        <InternalHeader.UserButton
          name={saksbehandler.givenName}
          description={saksbehandler.onPremisesSamAccountName}
          as={Dropdown.Toggle}
        />
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item>
              <a href="/rapportering/oauth2/logout">Logg ut</a>
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </InternalHeader>
  );
};

export default Header;
