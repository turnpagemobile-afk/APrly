import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ActivateAccountModal } from "@/components/dashboard/ActivateAccountModal";
import { WhyRecoveryProgramModal } from "@/components/dashboard/WhyRecoveryProgramModal";
import { DEFAULT_AUDIT_CHECKOUT_RETURN } from "@/lib/audit-checkout-return";
import type { StartCheckoutOptions } from "@/lib/use-audit-checkout";

type CabinetActivateContextValue = {
  openActivateModal: (returnPath?: string) => void;
  isCheckoutLoading: boolean;
};

const CabinetActivateContext = createContext<CabinetActivateContextValue | null>(null);

type CabinetActivateProviderProps = {
  children: ReactNode;
  startCheckout: (options?: StartCheckoutOptions) => void | Promise<void>;
  isCheckoutLoading?: boolean;
  defaultReturnPath?: string;
};

export function CabinetActivateProvider({
  children,
  startCheckout,
  isCheckoutLoading = false,
  defaultReturnPath = DEFAULT_AUDIT_CHECKOUT_RETURN,
}: CabinetActivateProviderProps) {
  const [activateOpen, setActivateOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [returnPath, setReturnPath] = useState(defaultReturnPath);

  const openActivateModal = useCallback(
    (path?: string) => {
      setReturnPath(path ?? defaultReturnPath);
      setActivateOpen(true);
    },
    [defaultReturnPath],
  );

  const onActivate = useCallback(() => {
    void startCheckout({ returnPath });
  }, [returnPath, startCheckout]);

  const value = useMemo(
    () => ({ openActivateModal, isCheckoutLoading }),
    [openActivateModal, isCheckoutLoading],
  );

  return (
    <CabinetActivateContext.Provider value={value}>
      {children}
      <ActivateAccountModal
        open={activateOpen}
        onOpenChange={setActivateOpen}
        onWhyClick={() => setWhyOpen(true)}
        onActivate={onActivate}
        isLoading={isCheckoutLoading}
      />
      <WhyRecoveryProgramModal open={whyOpen} onClose={() => setWhyOpen(false)} />
    </CabinetActivateContext.Provider>
  );
}

export function useCabinetActivate(): CabinetActivateContextValue {
  const ctx = useContext(CabinetActivateContext);
  if (!ctx) {
    throw new Error("useCabinetActivate must be used within CabinetActivateProvider");
  }
  return ctx;
}

/** Safe when provider is absent (e.g. tests). */
export function useCabinetActivateOptional(): CabinetActivateContextValue | null {
  return useContext(CabinetActivateContext);
}
