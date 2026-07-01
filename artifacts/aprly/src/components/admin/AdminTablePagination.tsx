import { adminContent } from "@/content/admin";
import { adminAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";

function pageWindow(current: number, lastPage: number, size = 5): number[] {
  const half = Math.floor(size / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(lastPage, start + size - 1);
  start = Math.max(1, end - size + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type AdminTablePaginationProps = {
  page: number;
  lastPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

export function AdminTablePagination({
  page,
  lastPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: AdminTablePaginationProps) {
  const pages = pageWindow(page, lastPage);

  return (
    <>
      <div className="admin-table-pagination-nav">
        <button
          type="button"
          className="admin-table-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <img
            src={adminAsset("users/pagination-first.svg")}
            alt=""
            className="admin-table-pagination-icon"
          />
        </button>
        <button
          type="button"
          className="admin-table-pagination-btn"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <img
            src={adminAsset("users/pagination-next.svg")}
            alt=""
            className="admin-table-pagination-icon admin-table-pagination-icon--prev"
          />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={cn(
              "admin-table-pagination-page",
              p === page && "admin-table-pagination-page--active",
            )}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="admin-table-pagination-btn"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <img
            src={adminAsset("users/pagination-next.svg")}
            alt=""
            className="admin-table-pagination-icon"
          />
        </button>
        <button
          type="button"
          className="admin-table-pagination-btn"
          disabled={page >= lastPage}
          onClick={() => onPageChange(lastPage)}
          aria-label="Last page"
        >
          <img
            src={adminAsset("users/pagination-last.svg")}
            alt=""
            className="admin-table-pagination-icon"
          />
        </button>
        <span className="ml-2 hidden sm:inline">
          {adminContent.users.pagesOf(page, lastPage)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span>{adminContent.partners.rowsPerPage}</span>
        <select
          aria-label={adminContent.partners.rowsPerPage}
          value={String(pageSize)}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="admin-table-rows-select"
        >
          {pageSizeOptions.map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
