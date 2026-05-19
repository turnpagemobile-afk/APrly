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
    <section id="how" className="scroll-mt-24 px-4 py-16 cabinet:py-24">
      <div className="app-page-marketing">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight cabinet:text-3xl">
            {howItWorksContent.title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground cabinet:text-base">
            {howItWorksContent.subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 cabinet:mt-14 cabinet:grid-cols-3 cabinet:gap-10">
          {howItWorksContent.items.map((item, i) => {
            const Icon = ICONS[item.iconKey];
            return (
              <div key={i} className="flex flex-col items-center px-2 text-center">
                <Icon className="h-10 w-10 text-foreground" aria-hidden="true" />
                <h3 className="mt-5 text-base font-bold text-primary cabinet:text-lg">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground cabinet:text-[15px]">
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
