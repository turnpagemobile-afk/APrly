import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminMeQueryKey,
  useAdminLogout,
  useGetAdminMe,
} from "@workspace/api-client-react";
import { AdminNavIcon, type AdminNavIconName } from "@/components/admin/AdminNavIcon";
import { adminContent } from "@/content/admin";
import { brandContent } from "@/content/landing";
import { adminAsset } from "@/lib/admin-assets";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV: {
  href: string;
  label: string;
  icon: AdminNavIconName;
}[] = [
  { href: "/admin/dashboard", label: adminContent.nav.dashboard, icon: "dashboard" },
  { href: "/admin/users", label: adminContent.nav.users, icon: "users" },
  { href: "/admin/partners", label: adminContent.nav.partners, icon: "partners" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {NAV.map(({ href, label, icon }) => {
        const active = location === href || location.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "admin-nav-link app-button-button-l-m",
              active ? "admin-nav-link--active" : "admin-nav-link--inactive",
            )}
          >
            <AdminNavIcon name={icon} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const queryClient = useQueryClient();
  const logout = useAdminLogout();
  const { data: me } = useGetAdminMe();

  const onLogout = async () => {
    try {
      await logout.mutateAsync();
    } finally {
      queryClient.removeQueries({ queryKey: getGetAdminMeQueryKey() });
      queryClient.clear();
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-logo-wrap admin-sidebar-logo-divider">
        <img
          src={adminAsset("dashboard/logo.png")}
          alt={brandContent.name}
          className="admin-sidebar-logo"
        />
      </div>
      <div className="admin-sidebar-nav">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="admin-sidebar-footer">
        {me ? (
          <p className="app-text-p2-regular text-[var(--primary-theme-300)]">
            Logged as {me.email}
          </p>
        ) : null}
        <button
          type="button"
          className="app-button-button-l-m text-neutral-000 mt-3 flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={() => void onLogout()}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          {adminContent.nav.logout}
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const pageTitle =
    NAV.find(({ href }) => location === href || location.startsWith(`${href}/`))?.label ??
    adminContent.dashboard.title;

  return (
    <div className="flex min-h-screen bg-[var(--page-bg)] text-[var(--neutral-theme-900)]">
      <aside className="hidden w-64 shrink-0 lg:block">
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--primary-theme-200)] bg-[var(--page-bg)]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--page-bg)]/90 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-[var(--primary-theme-200)]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-0 bg-transparent p-0">
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="app-header-h6 text-average">{pageTitle}</span>
        </header>

        <main className="flex-1 py-6">
          <div className="app-page-marketing">{children}</div>
        </main>
      </div>
    </div>
  );
}
