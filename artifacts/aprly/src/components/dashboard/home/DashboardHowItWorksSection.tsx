import { CreditCard, LineChart, ListChecks, type LucideIcon } from "lucide-react";
import {
  dashboardHowItWorksContent,
  type DashboardHowIconKey,
} from "@/content/dashboard-home";

const ICONS: Record<DashboardHowIconKey, LucideIcon> = {
  connect: CreditCard,
  audit: LineChart,
  optimize: ListChecks,
};

export function DashboardHowItWorksSection() {
  return (
    <section className="bg-muted/30 px-4 py-12">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold tracking-tight">
          {dashboardHowItWorksContent.title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
          {dashboardHowItWorksContent.subtitle}
        </p>
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-10 cabinet:grid-cols-3 cabinet:gap-8">
        {dashboardHowItWorksContent.items.map((item) => {
          const Icon = ICONS[item.iconKey];
          return (
            <li key={item.title} className="flex gap-4 cabinet:flex-col cabinet:items-center cabinet:text-center">
              <Icon className="mt-0.5 h-10 w-10 shrink-0 text-foreground cabinet:mt-0" aria-hidden="true" />
              <div>
                <h3 className="text-base font-bold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
