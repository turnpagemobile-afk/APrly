import { useMemo, useState } from "react";
import { useRoute } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  getGetAdminPartnerPlanLeadQueryKey,
  getGetAdminPartnerPlanLeadsQueryKey,
  getGetAdminUserPlanQueryKey,
  useGetAdminPartnerPlanLead,
  useGetAdminUserPlan,
  usePostAdminPlanLeadCompleteStep,
  usePostAdminPlanLeadReject,
  usePostAdminPlanLeadStartWorking,
} from "@workspace/api-client-react";
import { AdminPlanDetailBreadcrumbs } from "@/components/admin/AdminPlanDetailBreadcrumbs";
import { AdminPlanLeadDetailView } from "@/components/admin/AdminPlanLeadDetailView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminContent } from "@/content/admin";
import { toast } from "@/hooks/use-toast";
import { openAdminPlanLeadPdf } from "@/lib/admin-plan-lead-pdf";

type PlanDetailContext =
  | { kind: "user"; userId: number; planId: number }
  | { kind: "partner"; partnerId: number; planId: number };

function usePlanDetailContext(): PlanDetailContext | null {
  const [userMatch, userParams] = useRoute("/admin/users/:userId/plans/:planId");
  const [partnerMatch, partnerParams] = useRoute(
    "/admin/partners/:partnerId/leads/:planId",
  );

  if (userMatch && userParams) {
    const userId = Number(userParams.userId);
    const planId = Number(userParams.planId);
    if (Number.isInteger(userId) && userId > 0 && Number.isInteger(planId) && planId > 0) {
      return { kind: "user" as const, userId, planId };
    }
  }
  if (partnerMatch && partnerParams) {
    const partnerId = Number(partnerParams.partnerId);
    const planId = Number(partnerParams.planId);
    if (
      Number.isInteger(partnerId) &&
      partnerId > 0 &&
      Number.isInteger(planId) &&
      planId > 0
    ) {
      return { kind: "partner" as const, partnerId, planId };
    }
  }
  return null;
}

function formatUserName(first?: string | null, last?: string | null) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  return `${a} ${b}`.trim() || "—";
}

function AdminPlanLeadDetailContent({ ctx }: { ctx: PlanDetailContext }) {
  const queryClient = useQueryClient();
  const copy = adminContent.adminPlanDetail;
  const [rejectOpen, setRejectOpen] = useState(false);
  const [printPending, setPrintPending] = useState(false);

  const userQuery = useGetAdminUserPlan(ctx.kind === "user" ? ctx.userId : 0, ctx.planId, {
    query: {
      queryKey:
        ctx.kind === "user"
          ? getGetAdminUserPlanQueryKey(ctx.userId, ctx.planId)
          : ["disabled"],
      enabled: ctx.kind === "user",
    },
  });

  const partnerQuery = useGetAdminPartnerPlanLead(
    ctx.kind === "partner" ? ctx.partnerId : 0,
    ctx.planId,
    {
      query: {
        queryKey:
          ctx.kind === "partner"
            ? getGetAdminPartnerPlanLeadQueryKey(ctx.partnerId, ctx.planId)
            : ["disabled"],
        enabled: ctx.kind === "partner",
      },
    },
  );

  const detailQuery = ctx.kind === "user" ? userQuery : partnerQuery;
  const detail = detailQuery.data;

  const startWorking = usePostAdminPlanLeadStartWorking();
  const completeStep = usePostAdminPlanLeadCompleteStep();
  const rejectLead = usePostAdminPlanLeadReject();

  const planId = ctx.planId;

  const invalidateLists = async () => {
    if (ctx.kind === "user") {
      await queryClient.invalidateQueries({
        queryKey: getGetAdminUserPlanQueryKey(ctx.userId, planId),
      });
      await queryClient.invalidateQueries({
        queryKey: [`/api/admin/users/${ctx.userId}/plans`],
      });
    } else {
      await queryClient.invalidateQueries({
        queryKey: getGetAdminPartnerPlanLeadQueryKey(ctx.partnerId, planId),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetAdminPartnerPlanLeadsQueryKey(ctx.partnerId),
      });
    }
  };

  const onMutationSuccess = async () => {
    await invalidateLists();
    setRejectOpen(false);
  };

  const runReject = async () => {
    try {
      await rejectLead.mutateAsync({ planId });
      await onMutationSuccess();
      toast({ title: copy.rejectConfirm });
    } catch {
      toast({ title: "Reject failed", variant: "destructive" });
    }
  };

  const onStartWorking = async () => {
    try {
      await startWorking.mutateAsync({ planId });
      await onMutationSuccess();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const onCompleteStep = async () => {
    try {
      await completeStep.mutateAsync({ planId });
      await onMutationSuccess();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const backHref = useMemo(() => {
    if (ctx.kind === "user") {
      return `/admin/users/${ctx.userId}`;
    }
    const tab =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("tab") ?? "on_review"
        : "on_review";
    return `/admin/partners/${ctx.partnerId}?tab=${tab}`;
  }, [ctx]);

  const breadcrumbProps = useMemo(() => {
    if (!detail) return null;
    if (ctx.kind === "user") {
      const name = formatUserName(detail.user.firstName, detail.user.lastName);
      return {
        kind: "user" as const,
        userId: ctx.userId,
        userName: name,
      };
    }
    return {
      kind: "partner" as const,
      partnerId: ctx.partnerId,
      partnerName: detail.partner?.name ?? "Partner",
    };
  }, [ctx, detail]);

  if (detailQuery.isLoading || !detail) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isMutating =
    startWorking.isPending || completeStep.isPending || rejectLead.isPending;

  const onPrint = async () => {
    setPrintPending(true);
    try {
      await openAdminPlanLeadPdf(ctx.planId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      toast({
        title: message === "Popup blocked" ? copy.printPopupBlocked : copy.printError,
        description:
          message === "Popup blocked" ? undefined : copy.printErrorDescription,
        variant: "destructive",
      });
    } finally {
      setPrintPending(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      {breadcrumbProps ? <AdminPlanDetailBreadcrumbs {...breadcrumbProps} /> : null}

      <div className="dash-plan-detail-layout">
        <AdminPlanLeadDetailView
          detail={detail}
          ctx={ctx}
          backHref={backHref}
          printPending={printPending}
          isMutating={isMutating}
          onPrint={() => void onPrint()}
          onStartWorking={() => void onStartWorking()}
          onCompleteStep={() => void onCompleteStep()}
          onReject={() => setRejectOpen(true)}
          isStarting={startWorking.isPending}
          isCompleting={completeStep.isPending}
          isRejecting={rejectLead.isPending}
        />
      </div>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.rejectTitle}</AlertDialogTitle>
            <AlertDialogDescription>{copy.rejectDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>{copy.rejectCancel}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isMutating}
              onClick={(e) => {
                e.preventDefault();
                void runReject();
              }}
            >
              {copy.rejectConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AdminPlanLeadDetailInner() {
  const ctx = usePlanDetailContext();
  if (!ctx) {
    return <p className="text-destructive">Invalid plan</p>;
  }
  return <AdminPlanLeadDetailContent ctx={ctx} />;
}

export default function AdminPlanLeadDetailPage() {
  return <AdminPlanLeadDetailInner />;
}
