import { useEffect, useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import {
  GetAdminPartnerPlanLeadsLeadTab,
  getGetAdminPartnerPlanLeadsQueryKey,
  useGetAdminPartnerPlanLeads,
  type AdminPartnerPlanLead,
} from "@workspace/api-client-react";
import { AdminPartnerDetailHeader } from "@/components/admin/AdminPartnerDetailHeader";
import { AdminPartnerInfoCard } from "@/components/admin/AdminPartnerInfoCard";
import { AdminPartnerLeadGroup } from "@/components/admin/AdminPartnerLeadGroup";
import { AdminPartnerStatusCard } from "@/components/admin/AdminPartnerStatusCard";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { adminContent } from "@/content/admin";

type PartnerTabId = "details" | "waiting" | "on_review" | "in_progress" | "won" | "rejected";

const LEAD_TABS: PartnerTabId[] = ["waiting", "on_review", "in_progress", "won", "rejected"];

function tabFromSearch(): PartnerTabId {
  if (typeof window === "undefined") return "details";
  const raw = new URLSearchParams(window.location.search).get("tab");
  if (raw === "details") return "details";
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

function formatUserName(first?: string | null, last?: string | null) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  const s = `${a} ${b}`.trim();
  return s || "—";
}

function groupLeadsByUser(leads: AdminPartnerPlanLead[]) {
  const order: number[] = [];
  const map = new Map<
    number,
    {
      userId: number;
      userName: string;
      userEmail: string;
      leads: AdminPartnerPlanLead[];
    }
  >();

  for (const lead of leads) {
    if (!map.has(lead.userId)) {
      order.push(lead.userId);
      map.set(lead.userId, {
        userId: lead.userId,
        userName: formatUserName(lead.firstName, lead.lastName),
        userEmail: lead.userEmail,
        leads: [],
      });
    }
    map.get(lead.userId)!.leads.push(lead);
  }

  return order.map((userId) => map.get(userId)!);
}

function AdminPartnerDetailContent({ partnerId }: { partnerId: number }) {
  const [activeTab, setActiveTab] = useState<PartnerTabId>(tabFromSearch);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsPageSize, setLeadsPageSize] = useState(5);

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

  useEffect(() => {
    if (activeTab !== "details") {
      setLeadsPage(1);
    }
  }, [activeTab]);

  const counts = data?.leadCounts;
  const tabs = useMemo(
    () => [
      { id: "details" as const, label: adminContent.partnerDetail.tabDetails },
      { id: "waiting" as const, label: adminContent.partnerDetail.tabWaiting(counts?.waiting ?? 0) },
      {
        id: "on_review" as const,
        label: adminContent.partnerDetail.tabOnReview(counts?.onReview ?? 0),
      },
      {
        id: "in_progress" as const,
        label: adminContent.partnerDetail.tabInProgress(counts?.inProgress ?? 0),
      },
      { id: "won" as const, label: adminContent.partnerDetail.tabWon(counts?.won ?? 0) },
      {
        id: "rejected" as const,
        label: adminContent.partnerDetail.tabRejected(counts?.rejected ?? 0),
      },
    ],
    [counts],
  );

  const leadGroups = useMemo(
    () => (data?.planLeads ? groupLeadsByUser(data.planLeads) : []),
    [data?.planLeads],
  );

  const leadsTotal = data?.total ?? 0;
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
      <AdminPartnerDetailHeader
        partnerId={partnerId}
        partnerName={data.partner.name}
        isActive={partnerActive}
      />

      <AdminTabBar<PartnerTabId> tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === "details" ? (
        <div className="space-y-6">
          <AdminPartnerStatusCard active={partnerActive} />
          <AdminPartnerInfoCard
            partnerId={data.partner.id}
            createdOn={
              data.partner.createdAt ? formatDateTime(String(data.partner.createdAt)) : "—"
            }
            companyName={data.partner.name}
            email="—"
          />
        </div>
      ) : data.planLeads.length === 0 ? (
        <p className="text-muted-foreground">{adminContent.partners.listEmpty}</p>
      ) : (
        <div className="space-y-8">
          {leadGroups.map((group) => (
            <AdminPartnerLeadGroup
              key={group.userId}
              userId={group.userId}
              userName={group.userName}
              userEmail={group.userEmail}
              leads={group.leads}
              partnerId={partnerId}
              tab={activeTab}
            />
          ))}

          <AdminTablePagination
            page={leadsPage}
            lastPage={leadsLastPage}
            pageSize={leadsPageSize}
            onPageChange={setLeadsPage}
            onPageSizeChange={(size) => {
              setLeadsPageSize(size);
              setLeadsPage(1);
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminPartnerDetailPage() {
  const [, params] = useRoute("/admin/partners/:id");
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id < 1) {
    return <p className="text-destructive">Invalid partner</p>;
  }

  return <AdminPartnerDetailContent partnerId={id} />;
}
