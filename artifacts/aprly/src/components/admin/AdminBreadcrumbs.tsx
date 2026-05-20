import { Link } from "wouter";
import { cn } from "@/lib/utils";

export type AdminBreadcrumbSegment = {
  label: string;
  href?: string;
};

type AdminBreadcrumbsProps = {
  segments: AdminBreadcrumbSegment[];
  className?: string;
};

export function AdminBreadcrumbs({ segments, className }: AdminBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={`${seg.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {seg.href && !isLast ? (
                <Link
                  href={seg.href}
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {seg.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                  )}
                >
                  {seg.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
