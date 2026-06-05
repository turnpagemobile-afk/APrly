import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ForgotPasswordContextValue = {
  open: boolean;
  mountKey: string;
  openForgotPassword: () => void;
  closeForgotPassword: () => void;
};

const ForgotPasswordContext = createContext<ForgotPasswordContextValue | null>(null);

export function ForgotPasswordProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mountKey, setMountKey] = useState("forgot-password");

  const openForgotPassword = useCallback(() => {
    setMountKey(`forgot-password-${Date.now()}`);
    setOpen(true);
  }, []);

  const closeForgotPassword = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      open,
      mountKey,
      openForgotPassword,
      closeForgotPassword,
    }),
    [open, mountKey, openForgotPassword, closeForgotPassword],
  );

  return (
    <ForgotPasswordContext.Provider value={value}>{children}</ForgotPasswordContext.Provider>
  );
}

export function useForgotPasswordFlow(): ForgotPasswordContextValue {
  const ctx = useContext(ForgotPasswordContext);
  if (!ctx) {
    throw new Error("useForgotPasswordFlow must be used within ForgotPasswordProvider");
  }
  return ctx;
}
