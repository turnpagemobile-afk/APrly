import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { useLocation } from "wouter";
import { accountMenuContent } from "@/content/dashboard-profile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutConfirmDialog } from "@/components/dashboard/LogoutConfirmDialog";

function AccountMenuTrigger({
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-9 w-9 shrink-0 rounded-full border-primary bg-white text-primary hover:bg-white/90"
      aria-label="Account menu"
      onClick={onClick}
      {...props}
    >
      <User className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}

type AccountMenuItemsProps = {
  onNavigate: () => void;
  onLogoutClick: () => void;
  variant: "mobile" | "desktop";
};

function AccountMenuItems({ onNavigate, onLogoutClick, variant }: AccountMenuItemsProps) {
  const [, setLocation] = useLocation();

  const goProfile = () => {
    onNavigate();
    setLocation("/dashboard/profile");
  };

  const goSubscription = () => {
    onNavigate();
    setLocation("/dashboard?tab=dashboard");
  };

  const onLogout = () => {
    onNavigate();
    onLogoutClick();
  };

  if (variant === "mobile") {
    return (
      <nav className="flex flex-col" aria-label="Account menu">
        <button
          type="button"
          className="w-full py-4 text-center text-base font-semibold text-primary hover:bg-muted/30"
          onClick={goProfile}
        >
          {accountMenuContent.profile}
        </button>
        <button
          type="button"
          className="w-full py-4 text-center text-base font-semibold text-primary hover:bg-muted/30"
          onClick={goSubscription}
        >
          {accountMenuContent.subscription}
        </button>
        <button
          type="button"
          className="w-full py-4 text-center text-base font-semibold text-primary hover:bg-muted/30"
          onClick={onLogout}
        >
          {accountMenuContent.logOut}
        </button>
      </nav>
    );
  }

  return (
    <>
      <DropdownMenuItem className="cursor-pointer font-medium" onSelect={goProfile}>
        {accountMenuContent.profile}
      </DropdownMenuItem>
      <DropdownMenuItem className="cursor-pointer font-medium" onSelect={goSubscription}>
        {accountMenuContent.subscription}
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer font-medium"
        onSelect={(e) => {
          e.preventDefault();
          onLogout();
        }}
      >
        <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
        {accountMenuContent.logOut}
      </DropdownMenuItem>
    </>
  );
}

export function DashboardUserMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const openLogout = () => setLogoutOpen(true);

  return (
    <>
      {/* Mobile: full-width panel below header */}
      <div className="cabinet:hidden">
        <AccountMenuTrigger onClick={() => setMobileOpen((v) => !v)} aria-expanded={mobileOpen} />
        {mobileOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 top-14 z-40 bg-black/50"
              aria-label="Close account menu"
              onClick={closeMobile}
            />
            <div className="fixed inset-x-0 top-14 z-50 border-b border-border bg-card shadow-lg">
              <AccountMenuItems
                variant="mobile"
                onNavigate={closeMobile}
                onLogoutClick={openLogout}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Desktop: compact dropdown */}
      <div className="hidden cabinet:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <AccountMenuTrigger />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[10rem]">
            <AccountMenuItems
              variant="desktop"
              onNavigate={() => undefined}
              onLogoutClick={openLogout}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutConfirmDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}
