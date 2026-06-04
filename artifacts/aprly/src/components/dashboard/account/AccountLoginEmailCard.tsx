import { dashboardProfileContent } from "@/content/dashboard-profile";

type AccountLoginEmailCardProps = {
  email: string;
};

export function AccountLoginEmailCard({ email }: AccountLoginEmailCardProps) {
  const copy = dashboardProfileContent.loginEmail;

  return (
    <section className="dash-account-card">
      <h2 className="dash-account-section-title">{copy.title}</h2>
      <div className="space-y-2">
        <label htmlFor="account-login-email" className="dash-account-field-label">
          {copy.emailLabel}
        </label>
        <input
          id="account-login-email"
          type="email"
          value={email}
          disabled
          readOnly
          autoComplete="email"
          className="dash-account-input dash-account-input--readonly"
        />
      </div>
    </section>
  );
}
