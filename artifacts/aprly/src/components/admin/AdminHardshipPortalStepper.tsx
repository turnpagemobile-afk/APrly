import { Check } from "lucide-react";
import type { HardshipPortal } from "@workspace/api-client-react";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminHardshipPortalStepperProps = {
  portal: HardshipPortal;
  canCompleteStep: boolean;
  canReject: boolean;
  onComplete: () => void;
  onReject: () => void;
  isCompleting?: boolean;
  isRejecting?: boolean;
};

function stepBadge(status: HardshipPortal["steps"][number]["status"], index: number) {
  if (status === "done") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Complete</span>
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-7 min-w-[7rem] items-center justify-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground">
        In progress
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
      {index + 1}
    </span>
  );
}

export function AdminHardshipPortalStepper({
  portal,
  canCompleteStep,
  canReject,
  onComplete,
  onReject,
  isCompleting,
  isRejecting,
}: AdminHardshipPortalStepperProps) {
  const copy = adminContent.adminPlanDetail;

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">{copy.portalTitle}</h2>
          <p className="text-sm text-muted-foreground">{copy.portalSubtitle}</p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {portal.stage} · ETA: {portal.etaDays} days
        </p>
      </div>
      <ol className="space-y-0">
        {portal.steps.map((step, index) => {
          const isLast = index === portal.steps.length - 1;
          const isActive = step.status === "active";
          return (
            <li key={step.name} className="relative flex gap-4 pb-8">
              {!isLast ? (
                <span
                  className="absolute left-[13px] top-8 h-[calc(100%-1rem)] w-px bg-border"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative z-10 shrink-0 pt-0.5">{stepBadge(step.status, index)}</div>
              <div
                className={cn(
                  "min-w-0 flex-1 rounded-lg border p-4",
                  isActive ? "border-primary/40 bg-card" : "border-transparent",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-bold text-foreground">{step.name}</p>
                  {isActive && (canCompleteStep || canReject) ? (
                    <div className="flex shrink-0 gap-2">
                      {canCompleteStep ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isCompleting || isRejecting}
                          onClick={onComplete}
                        >
                          {copy.complete}
                        </Button>
                      ) : null}
                      {canReject ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-destructive/50 text-destructive hover:bg-destructive/10"
                          disabled={isCompleting || isRejecting}
                          onClick={onReject}
                        >
                          {copy.reject}
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {step.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
