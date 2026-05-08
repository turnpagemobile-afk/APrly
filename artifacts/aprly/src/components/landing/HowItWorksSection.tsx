import { Image as ImageIcon, Banknote, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { howItWorksContent, type HowIconKey } from "@/content/landing";

const ICONS: Record<HowIconKey, LucideIcon> = {
  image: ImageIcon,
  money: Banknote,
  plan: FileText,
};

export function HowItWorksSection() {
  return (
    <section id="how" className="px-4 py-16 md:py-24 scroll-mt-24">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {howItWorksContent.title}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground">
            {howItWorksContent.subtitle}
          </p>
        </div>

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {howItWorksContent.items.map((item, i) => {
            const Icon = ICONS[item.iconKey];
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center px-2"
              >
                <Icon
                  className="h-10 w-10 text-foreground"
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-base md:text-lg font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
