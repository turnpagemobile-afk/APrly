import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminPartnersQueryKey,
  useDeleteAdminPartner,
  useGetAdminPartners,
  usePatchAdminPartner,
} from "@workspace/api-client-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminListPageHeader } from "@/components/admin/AdminListPageHeader";
import { AdminPartnerConfirmDialog } from "@/components/admin/AdminPartnerConfirmDialog";
import { AdminPartnerRowMenu } from "@/components/admin/AdminPartnerRowMenu";
import { AdminPartnerStatusBadge } from "@/components/admin/AdminPartnerStatusBadge";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { AdminUsersSearchEmpty } from "@/components/admin/AdminUsersSearchEmpty";
import { AdminUsersSearchStatus } from "@/components/admin/AdminUsersSearchStatus";
import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { toast } from "@/hooks/use-toast";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminPartnersContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deactivateId, setDeactivateId] = useState<number | null>(null);

  const searchQuery = search.trim();
  const isSearchActive = searchQuery.length > 0;

  const params = useMemo(
    () => ({ search: searchQuery, page, pageSize }),
    [searchQuery, page, pageSize],
  );

  const { data, isLoading } = useGetAdminPartners(params, {
    query: { queryKey: getGetAdminPartnersQueryKey(params) },
  });

  const patchPartner = usePatchAdminPartner();
  const deletePartner = useDeleteAdminPartner();

  const lastPage = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const hasSearchResults = (data?.total ?? 0) > 0;
  const showSearchEmpty = isSearchActive && !isLoading && data && !hasSearchResults;

  const invalidatePartners = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const setActive = async (id: number, isActive: boolean) => {
    try {
      await patchPartner.mutateAsync({ id, data: { isActive } });
      invalidatePartners();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const onDeactivateConfirm = async () => {
    if (deactivateId == null) return;
    await setActive(deactivateId, false);
    setDeactivateId(null);
  };

  const onActivate = async (id: number) => {
    await setActive(id, true);
  };

  const onDelete = async () => {
    if (deleteId == null) return;
    try {
      await deletePartner.mutateAsync({ id: deleteId });
      setDeleteId(null);
      if (data && data.partners.length === 1 && page > 1) setPage((p) => p - 1);
      invalidatePartners();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title={adminContent.partners.title}
        icon="partners"
        search={search}
        searchPlaceholder={adminContent.partners.searchPlaceholder}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        actions={
          <button type="button" disabled className="admin-partners-create-btn app-button-button-l-m">
            <img
              src={adminAsset("partners/plus.svg")}
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
            {adminContent.partners.createPartner}
          </button>
        }
      />

      {isSearchActive && !isLoading && data ? (
        <AdminUsersSearchStatus
          message={
            hasSearchResults
              ? adminContent.users.searchResults(data.total, searchQuery)
              : adminContent.users.noSearchResults(searchQuery)
          }
          onClear={clearSearch}
        />
      ) : null}

      {showSearchEmpty ? (
        <AdminUsersSearchEmpty />
      ) : (
        <>
          {isLoading || !data ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AdminDataTable>
              <AdminDataTable.Scroll>
                <AdminDataTable.Table>
                  <AdminDataTable.Header>
                    <AdminDataTable.HeadCell>{adminContent.partners.id}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.partners.company}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.partners.onReview}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.partners.inProgress}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.partners.created}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.partners.status}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell className="w-12">
                      <span className="sr-only">Actions</span>
                    </AdminDataTable.HeadCell>
                  </AdminDataTable.Header>
                  <AdminDataTable.Body>
                    {data.partners.length === 0 ? (
                      <AdminDataTable.Row>
                        <AdminDataTable.Cell colSpan={7}>{adminContent.partners.empty}</AdminDataTable.Cell>
                      </AdminDataTable.Row>
                    ) : (
                      data.partners.map((p, index) => (
                        <AdminDataTable.Row key={p.id}>
                          <AdminDataTable.Cell>{(page - 1) * pageSize + index + 1}</AdminDataTable.Cell>
                          <AdminDataTable.Cell bold>{p.name}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>{p.onReviewCount}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>{p.inProgressCount}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>{formatWhen(String(p.createdAt))}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>
                            <AdminPartnerStatusBadge isActive={p.isActive} />
                          </AdminDataTable.Cell>
                          <AdminDataTable.Cell className="text-right">
                            <AdminPartnerRowMenu
                              partnerId={p.id}
                              isActive={p.isActive}
                              onDeactivate={() => setDeactivateId(p.id)}
                              onActivate={() => void onActivate(p.id)}
                              onDelete={() => setDeleteId(p.id)}
                              disabled={patchPartner.isPending || deletePartner.isPending}
                            />
                          </AdminDataTable.Cell>
                        </AdminDataTable.Row>
                      ))
                    )}
                  </AdminDataTable.Body>
                </AdminDataTable.Table>
              </AdminDataTable.Scroll>
              <AdminDataTable.Footer>
                <AdminTablePagination
                  page={page}
                  lastPage={lastPage}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </AdminDataTable.Footer>
            </AdminDataTable>
          )}
        </>
      )}

      <AdminPartnerConfirmDialog
        open={deleteId != null}
        title={adminContent.partners.deleteTitle}
        description={adminContent.partners.deleteDescription}
        confirmLabel={adminContent.partners.confirmDelete}
        pending={deletePartner.isPending}
        onConfirm={() => void onDelete()}
        onCancel={() => setDeleteId(null)}
      />

      <AdminPartnerConfirmDialog
        open={deactivateId != null}
        title={adminContent.partners.deactivateTitle}
        description={adminContent.partners.deactivateDescription}
        confirmLabel={adminContent.partners.confirmDeactivate}
        pending={patchPartner.isPending}
        onConfirm={() => void onDeactivateConfirm()}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  );
}

export default function AdminPartnersPage() {
  return <AdminPartnersContent />;
}
