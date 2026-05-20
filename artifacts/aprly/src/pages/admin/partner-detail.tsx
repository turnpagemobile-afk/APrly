import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  GetAdminPartnerPlanLeadsLeadTab,
  getGetAdminPartnerPlanLeadsQueryKey,
  useGetAdminPartnerPlanLeads,
  usePatchAdminPartner,
} from "@workspace/api-client-react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminDetailTabs } from "@/components/admin/AdminDetailTabs";
import { AdminInfoGrid } from "@/components/admin/AdminInfoGrid";
import { AdminPartnerLeadCard } from "@/components/admin/AdminPartnerLeadCard";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

type PartnerTabId = "details" | "on_review" | "in_progress" | "won" | "rejected";

const LEAD_TABS: PartnerTabId[] = ["on_review", "in_progress", "won", "rejected"];

function tabFromSearch(): PartnerTabId {
  if (typeof window === "undefined") return "details";
  const raw = new URLSearchParams(window.location.search).get("tab");
  if (raw && LEAD_TABS.includes(raw as PartnerTabId)) {
    return raw as PartnerTabId;
  }
  return "details";
}

function tabIdToLeadTab(tab: PartnerTabId): GetAdminPartnerPlanLeadsLeadTab {
  if (tab === "details") return GetAdminPartnerPlanLeadsLeadTab.all;
  return tab as GetAdminPartnerPlanLeadsLeadTab;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminPartnerDetailContent({ partnerId }: { partnerId: number }) {
  const queryClient = useQueryClient();
  const patch = usePatchAdminPartner();
  const [activeTab, setActiveTab] = useState<PartnerTabId>(tabFromSearch);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsPageSize, setLeadsPageSize] = useState(10);

  useEffect(() => {
    setActiveTab(tabFromSearch());
  }, [partnerId]);

  const leadTab = tabIdToLeadTab(activeTab);
  const queryParams = useMemo(
    () => ({
      leadTab,
      page: activeTab === "details" ? undefined : leadsPage,
      pageSize: activeTab === "details" ? undefined : leadsPageSize,
    }),
    [leadTab, activeTab, leadsPage, leadsPageSize],
  );

  const { data, isLoading } = useGetAdminPartnerPlanLeads(partnerId, queryParams, {
    query: {
      queryKey: getGetAdminPartnerPlanLeadsQueryKey(partnerId, queryParams),
    },
  });

  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!data?.partner) return;
    setName(data.partner.name);
    setIsActive(data.partner.isActive ?? true);
  }, [data?.partner]);

  useEffect(() => {
    if (activeTab !== "details") {
      setLeadsPage(1);
    }
  }, [activeTab]);

  const counts = data?.leadCounts;
  const tabs = useMemo(
    () => [
      { id: "details", label: adminContent.partnerDetail.tabDetails },
      {
        id: "on_review",
        label: adminContent.partnerDetail.tabOnReview(counts?.onReview ?? 0),
      },
      {
        id: "in_progress",
        label: adminContent.partnerDetail.tabInProgress(counts?.inProgress ?? 0),
      },
      { id: "won", label: adminContent.partnerDetail.tabWon(counts?.won ?? 0) },
      {
        id: "rejected",
        label: adminContent.partnerDetail.tabRejected(counts?.rejected ?? 0),
      },
    ],
    [counts],
  );

  const dirty =
    data &&
    (name.trim() !== data.partner.name || isActive !== (data.partner.isActive ?? true));

  const onSave = async () => {
    if (!data) return;
    const n = name.trim();
    if (!n) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    const payload: { name?: string; isActive?: boolean } = {};
    if (n !== data.partner.name) payload.name = n;
    if (isActive !== (data.partner.isActive ?? true)) payload.isActive = isActive;
    if (Object.keys(payload).length === 0) return;
    try {
      await patch.mutateAsync({ id: partnerId, data: payload });
      toast({ title: adminContent.partnerDetail.saved });
      void queryClient.invalidateQueries({
        queryKey: getGetAdminPartnerPlanLeadsQueryKey(partnerId),
      });
      void queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const leadsTotal = data?.total ?? 0;
  const leadsFrom = leadsTotal === 0 ? 0 : (leadsPage - 1) * leadsPageSize + 1;
  const leadsTo = Math.min(leadsPage * leadsPageSize, leadsTotal);
  const leadsLastPage = Math.max(1, Math.ceil(leadsTotal / leadsPageSize));

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const partnerActive = data.partner.isActive ?? true;

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        segments={[
          { label: adminContent.partnerDetail.breadcrumbPartners, href: "/admin/partners" },
          { label: data.partner.name },
        ]}
      />

      <AdminDetailTabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as PartnerTabId)} />

      {activeTab === "details" ? (
        <div className="space-y-6">
          <AdminInfoGrid
            title={adminContent.partnerDetail.partnerInfoTitle}
            fields={[
              { label: adminContent.partnerDetail.fieldNumber, value: data.partner.id },
              {
                label: adminContent.partnerDetail.fieldRegisteredOn,
                value: data.partner.createdAt ? formatDateTime(String(data.partner.createdAt)) : "—",
              },
              {
                label: adminContent.partnerDetail.fieldStatus,
                value: partnerActive
                  ? adminContent.partners.active
                  : adminContent.partners.deactivated,
                valueClassName: partnerActive ? "text-primary" : undefined,
              },
            ]}
          />

          <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              {adminContent.partnerDetail.sectionProfile}
            </h2>
            <div className="grid max-w-md gap-4">
              <div className="grid gap-2">
                <Label htmlFor="partner-name">{adminContent.partnerDetail.nameLabel}</Label>
                <Input id="partner-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 p-3">
                <span className="text-sm font-medium">{adminContent.partnerDetail.statusLabel}</span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button
                type="button"
                className="w-fit"
                disabled={!dirty || patch.isPending}
                onClick={() => void onSave()}
              >
                {adminContent.partnerDetail.save}
              </Button>
            </div>
          </section>
        </div>
      ) : data.planLeads.length === 0 ? (
        <p className="text-muted-foreground">{adminContent.partners.empty}</p>
      ) : (
        <div className="space-y-6">
          <ul className="space-y-4">
            {data.planLeads.map((lead) => (
              <li key={lead.id}>
                <AdminPartnerLeadCard lead={lead} partnerId={partnerId} tab={activeTab} />
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{adminContent.partners.rowsPerPage}</span>
              <Select
                value={String(leadsPageSize)}
                onValueChange={(v) => {
                  setLeadsPageSize(Number(v));
                  setLeadsPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[72px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={leadsPage <= 1}
                onClick={() => setLeadsPage((p) => Math.max(1, p - 1))}
              >
                {adminContent.partners.prev}
              </Button>
              <span className="text-sm text-muted-foreground">
                {adminContent.partners.rangeOf(leadsFrom, leadsTo, leadsTotal)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={leadsPage >= leadsLastPage}
                onClick={() => setLeadsPage((p) => p + 1)}
              >
                {adminContent.partners.next}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPartnerDetailPage() {
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
        <AdminPartnerDetailContent partnerId={id} />
      </AdminShell>
    </AdminProtectedRoute>
  );
}
