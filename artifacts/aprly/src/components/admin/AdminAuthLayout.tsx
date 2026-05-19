import type { ReactNode } from "react";
import { adminContent } from "@/content/admin";
export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <p className="text-center text-sm text-muted-foreground">{adminContent.login.subtitle}</p>
        {children}
      </div>
    </div>
  );
}
