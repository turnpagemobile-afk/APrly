import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminPartnerPlanLeadsQueryKey,
  useDeleteAdminPartner,
  usePatchAdminPartner,
} from "@workspace/api-client-react";
import { AdminPlanDetailBreadcrumbs } from "@/components/admin/AdminPlanDetailBreadcrumbs";
import { AdminPartnerConfirmDialog } from "@/components/admin/AdminPartnerConfirmDialog";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type AdminPartnerDetailHeaderProps = {
  partnerId: number;
  partnerName: string;
  isActive: boolean;
};

export function AdminPartnerDetailHeader({
  partnerId,
  partnerName,
  isActive,
}: AdminPartnerDetailHeaderProps) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const copy = adminContent;
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const patch = usePatchAdminPartner();
  const deletePartner = useDeleteAdminPartner();
  const pending = patch.isPending || deletePartner.isPending;

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetAdminPartnerPlanLeadsQueryKey(partnerId),
    });
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
  };

  const onDeactivateConfirm = async () => {
    try {
      await patch.mutateAsync({ id: partnerId, data: { isActive: false } });
      invalidate();
      setDeactivateOpen(false);
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const onDeleteConfirm = async () => {
    try {
      await deletePartner.mutateAsync({ id: partnerId });
      setDeleteOpen(false);
      navigate("/admin/partners");
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="admin-partner-detail-header">
        <AdminPlanDetailBreadcrumbs
          kind="partner"
          partnerId={partnerId}
          partnerName={partnerName}
        />
        <div className="admin-partner-detail-actions">
          {isActive ? (
            <button
              type="button"
              className={cn(
                "admin-partner-detail-btn admin-partner-detail-btn--deactivate app-button-button-l-m",
              )}
              disabled={pending}
              onClick={() => setDeactivateOpen(true)}
            >
              <img
                src={adminAsset("partners/detail-close.svg")}
                alt=""
                width={24}
                height={24}
                className="admin-partner-detail-btn-icon"
                aria-hidden
              />
              {copy.partnerDetail.deactivate}
            </button>
          ) : null}
          <button
            type="button"
            className={cn(
              "admin-partner-detail-btn admin-partner-detail-btn--delete app-button-button-l-m",
            )}
            disabled={pending}
            onClick={() => setDeleteOpen(true)}
          >
            <img
              src={adminAsset("partners/detail-trash.svg")}
              alt=""
              width={24}
              height={24}
              className="admin-partner-detail-btn-icon"
              aria-hidden
            />
            {copy.partnerDetail.delete}
          </button>
        </div>
      </div>

      <AdminPartnerConfirmDialog
        open={deactivateOpen}
        title={copy.partners.deactivateTitle}
        description={copy.partners.deactivateDescription}
        confirmLabel={copy.partners.confirmDeactivate}
        pending={pending}
        onConfirm={() => void onDeactivateConfirm()}
        onCancel={() => setDeactivateOpen(false)}
      />

      <AdminPartnerConfirmDialog
        open={deleteOpen}
        title={copy.partners.deleteTitle}
        description={copy.partners.deleteDescription}
        confirmLabel={copy.partners.confirmDelete}
        pending={pending}
        onConfirm={() => void onDeleteConfirm()}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
