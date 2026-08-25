import type { HardshipPortal, HardshipStep } from "@workspace/api-client-react";
import { planLeadDetailContent } from "@/content/plan-lead-detail";
import { cabinetAsset } from "@/lib/cabinet-assets";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type HardshipPortalStepperProps = {
  portal: HardshipPortal;
  renderActiveStepActions?: (step: HardshipStep) => ReactNode;
  activeStepActionsPlacement?: "inline" | "below";
};

function stepCardClass(status: HardshipStep["status"]): string {
  switch (status) {
    case "done":
      return "dash-plan-detail-step--done";
    case "active":
      return "dash-plan-detail-step--active";
    default:
      return "dash-plan-detail-step--pending";
  }
}

export function HardshipPortalStepper({
  portal,
  renderActiveStepActions,
  activeStepActionsPlacement = "inline",
}: HardshipPortalStepperProps) {
  const copy = planLeadDetailContent;
  const progress = Math.min(100, Math.max(0, portal.progress));

  return (
    <section className="dash-plan-detail-portal">
      <div>
        <h2 className="app-header-h6 text-average">{copy.hardshipPortalTitle}</h2>
        <p className="app-text-p1-regular text-average mt-1">{copy.hardshipPortalSubtitle}</p>
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
          const prevDone = index > 0 && portal.steps[index - 1].status === "done";

          const activeActions =
            isActive && renderActiveStepActions ? renderActiveStepActions(step) : null;

          return (
            <li key={step.name} className="dash-plan-detail-step">
              <div className={cn("dash-plan-detail-step-card", stepCardClass(step.status))}>
                {!isLast ? (
                  <span
                    className={cn(
                      "dash-plan-detail-step-line",
                      index === 0
                        ? "dash-plan-detail-step-line--first"
                        : "dash-plan-detail-step-line--continued",
                      isDone ? "dash-plan-detail-step-line--done" : "dash-plan-detail-step-line--pending",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                {isLast && index > 0 ? (
                  <span
                    className={cn(
                      "dash-plan-detail-step-line dash-plan-detail-step-line--ingress",
                      prevDone ? "dash-plan-detail-step-line--done" : "dash-plan-detail-step-line--pending",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="dash-plan-detail-step-badge">
                  {isDone ? (
                    <img
                      src={cabinetAsset("cabinet/dashboard/checked.svg")}
                      alt=""
                      aria-hidden
                      className="dash-plan-detail-step-icon"
                    />
                  ) : isActive ? (
                    <img
                      src={cabinetAsset("cabinet/dashboard/flag.svg")}
                      alt=""
                      aria-hidden
                      className="dash-plan-detail-step-icon"
                    />
                  ) : (
                    <span className="dash-plan-detail-step-number app-text-p1-bold text-average">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="dash-plan-detail-step-content">
                  <div className="dash-plan-detail-step-row">
                    <p className="app-header-subheadline-bold text-average min-w-0">{step.name}</p>
                    {isDone ? (
                      <span className="dash-plan-detail-step-pill dash-plan-detail-step-pill--done app-text-p2-bold">
                        {copy.stepComplete}
                      </span>
                    ) : null}
                    {isActive ? (
                      <span className="dash-plan-detail-step-pill dash-plan-detail-step-pill--active app-text-p2-bold">
                        {copy.stepInProgress}
                      </span>
                    ) : null}
                    {isActive && activeStepActionsPlacement === "inline" ? activeActions : null}
                  </div>
                  {step.description ? (
                    <p className="app-text-p1-regular text-average mt-1">{step.description}</p>
                  ) : null}
                  {isActive && activeStepActionsPlacement === "below" ? activeActions : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
