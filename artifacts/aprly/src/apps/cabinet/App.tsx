import { Switch, Route } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppProviders } from "@/apps/shared/AppProviders";
import { ScrollLockRouteGuard } from "@/apps/shared/ScrollLockRouteGuard";
import Dashboard from "@/pages/dashboard";
import CreateDetailedPlan from "@/pages/dashboard/create-plan";
import PlanLeadDetailPage from "@/pages/dashboard/plan-lead-detail";
import DashboardProfile from "@/pages/dashboard/profile";
import NotFound from "@/pages/not-found";

export default function CabinetApp() {
  return (
    <AppProviders withUserAuth>
      <ScrollLockRouteGuard />
      <Switch>
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
        <Route component={NotFound} />
      </Switch>
    </AppProviders>
  );
}
