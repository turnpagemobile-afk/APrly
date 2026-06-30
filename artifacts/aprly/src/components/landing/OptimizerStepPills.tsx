import { StepProgressPills } from "@/components/shared/StepProgressPills";

type OptimizerStepPillsProps = {
  step: 1 | 2 | 3;
};

export function OptimizerStepPills({ step }: OptimizerStepPillsProps) {
  return (
    <StepProgressPills
      totalSteps={3}
      currentStep={step}
      variant="audit"
      className="mt-5 w-[154px] gap-[9px] bp600:mt-6"
    />
  );
}
