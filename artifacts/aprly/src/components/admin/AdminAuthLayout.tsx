import type { ReactNode } from "react";
import { adminContent } from "@/content/admin";
import { brandContent } from "@/content/landing";

export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--page-bg)] px-4 py-10">
      <div className="w-full max-w-md rounded-[var(--design-card-corner-radius-small,24px)] border border-[var(--primary-theme-200)] bg-[var(--card-1lvl-bg-color)] p-8 shadow-[0_10px_20px_0_rgba(29,62,11,0.08)]">
        <p className="text-center text-2xl font-black tracking-tight text-[var(--title-color)]">
          {brandContent.name}
        </p>
        <p className="mt-2 text-center text-sm text-[var(--hint-text-color)]">{adminContent.login.subtitle}</p>
        {children}
      </div>
    </div>
  );
}
