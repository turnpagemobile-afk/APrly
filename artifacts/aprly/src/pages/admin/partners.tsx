import { Link } from "wouter";
import { useGetAdminPartners } from "@workspace/api-client-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function AdminPartnersContent() {
  const { data, isLoading } = useGetAdminPartners();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const partners = data?.partners ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">{adminContent.partners.title}</h1>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <li key={p.id} className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <p className="font-bold text-foreground">{p.name}</p>
            <Button type="button" className="mt-4 w-full" asChild>
              <Link href={`/admin/partners/${p.id}`}>{adminContent.partners.viewLeads}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminPartnersPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <AdminPartnersContent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}
