import { Switch, Route } from "wouter";
import { AppProviders } from "@/apps/shared/AppProviders";
import { ScrollLockRouteGuard } from "@/apps/shared/ScrollLockRouteGuard";
import { LandingThemeEffect } from "@/components/landing/LandingThemeEffect";
import AdminAppLayout from "@/components/admin/AdminAppLayout";
import AdminLoginPage from "@/pages/admin/login";
import AdminVerifyPage from "@/pages/admin/verify";

export default function AdminApp() {
  return (
    <AppProviders>
      <LandingThemeEffect />
      <ScrollLockRouteGuard />
      <Switch>
        <Route path="/admin/login" component={AdminLoginPage} />
        <Route path="/admin/verify" component={AdminVerifyPage} />
        <Route path="/admin" component={AdminAppLayout} />
        <Route path="/admin/*" component={AdminAppLayout} />
      </Switch>
    </AppProviders>
  );
}
