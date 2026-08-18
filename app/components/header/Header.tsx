import { LeaveIcon, MoonIcon, SunIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, InternalHeader, Spacer, Switch } from "@navikt/ds-react";
import { useState } from "react";
import { useRevalidator } from "react-router";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";
import type { IMeldekortHeader } from "~/sanity/fellesKomponenter/header/types";
import { sanityTekst } from "~/sanity/utils";
import type { ISaksbehandler } from "~/utils/types";

import styles from "./header.module.css";

interface HeaderProps {
  saksbehandler: ISaksbehandler;
  headerData: IMeldekortHeader | null | undefined;
}

const Header = ({ saksbehandler, headerData }: HeaderProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { skjulSensitiveOpplysninger, setSkjulSensitiveOpplysninger, tema, setTema } =
    useSaksbehandler();
  const revalidator = useRevalidator();

  const toggleTheme = () => {
    setTema(tema === "dark" ? "light" : "dark");
  };

  const handleSkjulSensitiveOpplysningerChange = (checked: boolean) => {
    setSkjulSensitiveOpplysninger(checked);
    // Revalider data fra serveren for å få nye maskerte/umaskerte data
    revalidator.revalidate();
  };

  const userButtonAriaLabel = sanityTekst(
    headerData?.userButtonAriaLabel,
    "header.userButtonAriaLabel",
  ).replace("{{name}}", saksbehandler.givenName);

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        {sanityTekst(headerData?.skipLink, "header.skipLink")}
      </a>
      <InternalHeader
        role="banner"
        aria-label={sanityTekst(headerData?.systemHeaderAriaLabel, "header.systemHeaderAriaLabel")}
        className={styles.header}
      >
        <InternalHeader.Title
          href={"/"}
          aria-label={sanityTekst(headerData?.homeLinkAriaLabel, "header.homeLinkAriaLabel")}
        >
          {sanityTekst(headerData?.homeLink, "header.homeLink")}
        </InternalHeader.Title>
        <Spacer />
        <Dropdown onOpenChange={setDropdownOpen}>
          <InternalHeader.UserButton
            name={saksbehandler.givenName}
            description={saksbehandler.onPremisesSamAccountName}
            as={Dropdown.Toggle}
            aria-label={userButtonAriaLabel}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          />
          <Dropdown.Menu
            role="menu"
            aria-label={sanityTekst(headerData?.dropdownAriaLabel, "header.dropdownAriaLabel")}
            className={styles.dropdownMenu}
          >
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item>
                <Switch
                  checked={skjulSensitiveOpplysninger}
                  size="small"
                  onChange={(e) => handleSkjulSensitiveOpplysningerChange(e.target.checked)}
                  description={sanityTekst(
                    headerData?.sensitiveDataSwitchDescription,
                    "header.sensitiveDataSwitchDescription",
                  )}
                >
                  {sanityTekst(
                    headerData?.sensitiveDataSwitchLabel,
                    "header.sensitiveDataSwitchLabel",
                  )}
                </Switch>
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item role="menuitem">
                <a href="/oauth2/logout" aria-label="Logg ut av systemet" className={styles.loggUt}>
                  {sanityTekst(headerData?.logoutLinkText, "header.logoutLinkText")}{" "}
                  <LeaveIcon aria-hidden fontSize="1.5rem" />
                </a>
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
        <Button
          data-color="neutral"
          variant="tertiary"
          size="medium"
          onClick={toggleTheme}
          aria-label={
            tema === "dark"
              ? sanityTekst(headerData?.darkThemeActive, "header.darkThemeActive")
              : sanityTekst(headerData?.lightThemeActive, "header.lightThemeActive")
          }
          aria-pressed={tema === "dark"}
          icon={tema === "dark" ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />}
        />
      </InternalHeader>
    </>
  );
};

export default Header;
