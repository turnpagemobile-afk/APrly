import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/content/landing";

export interface HeroSectionProps {
  onSeeOptimizer: () => void;
}

export function HeroSection({ onSeeOptimizer }: HeroSectionProps) {
  return (
    <section className="relative px-4 py-16 md:py-24 lg:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="grid items-center gap-10 md:gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="font-black tracking-tight leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              {heroContent.taglineLines.map((line, i) => (
                <span key={i} className="block">
                  <span
                    className={`text-primary${
                      line.underlineLead
                        ? " underline underline-offset-4 decoration-[0.08em]"
                        : ""
                    }`}
                  >
                    {line.lead}
                  </span>
                  <span className="text-foreground">{line.rest}</span>
                </span>
              ))}
            </h1>

            <p className="mt-8 md:mt-10 max-w-xl text-base md:text-lg font-semibold text-foreground/90">
              {heroContent.subtitle}
            </p>

            <div className="mt-8">
              <Button
                size="lg"
                onClick={onSeeOptimizer}
                className="font-semibold"
              >
                {heroContent.cta.label}
              </Button>
            </div>
          </div>

          <div
            role="img"
            aria-label={heroContent.imageAlt}
            className="relative aspect-[4/3] w-full rounded-2xl bg-[var(--info-theme-200)]/40 border border-border/40 flex items-center justify-center"
          >
            <ImageIcon
              className="h-12 w-12 text-muted-foreground/40"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
