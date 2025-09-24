import { useContext } from "react";

import { TestCaseContext } from "~/context/test-case-context";

export function useTestCase() {
  const context = useContext(TestCaseContext);

  if (!context) {
    throw new Error("useTestCase must be used within a TestCaseContextProvider");
  }

  return context;
}
