import { Card, CardContent } from "@/components/ui/card";
import { dashboardStatsContent } from "@/content/dashboard-home";

export function DashboardStatsRow() {
  return (
    <section className="grid grid-cols-1 gap-4 px-4 pb-8 cabinet:grid-cols-3">
      {dashboardStatsContent.map((stat) => (
        <Card
          key={stat.id}
          className="border-border/40 bg-card text-card-foreground shadow-sm"
        >
          <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
            <span className="text-3xl font-extrabold tracking-tight text-primary">
              {stat.value}
            </span>
            <span className="text-center text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {stat.label}
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
