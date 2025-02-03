import { Dropdown, InternalHeader } from "@navikt/ds-react";
import styles from "./HeaderMeny.module.css";

interface IProps {
  saksbehandler: { givenName: string; onPremisesSamAccountName: string };
}

export function HeaderUtloggingMeny({ saksbehandler }: IProps) {
  return (
    <div className={styles.user}>
      <Dropdown>
        <InternalHeader.UserButton
          name={saksbehandler.givenName}
          description={saksbehandler.onPremisesSamAccountName}
          as={Dropdown.Toggle}
        />
        <Dropdown.Menu>
          <Dropdown.Menu.List>
            <Dropdown.Menu.List.Item>
              <a href="/saksbehandling/oauth2/logout">Logg ut</a>
            </Dropdown.Menu.List.Item>
          </Dropdown.Menu.List>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}
