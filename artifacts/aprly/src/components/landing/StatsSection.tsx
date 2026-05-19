import { Card, CardContent } from "@/components/ui/card";
import { statsContent } from "@/content/landing";

export function StatsSection() {
  return (
    <section className="px-4 pb-12 cabinet:pb-16">
      <div className="app-page-marketing max-w-5xl">
        <div className="grid grid-cols-1 gap-4 cabinet:grid-cols-3 cabinet:gap-6">
          {statsContent.map((stat) => (
            <Card
              key={stat.id}
              className="border-border/40 bg-card text-card-foreground shadow-sm"
            >
              <CardContent className="flex flex-col items-center justify-center gap-2 py-6 cabinet:py-8">
                <span className="text-3xl font-extrabold tracking-tight text-primary cabinet:text-4xl">
                  {stat.value}
                </span>
                <span className="text-center text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground cabinet:text-sm">
                  {stat.label}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
