import type { ReactNode } from "react";

export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-auth-page">
      <div className="admin-auth-card">{children}</div>
    </div>
  );
}
