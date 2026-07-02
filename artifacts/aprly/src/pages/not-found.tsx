import { useCallback } from "react";
import { useLocation } from "wouter";
import { NotFoundSection } from "@/components/landing/NotFoundSection";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { CabinetHeader } from "@/components/dashboard/CabinetHeader";
import { footerContent } from "@/content/landing";
import { createPlanHref } from "@/lib/create-plan-navigation";
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

function isLandingNotFoundInLayout(): boolean {
  return __APRLY_APP__ === "landing" || __APRLY_APP__ === "mono";
}

export default function NotFound() {
  const [location, navigate] = useLocation();
  const cabinetContext = isCabinetNotFoundContext(location);
  const landingInLayout = !cabinetContext && isLandingNotFoundInLayout();

  const onCreateSavingPlan = useCallback(() => {
    navigate(createPlanHref("/dashboard?tab=home"));
  }, [navigate]);

  const copyright = footerContent.copyrightTemplate.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  const onNavigateAnchor = useCallback(
    (href: string) => {
      if (!href.startsWith("#")) {
        navigate(href);
        return;
      }
      if (location !== "/") {
        navigate(`/${href}`);
        return;
      }
      const el = document.getElementById(href.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [location, navigate],
  );

  const onGetStarted = useCallback(() => {
    onNavigateAnchor("#optimizer");
  }, [onNavigateAnchor]);

  const section = (
    <NotFoundSection
      className={cn(!cabinetContext && !landingInLayout && "min-h-[50dvh] bg-[var(--page-bg)]")}
    />
  );

  if (cabinetContext) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col bg-[var(--page-bg)] text-[var(--neutral-theme-900)]">
        <CabinetHeader
          activeTab="home"
          onTabChange={() => {}}
          showTabs={false}
          onCreateSavingPlan={onCreateSavingPlan}
          isOffline={false}
        />
        <main className="flex min-h-0 flex-1 flex-col">{section}</main>
        <LandingFooter copyright={copyright} homeHref="/dashboard?tab=home" />
      </div>
    );
  }

  if (landingInLayout) {
    return section;
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[var(--page-bg)] text-[var(--neutral-theme-900)]">
      <LandingHeader onGetStarted={onGetStarted} onNavigateAnchor={onNavigateAnchor} />
      <main className="flex min-h-0 flex-1 flex-col">{section}</main>
      <LandingFooter copyright={copyright} />
    </div>
  );
}
