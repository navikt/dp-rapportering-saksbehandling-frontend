import groq from "groq";

export const headerQuery = groq`*[_type == "meldekortHeader"][0]{
  skipLink,
  systemHeaderAriaLabel,
  homeLink,
  homeLinkAriaLabel,
  userButtonAriaLabel,
  dropdownAriaLabel,
  sensitiveDataSwitchLabel,
  sensitiveDataSwitchDescription,
  logoutLinkText,
  darkThemeActive,
  lightThemeActive
}`;
