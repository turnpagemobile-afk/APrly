import { useState } from "react";
import { LayoutDashboard, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { useGetAdminDashboardSummary } from "@workspace/api-client-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { adminContent } from "@/content/admin";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "12m";

const USER_CHART = {
  subscribed: { label: "Subscribed", color: "var(--chart-1)" },
  unsubscribed: { label: "Unsubscribed", color: "var(--chart-3)" },
} as const;

function PeriodTabs({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const tabs: { id: Period; label: string }[] = [
    { id: "7d", label: adminContent.dashboard.period7d },
    { id: "30d", label: adminContent.dashboard.period30d },
    { id: "12m", label: adminContent.dashboard.period12m },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Button
          key={t.id}
          type="button"
          size="sm"
          variant={value === t.id ? "default" : "outline"}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}

function TrendCard({
  label,
  value,
  changePercent,
  direction,
}: {
  label: string;
  value: string;
  changePercent: number;
  direction: "up" | "down";
}) {
  const up = direction === "up";
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-bold text-foreground">{value}</p>
      <p
        className={cn(
          "mt-1 flex items-center gap-1 text-xs font-medium",
          up ? "text-emerald-500" : "text-destructive",
        )}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : "-"}
        {Math.abs(changePercent)}%
      </p>
    </div>
  );
}

function AdminDashboardContent() {
  const [period, setPeriod] = useState<Period>("30d");
  const { data, isLoading } = useGetAdminDashboardSummary({ period });

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pieData = [
    { name: "subscribed", value: data.users.subscribed, fill: "var(--color-subscribed)" },
    { name: "unsubscribed", value: data.users.unsubscribed, fill: "var(--color-unsubscribed)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-foreground">{adminContent.dashboard.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-bold text-foreground">{adminContent.dashboard.users}</h2>
            <span className="text-sm font-semibold text-muted-foreground">{data.users.total}</span>
          </div>
          <ChartContainer config={USER_CHART} className="mx-auto h-[220px] max-w-[280px]">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Subscribed</span>
              <span className="font-semibold">
                {data.users.subscribed}/{data.users.total} ({data.users.subscribedPercent}%)
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Unsubscribed</span>
              <span className="font-semibold">
                {data.users.unsubscribed}/{data.users.total} ({data.users.unsubscribedPercent}%)
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-foreground">{adminContent.dashboard.newRegistrations}</h2>
              <p className="text-sm text-muted-foreground">{adminContent.dashboard.newRegistrationsHint}</p>
            </div>
            <PeriodTabs value={period} onChange={setPeriod} />
          </div>
          <ChartContainer config={{ count: { label: "Users", color: "var(--chart-2)" } }} className="h-[260px] w-full">
            <BarChart data={data.newRegistrations}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm xl:col-span-1">
          <h2 className="font-bold">{adminContent.dashboard.revenue}</h2>
          <p className="text-sm text-muted-foreground">{adminContent.dashboard.revenueHint}</p>
          <div className="mt-4 grid gap-3">
            {data.revenueTrends.map((card) => (
              <TrendCard
                key={card.label}
                label={card.label}
                value={card.value}
                changePercent={card.changePercent}
                direction={card.changeDirection}
              />
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm xl:col-span-1">
          <h2 className="font-bold">{adminContent.dashboard.churn}</h2>
          <p className="text-sm text-muted-foreground">{adminContent.dashboard.churnHint}</p>
          <div className="mt-4 grid gap-3">
            {data.churnTrends.map((card) => (
              <TrendCard
                key={card.label}
                label={card.label}
                value={card.value}
                changePercent={card.changePercent}
                direction={card.changeDirection}
              />
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm md:col-span-2 xl:col-span-1">
          <h2 className="font-bold">{adminContent.dashboard.mrr}</h2>
          <p className="text-sm text-muted-foreground">{adminContent.dashboard.mrrHint}</p>
          <ChartContainer
            config={{ value: { label: "MRR", color: "var(--chart-2)" } }}
            className="mt-4 h-[200px] w-full"
          >
            <AreaChart data={data.mrrSeries}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={48} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                fill="var(--color-value)"
                fillOpacity={0.2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </ChartContainer>
        </section>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <AdminDashboardContent />
      </AdminShell>
    </AdminProtectedRoute>
  );
}
