import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminInfoField = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

type AdminInfoGridProps = {
  title: string;
  fields: AdminInfoField[];
  className?: string;
};

export function AdminInfoGrid({ title, fields, className }: AdminInfoGridProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/60 bg-card p-6 shadow-sm",
        className,
      )}
    >
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {field.label}
            </dt>
            <dd className={cn("mt-1 text-sm font-semibold text-foreground", field.valueClassName)}>
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
