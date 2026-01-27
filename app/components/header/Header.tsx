import { LeaveIcon, MoonIcon, SunIcon } from "@navikt/aksel-icons";
import { Button, Dropdown, InternalHeader, Spacer, Switch } from "@navikt/ds-react";
import { useState } from "react";
import { useRevalidator } from "react-router";

import { useSaksbehandler } from "~/hooks/useSaksbehandler";
import type { IMeldekortHeader } from "~/sanity/fellesKomponenter/header/types";
import type { ISaksbehandler } from "~/utils/types";

import styles from "./header.module.css";

interface HeaderProps {
  saksbehandler: ISaksbehandler;
  headerData: IMeldekortHeader | null | undefined;
}

const defaultHeaderData: IMeldekortHeader = {
  skipLink: "Hopp til hovedinnhold",
  systemHeaderAriaLabel: "Systemheader",
  homeLink: "Dagpenger",
  homeLinkAriaLabel: "Gå til forsiden",
  userButtonAriaLabel: "Brukermeny for {{name}}",
  dropdownAriaLabel: "Brukerhandlinger",
  sensitiveDataSwitchLabel: "Skjul sensitive opplysninger",
  sensitiveDataSwitchDescription: "Anbefales for økt sikkerhet",
  logoutLinkText: "Logg ut",
  darkThemeActive: "Mørkt tema aktivert. Klikk for å bytte til lyst tema",
  lightThemeActive: "Lyst tema aktivert. Klikk for å bytte til mørkt tema",
};

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

  const texts = { ...defaultHeaderData, ...(headerData ?? {}) };
  const userButtonAriaLabel = texts.userButtonAriaLabel.replace(
    "{{name}}",
    saksbehandler.givenName,
  );

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        {texts.skipLink}
      </a>
      <InternalHeader
        role="banner"
        aria-label={texts.systemHeaderAriaLabel}
        className={styles.header}
      >
        <InternalHeader.Title href={"/"} aria-label={texts.homeLinkAriaLabel}>
          {texts.homeLink}
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
            aria-label={texts.dropdownAriaLabel}
            className={styles.dropdownMenu}
          >
            <Dropdown.Menu.List>
              <Dropdown.Menu.List.Item>
                <Switch
                  checked={skjulSensitiveOpplysninger}
                  size="small"
                  onChange={(e) => handleSkjulSensitiveOpplysningerChange(e.target.checked)}
                  description={texts.sensitiveDataSwitchDescription}
                >
                  {texts.sensitiveDataSwitchLabel}
                </Switch>
              </Dropdown.Menu.List.Item>
              <Dropdown.Menu.List.Item role="menuitem">
                <a href="/oauth2/logout" aria-label="Logg ut av systemet" className={styles.loggUt}>
                  {texts.logoutLinkText} <LeaveIcon aria-hidden fontSize="1.5rem" />
                </a>
              </Dropdown.Menu.List.Item>
            </Dropdown.Menu.List>
          </Dropdown.Menu>
        </Dropdown>
        <Button
          variant="tertiary-neutral"
          size="medium"
          onClick={toggleTheme}
          aria-label={tema === "dark" ? texts.darkThemeActive : texts.lightThemeActive}
          aria-pressed={tema === "dark"}
          icon={tema === "dark" ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />}
        />
      </InternalHeader>
    </>
  );
};

export default Header;
