import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardTab } from "@/components/dashboard/DashboardTabBar";
import {
  ProfileTabSwitcher,
  type ProfileSection,
} from "@/components/dashboard/profile/ProfileTabSwitcher";
import { ProfileYourProfileForm } from "@/components/dashboard/profile/ProfileYourProfileForm";
import { ProfilePasswordForm } from "@/components/dashboard/profile/ProfilePasswordForm";
import { dashboardProfileContent } from "@/content/dashboard-profile";
import { useDashboardSubscription } from "@/lib/use-dashboard-subscription";

function readSectionFromUrl(): ProfileSection {
  if (typeof window === "undefined") return "profile";
  const params = new URLSearchParams(window.location.search);
  return params.get("section") === "password" ? "password" : "profile";
}

function readDashboardTabFromPath(): DashboardTab {
  return "home";
}

export default function DashboardProfilePage() {
  const [, setLocation] = useLocation();
  const [section, setSection] = useState<ProfileSection>(readSectionFromUrl);
  const subscription = useDashboardSubscription();

  useEffect(() => {
    const onPopState = () => setSection(readSectionFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setProfileSection = useCallback((next: ProfileSection) => {
    setSection(next);
    const path =
      next === "password"
        ? "/dashboard/profile?section=password"
        : "/dashboard/profile";
    window.history.pushState({}, "", path);
  }, []);

  const onDashboardTabChange = useCallback(
    (tab: DashboardTab) => {
      setLocation(tab === "dashboard" ? "/dashboard?tab=dashboard" : "/dashboard");
    },
    [setLocation],
  );

  if (subscription.isSubscriptionLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  return (
    <DashboardShell
      activeTab={readDashboardTabFromPath()}
      onTabChange={onDashboardTabChange}
      subscriptionActive={subscription.subscriptionActive}
      onActivateSubscription={() => void subscription.startCheckout()}
      isCheckoutLoading={subscription.isCheckoutLoading}
    >
      <div className="app-page-cabinet py-8">
        <h1 className="mb-6 text-2xl font-black text-foreground">
          {dashboardProfileContent.pageTitle}
        </h1>

        <div className="mb-8 flex justify-center cabinet:justify-start">
          <ProfileTabSwitcher active={section} onChange={setProfileSection} />
        </div>

        <div
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
          role="tabpanel"
        >
          {section === "profile" ? <ProfileYourProfileForm /> : <ProfilePasswordForm />}
        </div>
      </div>
    </DashboardShell>
  );
}
