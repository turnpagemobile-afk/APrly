import { Card, CardContent } from "@/components/ui/card";
import { statsContent } from "@/content/landing";

export function StatsSection() {
  return (
    <section className="px-4 pb-12 md:pb-16">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {statsContent.map((stat) => (
            <Card
              key={stat.id}
              className="border-border/40 bg-card text-card-foreground shadow-sm"
            >
              <CardContent className="flex flex-col items-center justify-center py-6 md:py-8 gap-2">
                <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary">
                  {stat.value}
                </span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground text-center">
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
