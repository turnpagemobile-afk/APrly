import { Check } from "lucide-react";
import type { HardshipPortal } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type HardshipPortalStepperProps = {
  portal: HardshipPortal;
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

export function HardshipPortalStepper({ portal }: HardshipPortalStepperProps) {
  const onCta = () => {
    toast({
      title: planLeadDetailContent.hardshipCtaSoon,
      description: planLeadDetailContent.hardshipCtaSoonDescription,
    });
  };

  return (
    <ol className="space-y-0">
      {portal.steps.map((step, index) => {
        const isLast = index === portal.steps.length - 1;
        return (
          <li key={step.name} className="relative flex gap-4 pb-8">
            {!isLast ? (
              <span
                className="absolute left-[13px] top-8 h-[calc(100%-1rem)] w-px bg-border"
                aria-hidden="true"
              />
            ) : null}
            <div className="relative z-10 shrink-0 pt-0.5">
              {stepBadge(step.status, index)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-foreground">{step.name}</p>
              {step.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              ) : null}
              {step.cta && step.status === "pending" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 font-semibold"
                  onClick={onCta}
                >
                  {step.cta}
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
