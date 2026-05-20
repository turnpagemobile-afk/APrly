import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Handshake, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetAdminPartnersQueryKey,
  useDeleteAdminPartner,
  useGetAdminPartners,
  usePatchAdminPartner,
  usePostAdminPartner,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function AdminPartnersContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const params = useMemo(
    () => ({ search: search.trim(), page, pageSize }),
    [search, page, pageSize],
  );

  const { data, isLoading } = useGetAdminPartners(params, {
    query: { queryKey: getGetAdminPartnersQueryKey(params) },
  });

  const postPartner = usePostAdminPartner();
  const patchPartner = usePatchAdminPartner();
  const deletePartner = useDeleteAdminPartner();

  const invalidatePartners = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/partners"] });
  };

  const total = data?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      await postPartner.mutateAsync({ data: { name } });
      toast({ title: adminContent.partnerDetail.saved });
      setCreateOpen(false);
      setNewName("");
      setPage(1);
      invalidatePartners();
    } catch {
      toast({ title: "Could not create partner", variant: "destructive" });
    }
  };

  const setActive = async (id: number, isActive: boolean) => {
    try {
      await patchPartner.mutateAsync({ id, data: { isActive } });
      invalidatePartners();
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
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
        icon={Handshake}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {adminContent.partners.createPartner}
          </Button>
        }
      />

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
                    {adminContent.partners.rowNumber}
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.partners.company}
                  </TableHead>
                  <TableHead className="w-24 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.partners.onReview}
                  </TableHead>
                  <TableHead className="w-24 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.partners.inProgress}
                  </TableHead>
                  <TableHead className="w-28 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.partners.created}
                  </TableHead>
                  <TableHead className="w-32 text-xs font-medium uppercase text-muted-foreground">
                    {adminContent.partners.status}
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No partners
                    </TableCell>
                  </TableRow>
                ) : (
                  data.partners.map((p, index) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{(page - 1) * pageSize + index + 1}</TableCell>
                      <TableCell className="font-semibold text-foreground">{p.name}</TableCell>
                      <TableCell>{p.onReviewCount}</TableCell>
                      <TableCell>{p.inProgressCount}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                      <TableCell className="font-semibold">
                        {p.isActive ? adminContent.partners.active : adminContent.partners.deactivated}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" aria-label="Actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/partners/${p.id}`}>{adminContent.partners.menuView}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => void setActive(p.id, !p.isActive)}
                              disabled={patchPartner.isPending}
                            >
                              {p.isActive ? adminContent.partners.menuDeactivate : adminContent.partners.menuActivate}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(p.id)}
                            >
                              {adminContent.partners.menuDelete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
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
                onClick={() => setPage((x) => Math.max(1, x - 1))}
              >
                {adminContent.partners.prev}
              </Button>
              <span className="text-sm text-muted-foreground">{adminContent.partners.rangeOf(from, to, total)}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= lastPage}
                onClick={() => setPage((x) => x + 1)}
              >
                {adminContent.partners.next}
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{adminContent.partners.newPartnerTitle}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="new-partner-name">{adminContent.partners.newPartnerName}</Label>
            <Input
              id="new-partner-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {adminContent.partners.cancel}
            </Button>
            <Button type="button" onClick={() => void onCreate()} disabled={postPartner.isPending}>
              {adminContent.partners.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{adminContent.partners.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{adminContent.partners.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{adminContent.partners.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onDelete()}>{adminContent.partners.confirmDelete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPartnersPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <AdminPartnersContent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}
