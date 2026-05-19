import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { adminContent } from "@/content/admin";

export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <p className="text-lg text-muted-foreground">{adminContent.placeholders.users}</p>
      </AdminShell>
    </AdminProtectedRoute>
  );
}
