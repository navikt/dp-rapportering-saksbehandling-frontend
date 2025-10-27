import { LeaveIcon } from "@navikt/aksel-icons";
import { Dropdown, InternalHeader, Spacer, Switch } from "@navikt/ds-react";
import { useState } from "react";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";
import type { ISaksbehandler } from "~/utils/types";

import styles from "./header.module.css";

interface HeaderProps {
  saksbehandler: ISaksbehandler;
}

const Header = ({ saksbehandler }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { skjulSensitiveOpplysninger, setSkjulSensitiveOpplysninger } = useSaksbehandler();

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Hopp til hovedinnhold
      </a>
      <InternalHeader role="banner" aria-label="Systemheader" className={styles.header}>
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
          <Dropdown.Menu role="menu" aria-label="Brukerhandlinger" className={styles.dropdownMenu}>
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item>
                <Switch
                  checked={skjulSensitiveOpplysninger}
                  size="small"
                  onChange={(e) => setSkjulSensitiveOpplysninger(e.target.checked)}
                  description="Anbefales for økt sikkerhet"
                >
                  Skjul sensitive opplysninger
                </Switch>
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item role="menuitem">
                <a href="/oauth2/logout" aria-label="Logg ut av systemet" className={styles.loggUt}>
                  Logg ut <LeaveIcon aria-hidden fontSize="1.5rem" />
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
