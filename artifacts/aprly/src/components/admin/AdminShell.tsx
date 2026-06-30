import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, LogOut, Menu, Users, Handshake, CreditCard } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminMeQueryKey,
  useAdminLogout,
  useGetAdminMe,
} from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { brandContent } from "@/content/landing";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: adminContent.nav.dashboard, icon: LayoutDashboard },
  { href: "/admin/users", label: adminContent.nav.users, icon: Users },
  { href: "/admin/partners", label: adminContent.nav.partners, icon: Handshake },
  { href: "/admin/subscription", label: adminContent.nav.subscription, icon: CreditCard },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const [location] = useLocation();

  return (
    <nav className="flex flex-col gap-1" aria-label="Admin navigation">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = location === href || location.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--primary-theme-100)] text-[var(--title-color)]"
                : "text-[var(--hint-text-color)] hover:bg-[var(--primary-theme-050)] hover:text-[var(--neutral-theme-900)]",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
    <div className="flex h-full flex-col bg-[var(--card-1lvl-bg-color)] text-[var(--neutral-theme-900)]">
      <div className="border-b border-[var(--primary-theme-200)] px-5 py-6">
        <p className="text-2xl font-black tracking-tight text-[var(--title-color)]">{brandContent.name}</p>
        <p className="text-sm text-[var(--hint-text-color)]">{adminContent.panelTitle}</p>
        {me ? (
          <p className="mt-3 text-xs text-[var(--hint-text-color)]">Logged as {me.email}</p>
        ) : null}
      </div>
      <div className="flex-1 px-3 py-4">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="border-t border-[var(--primary-theme-200)] p-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2 text-[var(--hint-text-color)] hover:text-[var(--neutral-theme-900)]"
          onClick={() => void onLogout()}
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          {adminContent.nav.logout}
        </Button>
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
      <aside className="hidden w-64 shrink-0 border-r border-[var(--primary-theme-200)] lg:block">
        <AdminSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[var(--primary-theme-200)] bg-[var(--primary-theme-050)]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--primary-theme-050)]/90 lg:hidden">
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
            <SheetContent side="left" className="w-64 border-[var(--primary-theme-200)] bg-[var(--card-1lvl-bg-color)] p-0">
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-[var(--title-color)]">{pageTitle}</span>
        </header>

        <main className="flex-1 py-6">
          <div className="app-page-marketing">{children}</div>
        </main>
      </div>
    </div>
  );
}
