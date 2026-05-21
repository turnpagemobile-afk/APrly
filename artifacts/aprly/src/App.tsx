import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { releaseDialogScrollLock } from "@/lib/release-dialog-scroll-lock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/lib/auth-session";
import { SignupCheckoutProvider } from "@/lib/signup-checkout-context";
import { SignupCheckoutHost } from "@/components/auth/signup-checkout-host";
import Home from "@/pages/home";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import CreateDetailedPlan from "@/pages/dashboard/create-plan";
import PlanLeadDetailPage from "@/pages/dashboard/plan-lead-detail";
import DashboardProfile from "@/pages/dashboard/profile";
import AdminLoginPage from "@/pages/admin/login";
import AdminVerifyPage from "@/pages/admin/verify";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminUsersPage from "@/pages/admin/users";
import AdminUserDetailPage from "@/pages/admin/user-detail";
import AdminPartnersPage from "@/pages/admin/partners";
import AdminPartnerDetailPage from "@/pages/admin/partner-detail";
import AdminPlanLeadDetailPage from "@/pages/admin/plan-lead-detail";
import AdminSubscriptionPage from "@/pages/admin/subscription";

const queryClient = new QueryClient();

function ScrollLockRouteGuard() {
  const [location] = useLocation();
  useEffect(() => {
    releaseDialogScrollLock();
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/verify" component={AdminVerifyPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/users/:userId/plans/:planId" component={AdminPlanLeadDetailPage} />
      <Route path="/admin/users/:id" component={AdminUserDetailPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route
        path="/admin/partners/:partnerId/leads/:planId"
        component={AdminPlanLeadDetailPage}
      />
      <Route path="/admin/partners/:id" component={AdminPartnerDetailPage} />
      <Route path="/admin/partners" component={AdminPartnersPage} />
      <Route path="/admin/subscription" component={AdminSubscriptionPage} />
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route>
        <Layout>
          <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
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
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <SignupCheckoutProvider>
              <ScrollLockRouteGuard />
              <Router />
              <SignupCheckoutHost />
            </SignupCheckoutProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
