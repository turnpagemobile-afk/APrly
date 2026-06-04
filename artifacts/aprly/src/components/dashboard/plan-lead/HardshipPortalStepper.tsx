import { Check } from "lucide-react";
import type { HardshipPortal } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type HardshipPortalStepperProps = {
  portal: HardshipPortal;
};

export function HardshipPortalStepper({ portal }: HardshipPortalStepperProps) {
  const copy = planLeadDetailContent;

  const onCta = () => {
    toast({
      title: copy.hardshipCtaSoon,
      description: copy.hardshipCtaSoonDescription,
    });
  };

  const progress = Math.min(100, Math.max(0, portal.progress));

  return (
    <section className="dash-plan-detail-portal">
      <div>
        <h2 className="dash-plan-detail-portal-title">{copy.hardshipPortalTitle}</h2>
        <p className="dash-plan-detail-portal-subtitle">{portal.stage}</p>
      </div>

      <div
        className="dash-plan-detail-portal-progress-track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="dash-plan-detail-portal-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="dash-plan-detail-portal-steps">
        {portal.steps.map((step, index) => {
          const isLast = index === portal.steps.length - 1;
          const isActive = step.status === "active";
          const isDone = step.status === "done";

          return (
            <li
              key={step.name}
              className={cn("dash-plan-detail-step", isActive && "dash-plan-detail-step--active")}
            >
              {!isLast ? <span className="dash-plan-detail-step-line" aria-hidden="true" /> : null}
              <div className="dash-plan-detail-step-badge">
                {isDone ? (
                  <span className="dash-plan-detail-step-check">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{copy.stepComplete}</span>
                  </span>
                ) : (
                  <span className="dash-plan-detail-step-number">{index + 1}</span>
                )}
              </div>
              <div className="dash-plan-detail-step-content">
                <div className="dash-plan-detail-step-row">
                  <p className="dash-plan-detail-step-name">{step.name}</p>
                  {isDone ? (
                    <span className="dash-plan-detail-step-pill dash-plan-detail-step-pill--done">
                      {copy.stepComplete}
                    </span>
                  ) : null}
                  {isActive ? (
                    <span className="dash-plan-detail-step-pill dash-plan-detail-step-pill--active">
                      {copy.stepInProgress}
                    </span>
                  ) : null}
                </div>
                {step.description ? (
                  <p className="dash-plan-detail-step-desc">{step.description}</p>
                ) : null}
                {step.cta && step.status === "pending" ? (
                  <button type="button" className="dash-plan-detail-step-cta" onClick={onCta}>
                    {step.cta}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
