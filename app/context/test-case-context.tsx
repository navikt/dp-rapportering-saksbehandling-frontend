import type { PropsWithChildren } from "react";
import { createContext, useState } from "react";

import { TEST_CASE } from "~/utils/constants";
import type { TTestCase } from "~/utils/types";

interface ITestCaseContext {
  testCase: TTestCase;
  setTestCase: (sok: string) => void;
}

export const TestCaseContext = createContext<ITestCaseContext | undefined>(undefined);

export function TestCaseContextProvider({ children }: PropsWithChildren) {
  const [testCase, setTestCase] = useState<TTestCase>(TEST_CASE.STANDARD);

  return (
    <TestCaseContext.Provider
      value={{
        testCase,
        setTestCase,
      }}
    >
      {children}
    </TestCaseContext.Provider>
  );
}
