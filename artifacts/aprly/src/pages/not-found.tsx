import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { NotFoundSection } from "@/components/landing/NotFoundSection";
import { brandContent } from "@/content/landing";
import { cn } from "@/lib/utils";

function isCabinetNotFoundContext(location: string): boolean {
  if (__APRLY_APP__ === "cabinet") return true;
  if (
    __APRLY_APP__ === "mono" &&
    (location === "/dashboard" || location.startsWith("/dashboard/"))
  ) {
    return true;
  }
  return false;
}

function CabinetNotFoundChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="app-page-cabinet flex h-14 items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="text-2xl font-black tracking-tight text-foreground"
            aria-label={brandContent.name}
          >
            {brandContent.name}
          </Link>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

export default function NotFound() {
  const [location] = useLocation();
  const cabinetContext = isCabinetNotFoundContext(location);

  const section = (
    <NotFoundSection
      className={cn(!cabinetContext && "min-h-[50dvh] bg-[#F8FCFE]")}
    />
  );

  if (cabinetContext) {
    return <CabinetNotFoundChrome>{section}</CabinetNotFoundChrome>;
  }

  return section;
}
