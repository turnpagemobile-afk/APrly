import { useRoute } from "wouter";
import { Link } from "wouter";
import { useGetAdminPartnerPlanLeads } from "@workspace/api-client-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { adminContent } from "@/content/admin";
import { formatCurrency } from "@/lib/format-currency";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function AdminPartnerLeadsContent({ partnerId }: { partnerId: number }) {
  const { data, isLoading } = useGetAdminPartnerPlanLeads(partnerId);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/admin/partners">Back</Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {adminContent.partners.leadsTitle}: {data.partner.name}
        </h1>
      </div>
      {data.planLeads.length === 0 ? (
        <p className="text-muted-foreground">{adminContent.partners.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {data.planLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{lead.brand}</td>
                  <td className="px-4 py-3">{lead.userEmail}</td>
                  <td className="px-4 py-3">{formatCurrency(lead.balance, 2)}</td>
                  <td className="px-4 py-3 capitalize">{lead.status.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {lead.sentToPartnerAt
                      ? new Date(lead.sentToPartnerAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminPartnerLeadsPage() {
  const [, params] = useRoute("/admin/partners/:id");
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id < 1) {
    return (
      <AdminProtectedRoute>
        <AdminShell>
          <p className="text-destructive">Invalid partner</p>
        </AdminShell>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminShell>
        <AdminPartnerLeadsContent partnerId={id} />
      </AdminShell>
    </AdminProtectedRoute>
  );
}
