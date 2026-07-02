import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import {
  getGetAdminUsersQueryKey,
  useGetAdminUsers,
} from "@workspace/api-client-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminListPageHeader } from "@/components/admin/AdminListPageHeader";
import { AdminTabBar } from "@/components/admin/AdminTabBar";
import { AdminTablePagination } from "@/components/admin/AdminTablePagination";
import { AdminUsersSearchEmpty } from "@/components/admin/AdminUsersSearchEmpty";
import { AdminUsersSearchStatus } from "@/components/admin/AdminUsersSearchStatus";
import { adminContent } from "@/content/admin";

type Tab = "subscribed" | "unsubscribed";

function formatName(first: string | null | undefined, last: string | null | undefined) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  const s = `${a} ${b}`.trim();
  return s || "—";
}

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

function AdminUsersContent() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("subscribed");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchQuery = search.trim();
  const isSearchActive = searchQuery.length > 0;

  const params = useMemo(
    () => ({ tab, search: searchQuery, page, pageSize }),
    [tab, searchQuery, page, pageSize],
  );

  const { data, isLoading } = useGetAdminUsers(params, {
    query: {
      queryKey: getGetAdminUsersQueryKey(params),
    },
  });

  const lastPage = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const hasSearchResults = (data?.total ?? 0) > 0;
  const showSearchEmpty = isSearchActive && !isLoading && data && !hasSearchResults;

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const onTab = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  const tabs = useMemo(
    () => [
      { id: "subscribed" as const, label: adminContent.users.activeTab(data?.tabCounts.subscribed ?? 0) },
      {
        id: "unsubscribed" as const,
        label: adminContent.users.nonactiveTab(data?.tabCounts.unsubscribed ?? 0),
      },
    ],
    [data?.tabCounts.subscribed, data?.tabCounts.unsubscribed],
  );

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title={adminContent.users.title}
        icon="users"
        search={search}
        searchPlaceholder={adminContent.users.searchPlaceholder}
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
          <AdminTabBar tabs={tabs} value={tab} onChange={onTab} />

          {isLoading || !data ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AdminDataTable>
              <AdminDataTable.Scroll>
                <AdminDataTable.Table>
                  <AdminDataTable.Header>
                    <AdminDataTable.HeadCell>{adminContent.users.id}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.users.user}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.users.email}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.users.plans}</AdminDataTable.HeadCell>
                    <AdminDataTable.HeadCell>{adminContent.users.registrationDate}</AdminDataTable.HeadCell>
                  </AdminDataTable.Header>
                  <AdminDataTable.Body>
                    {data.users.length === 0 ? (
                      <AdminDataTable.Row>
                        <AdminDataTable.Cell colSpan={5}>{adminContent.users.empty}</AdminDataTable.Cell>
                      </AdminDataTable.Row>
                    ) : (
                      data.users.map((u, index) => (
                        <AdminDataTable.Row
                          key={u.id}
                          onClick={() => setLocation(`/admin/users/${u.id}`)}
                        >
                          <AdminDataTable.Cell>{(page - 1) * pageSize + index + 1}</AdminDataTable.Cell>
                          <AdminDataTable.Cell bold>
                            {formatName(u.firstName ?? undefined, u.lastName ?? undefined)}
                          </AdminDataTable.Cell>
                          <AdminDataTable.Cell>{u.email}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>{u.planCount}</AdminDataTable.Cell>
                          <AdminDataTable.Cell>{formatWhen(u.createdAt)}</AdminDataTable.Cell>
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

export default function AdminUsersPage() {
  return <AdminUsersContent />;
}
