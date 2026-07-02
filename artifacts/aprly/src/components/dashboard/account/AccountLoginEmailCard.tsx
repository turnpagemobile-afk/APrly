import { AuthTextInput } from "@/components/shared/auth-form/AuthTextInput";
import { dashboardProfileContent } from "@/content/dashboard-profile";

type AccountLoginEmailCardProps = {
  email: string;
};

export function AccountLoginEmailCard({ email }: AccountLoginEmailCardProps) {
  const copy = dashboardProfileContent.loginEmail;

  return (
    <section className="dash-account-card">
      <h2 className="dash-account-section-title">{copy.title}</h2>
      <AuthTextInput
        id="account-login-email"
        label={copy.emailLabel}
        type="email"
        value={email}
        readOnly
        disabled
        autoComplete="email"
        className="cursor-not-allowed bg-[var(--neutral-theme-100)] text-[var(--hint-text-color)]"
      />
    </section>
  );
}
