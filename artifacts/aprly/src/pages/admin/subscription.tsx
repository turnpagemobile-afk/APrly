import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { adminContent } from "@/content/admin";

export default function AdminSubscriptionPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <p className="text-lg text-muted-foreground">{adminContent.placeholders.subscription}</p>
      </AdminShell>
    </AdminProtectedRoute>
  );
}
