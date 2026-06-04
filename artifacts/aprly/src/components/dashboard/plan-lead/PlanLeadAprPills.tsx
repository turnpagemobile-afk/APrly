import { cabinetAsset } from "@/lib/cabinet-assets";

type PlanLeadAprPillsProps = {
  currentApr: number;
  targetApr: number;
};

export function PlanLeadAprPills({ currentApr, targetApr }: PlanLeadAprPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="dash-apr-current">{currentApr.toFixed(2)}%</span>
      <img
        src={cabinetAsset("cabinet/dashboard/litl-arrow.svg")}
        alt=""
        aria-hidden
        className="h-3 w-3.5 shrink-0"
      />
      <span className="dash-apr-target">{targetApr.toFixed(1)}%</span>
    </div>
  );
}
