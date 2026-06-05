import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { useForgotPasswordFlow } from "@/lib/forgot-password-context";

export function ForgotPasswordHost() {
  const { open, mountKey, closeForgotPassword } = useForgotPasswordFlow();

  if (!open) return null;

  return (
    <ForgotPasswordModal
      key={mountKey}
      open={open}
      onOpenChange={(next) => {
        if (!next) closeForgotPassword();
      }}
    />
  );
}
