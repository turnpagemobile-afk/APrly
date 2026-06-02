import type { ReactNode } from "react";
import { AuthOverlayShell } from "@/components/auth/AuthOverlayShell";

type SignupCheckoutModalProps = {
  open: boolean;
  onRequestClose: () => void;
  /** When false, backdrop click and Escape do not close */
  allowDismiss?: boolean;
  panelClassName?: string;
  children: ReactNode;
};

export function SignupCheckoutModal({
  open,
  onRequestClose,
  allowDismiss = true,
  panelClassName,
  children,
}: SignupCheckoutModalProps) {
  return (
    <AuthOverlayShell
      open={open}
      onDismiss={onRequestClose}
      allowDismiss={allowDismiss}
      panelClassName={panelClassName}
    >
      {children}
    </AuthOverlayShell>
  );
}
