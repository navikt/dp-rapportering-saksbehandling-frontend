import { createContext, useContext, useRef } from "react";

interface NavigationWarningContextType {
  disableWarning: () => void;
  isDisabledRef: React.MutableRefObject<boolean>;
}

const NavigationWarningContext = createContext<NavigationWarningContextType | undefined>(undefined);

export function NavigationWarningProvider({ children }: { children: React.ReactNode }) {
  const isDisabledRef = useRef(false);

  const disableWarning = () => {
    isDisabledRef.current = true;
  };

  return (
    <NavigationWarningContext.Provider value={{ disableWarning, isDisabledRef }}>
      {children}
    </NavigationWarningContext.Provider>
  );
}

export function useNavigationWarningContext() {
  const context = useContext(NavigationWarningContext);
  if (!context) {
    throw new Error("useNavigationWarningContext må brukes innenfor NavigationWarningProvider");
  }
  return context;
}

export function useNavigationWarningContextOptional() {
  return useContext(NavigationWarningContext);
}
