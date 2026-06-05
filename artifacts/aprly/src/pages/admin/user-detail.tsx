import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import {
  getGetAdminUserPlansQueryKey,
  useGetAdminUser,
  useGetAdminUserPlans,
} from "@workspace/api-client-react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { AdminDetailTabs } from "@/components/admin/AdminDetailTabs";
import { AdminInfoGrid } from "@/components/admin/AdminInfoGrid";
import { AdminSummaryCards } from "@/components/admin/AdminSummaryCards";
import { AdminUserPlanCard } from "@/components/admin/AdminUserPlanCard";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";

type UserTabId = "details" | "plans";

function formatName(first: string | null | undefined, last: string | null | undefined) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  const s = `${a} ${b}`.trim();
  return s || "—";
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminUserDetailContent({ userId }: { userId: number }) {
  const [activeTab, setActiveTab] = useState<UserTabId>("details");
  const [plansPage, setPlansPage] = useState(1);
  const [plansPageSize, setPlansPageSize] = useState(10);

  const { data, isLoading } = useGetAdminUser(userId);

  const plansParams = useMemo(
    () => ({ page: plansPage, pageSize: plansPageSize }),
    [plansPage, plansPageSize],
  );

  const { data: plansData, isLoading: plansLoading } = useGetAdminUserPlans(userId, plansParams, {
    query: {
      queryKey: getGetAdminUserPlansQueryKey(userId, plansParams),
      enabled: activeTab === "plans",
    },
  });

  const displayName = data
    ? formatName(data.user.firstName ?? undefined, data.user.lastName ?? undefined)
    : "—";

  const tabs = useMemo(
    () => [
      { id: "details", label: adminContent.userDetail.tabDetails },
      {
        id: "plans",
        label: adminContent.userDetail.tabPlans(data?.summary.sentToPartnerPlansCount ?? 0),
      },
    ],
    [data?.summary.sentToPartnerPlansCount],
  );

  const summaryCards = data
    ? [
        {
          value: `${data.summary.registeredMonthsAgo} ${adminContent.userDetail.monthsUnit(data.summary.registeredMonthsAgo)}`,
          label: adminContent.userDetail.registeredAgo,
        },
        {
          value: data.summary.currentPlansCount,
          label: adminContent.userDetail.activePlans,
        },
        {
          value: data.summary.notSentPlansCount,
          label: adminContent.userDetail.notSentPlans,
        },
        {
          value: data.summary.createdPlansCount,
          label: adminContent.userDetail.totalPlans,
        },
      ]
    : [];

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const subActive = data.subscription.active;
  const plansTotal = plansData?.total ?? 0;
  const plansFrom = plansTotal === 0 ? 0 : (plansPage - 1) * plansPageSize + 1;
  const plansTo = Math.min(plansPage * plansPageSize, plansTotal);
  const plansLastPage = Math.max(1, Math.ceil(plansTotal / plansPageSize));

  return (
    <div className="space-y-6">
      <AdminBreadcrumbs
        segments={[
          { label: adminContent.userDetail.breadcrumbUsers, href: "/admin/users" },
          { label: displayName },
        ]}
      />

      <AdminDetailTabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as UserTabId)} />

      {activeTab === "details" ? (
        <div className="space-y-6">
          <AdminSummaryCards
            cards={summaryCards}
            className="sm:grid-cols-2 lg:grid-cols-4"
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminInfoGrid
              title={adminContent.userDetail.userInfoTitle}
              fields={[
                { label: adminContent.userDetail.fieldId, value: data.user.id },
                {
                  label: adminContent.userDetail.fieldRegistrationDate,
                  value: formatWhen(data.user.createdAt),
                },
                { label: adminContent.userDetail.fieldEmail, value: data.user.email },
              ]}
            />

            <AdminInfoGrid
              title={adminContent.userDetail.subscriptionTitle}
              fields={[
                {
                  label: adminContent.userDetail.fieldStatus,
                  value: subActive
                    ? adminContent.userDetail.subscriptionActive
                    : adminContent.userDetail.subscriptionInactive,
                  valueClassName: subActive ? "text-primary" : undefined,
                },
                {
                  label: adminContent.userDetail.fieldNextRenewal,
                  value: data.subscription.nextRenewalAt
                    ? formatWhen(data.subscription.nextRenewalAt)
                    : "—",
                },
              ]}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AdminSummaryCards
            cards={summaryCards}
            className="sm:grid-cols-2 lg:grid-cols-4"
          />

          <h2 className="text-lg font-bold text-foreground">
            {adminContent.userDetail.linkedAccountsTitle}
          </h2>

          {plansLoading || !plansData ? (
            <div className="flex min-h-[24vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plansData.plans.length === 0 ? (
            <p className="text-muted-foreground">{adminContent.userDetail.emptyPlans}</p>
          ) : (
            <>
              <ul className="space-y-4">
                {plansData.plans.map((plan, index) => (
                  <li key={plan.id}>
                    <AdminUserPlanCard
                      plan={plan}
                      userId={userId}
                      planIndex={(plansPage - 1) * plansPageSize + index + 1}
                    />
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{adminContent.partners.rowsPerPage}</span>
                  <select
                    aria-label={adminContent.partners.rowsPerPage}
                    value={String(plansPageSize)}
                    onChange={(e) => {
                      setPlansPageSize(Number(e.target.value));
                      setPlansPage(1);
                    }}
                    className="h-9 w-[72px] rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={plansPage <= 1}
                    onClick={() => setPlansPage((p) => Math.max(1, p - 1))}
                  >
                    {adminContent.partners.prev}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {adminContent.partners.rangeOf(plansFrom, plansTo, plansTotal)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={plansPage >= plansLastPage}
                    onClick={() => setPlansPage((p) => p + 1)}
                  >
                    {adminContent.partners.next}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminUserDetailPage() {
  const [, params] = useRoute("/admin/users/:id");
  const id = Number(params?.id);
  if (!Number.isInteger(id) || id < 1) {
    return <p className="text-destructive">Invalid user</p>;
  }

  return <AdminUserDetailContent userId={id} />;
}
