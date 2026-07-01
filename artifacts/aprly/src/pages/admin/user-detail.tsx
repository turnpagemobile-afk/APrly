import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import {
  getGetAdminUserPlansQueryKey,
  useGetAdminUser,
  useGetAdminUserPlans,
} from "@workspace/api-client-react";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { AdminUserDetailBreadcrumbs } from "@/components/admin/AdminUserDetailBreadcrumbs";
import { AdminUserDetailStats } from "@/components/admin/AdminUserDetailStats";
import { AdminUserInfoCard } from "@/components/admin/AdminUserInfoCard";
import { AdminUserPlanCard } from "@/components/admin/AdminUserPlanCard";
import { AdminUserSubscriptionCard } from "@/components/admin/AdminUserSubscriptionCard";
import { adminContent } from "@/content/admin";
import { cn } from "@/lib/utils";

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

function formatProgramEndDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function AdminUserDetailContent({ userId }: { userId: number }) {
  const [activeTab, setActiveTab] = useState<UserTabId>("details");
  const [plansPage, setPlansPage] = useState(1);
  const [plansPageSize, setPlansPageSize] = useState(5);

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
      { id: "details" as const, label: adminContent.userDetail.tabDetails },
      {
        id: "plans" as const,
        label: adminContent.userDetail.tabPlans(data?.summary.sentToPartnerPlansCount ?? 0),
      },
    ],
    [data?.summary.sentToPartnerPlansCount],
  );

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const savingPlansCount = data.summary.sentToPartnerPlansCount;
  const plansTotal = plansData?.total ?? 0;
  const plansLastPage = Math.max(1, Math.ceil(plansTotal / plansPageSize));

  const stats = (
    <AdminUserDetailStats
      monthsRegistered={data.summary.registeredMonthsAgo}
      savingPlansCount={savingPlansCount}
    />
  );

  return (
    <div className="space-y-6">
      <AdminUserDetailBreadcrumbs userName={displayName} />

      <AdminTabBar<UserTabId> tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === "details" ? (
        <div className="space-y-6">
          {stats}
          <div className="grid gap-6 lg:grid-cols-2">
            <AdminUserInfoCard
              userId={data.user.id}
              registrationDate={formatWhen(data.user.createdAt)}
              email={data.user.email}
            />
            <AdminUserSubscriptionCard
              active={data.subscription.active}
              programMonths={data.summary.registeredMonthsAgo}
              programEndDate={
                data.subscription.active && data.subscription.nextRenewalAt
                  ? formatProgramEndDate(data.subscription.nextRenewalAt)
                  : null
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {stats}

          <h2 className={cn("admin-user-plans-title app-header-subheadline-bold text-average")}>
            {adminContent.userDetail.plansSectionTitle}
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

              <AdminTablePagination
                page={plansPage}
                lastPage={plansLastPage}
                pageSize={plansPageSize}
                onPageChange={setPlansPage}
                onPageSizeChange={(size) => {
                  setPlansPageSize(size);
                  setPlansPage(1);
                }}
                pageSizeOptions={[5, 10, 20]}
              />
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
