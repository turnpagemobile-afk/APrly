import { Switch, Route, Redirect } from "wouter";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { AdminShell } from "@/components/admin/AdminShell";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminUsersPage from "@/pages/admin/users";
import AdminUserDetailPage from "@/pages/admin/user-detail";
import AdminPartnersPage from "@/pages/admin/partners";
import AdminPartnerDetailPage from "@/pages/admin/partner-detail";
import AdminPlanLeadDetailPage from "@/pages/admin/plan-lead-detail";
import NotFound from "@/pages/not-found";

/** Shared shell + auth guard for all protected /admin/* routes (single mount on navigation). */
export default function AdminAppLayout() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route
            path="/admin/users/:userId/plans/:planId"
            component={AdminPlanLeadDetailPage}
          />
          <Route path="/admin/users/:id" component={AdminUserDetailPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route
            path="/admin/partners/:partnerId/leads/:planId"
            component={AdminPlanLeadDetailPage}
          />
          <Route path="/admin/partners/:id" component={AdminPartnerDetailPage} />
          <Route path="/admin/partners" component={AdminPartnersPage} />
          <Route path="/admin">
            <Redirect to="/admin/dashboard" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </AdminShell>
    </AdminProtectedRoute>
  );
}
