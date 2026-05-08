import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planContent } from "@/content/landing";

export function PlanSection() {
  const { card } = planContent;
  return (
    <section id="plan" className="px-4 py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {planContent.title}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            {planContent.subtitle}
          </p>
        </div>

        <div className="mt-10 md:mt-14 mx-auto max-w-xl">
          <div className="rounded-2xl border border-primary/30 bg-[var(--info-theme-100)]/40 p-6 md:p-8">
            <h3 className="text-center text-lg md:text-xl font-bold">
              {card.heading}
            </h3>

            <ul className="mt-5 md:mt-6 space-y-3">
              {card.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-sm md:text-base"
                >
                  <CheckCircle2
                    className="h-5 w-5 text-primary shrink-0"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-foreground/90">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7 md:mt-8 flex flex-col items-center gap-2">
              <Button
                type="button"
                size="lg"
                disabled={card.cta.disabled}
                aria-disabled={card.cta.disabled}
                className="w-full max-w-xs font-semibold"
              >
                {card.cta.label}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {card.cta.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
