import { Dropdown, InternalHeader, Spacer } from "@navikt/ds-react";
import { useState } from "react";

import type { ISaksbehandler } from "~/utils/types";

import styles from "./header.module.css";

interface HeaderProps {
  saksbehandler: ISaksbehandler;
}

const Header = ({ saksbehandler }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Hopp til hovedinnhold
      </a>
      <InternalHeader role="banner" aria-label="Systemheader">
        <InternalHeader.Title href={"/"} aria-label="Gå til forsiden">
          Dagpenger
        </InternalHeader.Title>
        <Spacer />
        <Dropdown onOpenChange={setDropdownOpen}>
          <InternalHeader.UserButton
            name={saksbehandler.givenName}
            description={saksbehandler.onPremisesSamAccountName}
            as={Dropdown.Toggle}
            aria-label={`Brukermeny for ${saksbehandler.givenName}`}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          />
          <Dropdown.Menu role="menu" aria-label="Brukerhandlinger">
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item role="menuitem">
                <a href="/rapportering/oauth2/logout" aria-label="Logg ut av systemet">
                  Logg ut
                </a>
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
      </InternalHeader>
    </>
  );
};

export default Header;
