import {
  HARDSHIP_STEP_DEFINITIONS,
  HARDSHIP_STEPS_TOTAL,
} from "./hardship-steps";

type HardshipStep = {
  name: string;
  status: "done" | "active" | "pending";
  description?: string;
  cta?: string;
};

export type HardshipPortal = {
  stage: string;
  progress: number;
  etaDays: number;
  steps: HardshipStep[];
};

export function buildHardshipPortal(completedSteps: number): HardshipPortal {
  const completed = Math.max(0, Math.min(completedSteps, HARDSHIP_STEPS_TOTAL));
  const steps: HardshipStep[] = HARDSHIP_STEP_DEFINITIONS.map((def, index) => {
    let status: HardshipStep["status"] = "pending";
    if (index < completed) status = "done";
    else if (index === completed && completed < HARDSHIP_STEPS_TOTAL) status = "active";

    return {
      name: def.name,
      description: def.description,
      ...(def.cta ? { cta: def.cta } : {}),
      status,
    };
  });

  const activeStep = steps.find((s) => s.status === "active");
  const stage =
    completed >= HARDSHIP_STEPS_TOTAL
      ? "Complete"
      : (activeStep?.name ?? HARDSHIP_STEP_DEFINITIONS[0]?.name ?? "Hardship Portal");

  const progress =
    completed >= HARDSHIP_STEPS_TOTAL
      ? 100
      : Math.round(((completed + 0.5) / HARDSHIP_STEPS_TOTAL) * 100);

  const etaDays = completed >= HARDSHIP_STEPS_TOTAL ? 0 : Math.max(1, 9 - completed);

  return { stage, progress, etaDays, steps };
}
