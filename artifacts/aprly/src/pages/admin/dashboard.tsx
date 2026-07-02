import { useState } from "react";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
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
import { AdminNavIcon } from "@/components/admin/AdminNavIcon";
import { adminContent } from "@/content/admin";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d" | "12m";

const USER_CHART = {
  subscribed: { label: "Subscribed", color: "var(--success-theme-500)" },
  unsubscribed: { label: "Unsubscribed", color: "var(--accent-theme-500)" },
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
    <div className="admin-dash-period-tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={cn(
            "admin-dash-period-tab app-text-p2-regular",
            value === t.id ? "admin-dash-period-tab--active" : "text-average",
          )}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
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
    <div className="admin-dash-trend-row">
      <div>
        <p className="admin-dash-trend-label">{label}</p>
        <p className="admin-dash-trend-value mt-1">{value}</p>
      </div>
      <p
        className={cn(
          "flex items-center gap-1 text-sm font-semibold",
          up ? "admin-dash-trend-change--up" : "admin-dash-trend-change--down",
        )}
      >
        {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
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
      <div className="flex items-center gap-3">
        <span className="admin-page-title-icon">
          <AdminNavIcon name="dashboard" className="h-5 w-5 text-[var(--primary-theme-950)]" />
        </span>
        <h1 className="app-header-h6 text-average">{adminContent.dashboard.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="admin-dash-card">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="admin-dash-card-title">{adminContent.dashboard.users}</h2>
            <span className="admin-dash-card-total">{data.users.total}</span>
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
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  className="admin-dash-legend-dot"
                  style={{ background: "var(--success-theme-500)" }}
                />
                <span className="admin-dash-legend-label">Subscribed</span>
              </span>
              <span className="admin-dash-legend-value">
                {data.users.subscribed}/{data.users.total} ({data.users.subscribedPercent}%)
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  className="admin-dash-legend-dot"
                  style={{ background: "var(--accent-theme-500)" }}
                />
                <span className="admin-dash-legend-label">Unsubscribed</span>
              </span>
              <span className="admin-dash-legend-value">
                {data.users.unsubscribed}/{data.users.total} ({data.users.unsubscribedPercent}%)
              </span>
            </li>
          </ul>
        </section>

        <section className="admin-dash-card">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="admin-dash-card-title">{adminContent.dashboard.newRegistrations}</h2>
              <p className="admin-dash-card-hint mt-1">{adminContent.dashboard.newRegistrationsHint}</p>
            </div>
            <PeriodTabs value={period} onChange={setPeriod} />
          </div>
          <ChartContainer
            config={{ count: { label: "Users", color: "var(--success-theme-500)" } }}
            className="mt-4 h-[260px] w-full"
          >
            <BarChart data={data.newRegistrations}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={32} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="admin-dash-card">
          <h2 className="admin-dash-card-title">{adminContent.dashboard.revenue}</h2>
          <p className="admin-dash-card-hint mt-1">{adminContent.dashboard.revenueHint}</p>
          <div className="admin-dash-revenue-periods">
            {data.revenueTrends.map((card) => (
              <div key={card.label} className="admin-dash-revenue-period">
                <TrendCard
                  label={card.label}
                  value={card.value}
                  changePercent={card.changePercent}
                  direction={card.changeDirection}
                />
              </div>
            ))}
          </div>
        </section>
        <section className="admin-dash-card">
          <h2 className="admin-dash-card-title">{adminContent.dashboard.mrr}</h2>
          <p className="admin-dash-card-hint mt-1">{adminContent.dashboard.mrrHint}</p>
          <ChartContainer
            config={{ value: { label: "MRR", color: "var(--info-theme-500)" } }}
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
  return <AdminDashboardContent />;
}
