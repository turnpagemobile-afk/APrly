import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, Users } from "lucide-react";
import {
  getGetAdminUsersQueryKey,
  useGetAdminUsers,
} from "@workspace/api-client-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { AdminListPageHeader } from "@/components/admin/AdminListPageHeader";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const params = useMemo(
    () => ({ tab, search: search.trim(), page, pageSize }),
    [tab, search, page, pageSize],
  );

  const { data, isLoading } = useGetAdminUsers(params, {
    query: {
      queryKey: getGetAdminUsersQueryKey(params),
    },
  });

  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const onTab = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminListPageHeader
        title={adminContent.users.title}
        icon={Users}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
      />

      <div className="flex border-b border-border/60">
        <button
          type="button"
          className={cn(
            "flex-1 py-3 text-sm font-semibold transition-colors",
            tab === "subscribed"
              ? "border-b-2 border-primary text-[var(--tabs-title-selected)]"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onTab("subscribed")}
        >
          {adminContent.users.subscribedTab(data?.tabCounts.subscribed ?? 0)}
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 py-3 text-sm font-semibold transition-colors",
            tab === "unsubscribed"
              ? "border-b-2 border-primary text-[var(--tabs-title-selected)]"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onTab("unsubscribed")}
        >
          {adminContent.users.unsubscribedTab(data?.tabCounts.unsubscribed ?? 0)}
        </button>
      </div>

      {isLoading || !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-14 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.users.rowNumber}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.users.name}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.users.email}
                  </TableHead>
                  <TableHead className="w-16 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.users.level}
                  </TableHead>
                  <TableHead className="w-20 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.users.plans}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.users.registrationDate}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No users
                    </TableCell>
                  </TableRow>
                ) : (
                  data.users.map((u, index) => (
                    <TableRow
                      key={u.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setLocation(`/admin/users/${u.id}`)}
                    >
                      <TableCell className="font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatName(u.firstName ?? undefined, u.lastName ?? undefined)}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.level}</TableCell>
                      <TableCell>{u.planCount}</TableCell>
                      <TableCell className="text-muted-foreground">{formatWhen(u.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{adminContent.partners.rowsPerPage}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
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
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {adminContent.partners.prev}
              </Button>
              <span className="text-sm text-muted-foreground">{adminContent.partners.rangeOf(from, to, total)}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                {adminContent.partners.next}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <AdminUsersContent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}
