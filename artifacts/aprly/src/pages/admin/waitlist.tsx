import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getGetAdminWaitlistQueryKey,
  useGetAdminWaitlist,
} from "@workspace/api-client-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminListPageHeader } from "@/components/admin/AdminListPageHeader";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { AdminUsersSearchEmpty } from "@/components/admin/AdminUsersSearchEmpty";
import { AdminUsersSearchStatus } from "@/components/admin/AdminUsersSearchStatus";
import { adminContent } from "@/content/admin";

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

function AdminWaitlistContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchQuery = search.trim();
  const isSearchActive = searchQuery.length > 0;

  const params = useMemo(
    () => ({ search: searchQuery, page, pageSize }),
    [searchQuery, page, pageSize],
  );

  const { data, isLoading } = useGetAdminWaitlist(params, {
    query: {
      queryKey: getGetAdminWaitlistQueryKey(params),
    },
  });

  const lastPage = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const hasSearchResults = (data?.total ?? 0) > 0;
  const showSearchEmpty = isSearchActive && !isLoading && data && !hasSearchResults;

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title={adminContent.waitlist.title}
        icon="waitlist"
        search={search}
        searchPlaceholder={adminContent.waitlist.searchPlaceholder}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
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
                    <AdminDataTable.HeadCell>{adminContent.waitlist.rowNumber}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.waitlist.email}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.waitlist.signedUp}</AdminDataTable.HeadCell>
                  </AdminDataTable.Header>
                  <AdminDataTable.Body>
                    {data.signups.length === 0 ? (
                      <AdminDataTable.Row>
                        <AdminDataTable.Cell colSpan={3}>{adminContent.waitlist.empty}</AdminDataTable.Cell>
                      </AdminDataTable.Row>
                    ) : (
                      data.signups.map((signup, index) => (
                        <AdminDataTable.Row key={signup.id}>
                          <AdminDataTable.Cell>{(page - 1) * pageSize + index + 1}</AdminDataTable.Cell>
                          <AdminDataTable.Cell bold>{signup.email}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>{formatWhen(String(signup.createdAt))}</AdminDataTable.Cell>
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
    </div>
  );
}

export default function AdminWaitlistPage() {
  return <AdminWaitlistContent />;
}
