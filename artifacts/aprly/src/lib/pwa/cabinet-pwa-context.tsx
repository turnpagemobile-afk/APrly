import { createContext, useContext, type ReactNode } from "react";
import { useCabinetPwa } from "@/lib/pwa/use-cabinet-pwa";

type CabinetPwaContextValue = ReturnType<typeof useCabinetPwa>;

const CabinetPwaContext = createContext<CabinetPwaContextValue | null>(null);

export function CabinetPwaProvider({ children }: { children: ReactNode }) {
  const value = useCabinetPwa();
  return (
    <CabinetPwaContext.Provider value={value}>{children}</CabinetPwaContext.Provider>
  );
}

export function useCabinetPwaContext(): CabinetPwaContextValue {
  const ctx = useContext(CabinetPwaContext);
  if (!ctx) {
    throw new Error("useCabinetPwaContext must be used within CabinetPwaProvider");
  }
  return ctx;
}
