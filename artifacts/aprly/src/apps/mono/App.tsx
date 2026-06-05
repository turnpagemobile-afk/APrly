import { Switch, Route } from "wouter";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SignupCheckoutProvider } from "@/lib/signup-checkout-context";
import { ForgotPasswordProvider } from "@/lib/forgot-password-context";
import { SignupCheckoutHost } from "@/components/auth/signup-checkout-host";
import { ForgotPasswordHost } from "@/components/auth/forgot-password-host";
import { AppProviders } from "@/apps/shared/AppProviders";
import { LandingThemeEffect } from "@/components/landing/LandingThemeEffect";
import { ScrollLockRouteGuard } from "@/apps/shared/ScrollLockRouteGuard";
import AdminAppLayout from "@/components/admin/AdminAppLayout";
import Home from "@/pages/home";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Login from "@/pages/login";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import CreateDetailedPlan from "@/pages/dashboard/create-plan";
import PlanLeadDetailPage from "@/pages/dashboard/plan-lead-detail";
import DashboardProfile from "@/pages/dashboard/profile";
import AdminLoginPage from "@/pages/admin/login";
import AdminVerifyPage from "@/pages/admin/verify";
import NotFound from "@/pages/not-found";

/** Local dev: one bundle, all routes (production uses split landing/cabinet/admin). */
export default function MonoApp() {
  return (
    <AppProviders withUserAuth>
      <SignupCheckoutProvider>
        <ForgotPasswordProvider>
          <LandingThemeEffect />
          <ScrollLockRouteGuard />
          <Switch>
            <Route path="/admin/login" component={AdminLoginPage} />
            <Route path="/admin/verify" component={AdminVerifyPage} />
            <Route path="/admin" component={AdminAppLayout} />
            <Route path="/admin/*" component={AdminAppLayout} />
            <Route>
              <Layout>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/login" component={Login} />
                  <Route path="/reset-password" component={ResetPassword} />
                  <Route path="/dashboard/create-plan">
                    <ProtectedRoute>
                      <CreateDetailedPlan />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/dashboard/profile">
                    <ProtectedRoute>
                      <DashboardProfile />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/dashboard/plan-leads/:id">
                    <ProtectedRoute>
                      <PlanLeadDetailPage />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/dashboard/">
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/dashboard">
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </Route>
                  <Route path="/privacy" component={Privacy} />
                  <Route path="/terms" component={Terms} />
                  <Route path="/404" component={NotFound} />
                  <Route component={NotFound} />
                </Switch>
              </Layout>
            </Route>
          </Switch>
          <SignupCheckoutHost />
          <ForgotPasswordHost />
        </ForgotPasswordProvider>
      </SignupCheckoutProvider>
    </AppProviders>
  );
}
