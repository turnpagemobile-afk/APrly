import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { heroContent } from "@/content/landing";

export interface HeroSectionProps {
  onSeeOptimizer: () => void;
}

export function HeroSection({ onSeeOptimizer }: HeroSectionProps) {
  return (
    <section className="relative px-4 py-16 cabinet:py-24">
      <div className="app-page-marketing">
        <div className="grid items-center gap-10 cabinet:grid-cols-[1.2fr_1fr] cabinet:gap-14">
          <div className="flex min-w-0 flex-col items-center text-center cabinet:items-start cabinet:text-left">
            <h1 className="font-black leading-[1.05] tracking-tight text-4xl cabinet:text-5xl cabinet:text-6xl">
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

            <p className="mt-8 max-w-xl text-base font-semibold text-foreground/90 cabinet:mt-10 cabinet:text-lg">
              {heroContent.subtitle}
            </p>

            <div className="mt-8">
              <Button
                size="lg"
                onClick={onSeeOptimizer}
                className="w-full font-semibold cabinet:w-auto"
              >
                {heroContent.cta.label}
              </Button>
            </div>
          </div>

          <div
            role="img"
            aria-label={heroContent.imageAlt}
            className="relative flex aspect-[4/3] w-full min-w-0 items-center justify-center rounded-2xl border border-border/40 bg-[var(--info-theme-200)]/40"
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
