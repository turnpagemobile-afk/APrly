import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planContent } from "@/content/landing";

type PlanSectionProps = {
  onActivateClick?: () => void;
};

export function PlanSection({ onActivateClick }: PlanSectionProps) {
  const { card } = planContent;
  return (
    <section id="plan" className="scroll-mt-24 px-4 py-16 cabinet:py-24">
      <div className="app-page-marketing max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight cabinet:text-3xl">
            {planContent.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground cabinet:text-base">
            {planContent.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-xl cabinet:mt-14">
          <div className="rounded-2xl border border-primary/30 bg-[var(--info-theme-100)]/40 p-6 cabinet:p-8">
            <h3 className="text-center text-lg font-bold cabinet:text-xl">{card.heading}</h3>

            <ul className="mt-5 space-y-3 cabinet:mt-6">
              {card.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm cabinet:text-base">
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col items-center gap-2 cabinet:mt-8">
              <Button
                type="button"
                size="lg"
                disabled={card.cta.disabled}
                aria-disabled={card.cta.disabled}
                className="w-full max-w-full font-semibold cabinet:max-w-xs"
                onClick={() => {
                  if (!card.cta.disabled) onActivateClick?.();
                }}
              >
                {card.cta.label}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{card.cta.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
