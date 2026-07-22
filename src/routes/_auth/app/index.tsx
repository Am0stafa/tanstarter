import { createFileRoute } from "@tanstack/react-router";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "#/components/ui/chart";
import { useAuthSuspense } from "#/lib/auth/hooks";
import { customers, monthlyRevenue } from "#/lib/demo/customers";
import { formatCompact, formatCurrency, formatDelta } from "#/lib/format";

export const Route = createFileRoute("/_auth/app/")({
  component: DashboardPage,
});

/**
 * Chart series are colored exclusively through the --chart-* theme tokens
 * (see .agents/design.md) so they follow light/dark mode automatically.
 */
const revenueChartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

const customersChartConfig = {
  newCustomers: { label: "New customers", color: "var(--chart-2)" },
} satisfies ChartConfig;

/** Demo stats derived from the in-memory dataset; swap for real aggregates. */
function computeStats() {
  const current = monthlyRevenue.at(-1)!;
  const previous = monthlyRevenue.at(-2)!;
  const active = customers.filter((c) => c.status === "active").length;
  const churned = customers.filter((c) => c.status === "churned").length;

  return {
    mrr: current.revenue,
    mrrDelta: ((current.revenue - previous.revenue) / previous.revenue) * 100,
    totalCustomers: customers.length,
    newDelta: ((current.newCustomers - previous.newCustomers) / previous.newCustomers) * 100,
    active,
    churnRate: (churned / customers.length) * 100,
  };
}

function DashboardPage() {
  const { user } = useAuthSuspense();
  const stats = computeStats();

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with your product this month.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Monthly recurring revenue"
          value={formatCurrency(stats.mrr)}
          delta={stats.mrrDelta}
        />
        <StatCard
          label="Total customers"
          value={String(stats.totalCustomers)}
          delta={stats.newDelta}
        />
        <StatCard label="Active subscriptions" value={String(stats.active)} />
        <StatCard label="Churn rate" value={`${stats.churnRate.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CardDescription>Monthly recurring revenue, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
              <AreaChart data={monthlyRevenue} margin={{ left: -12, right: 8 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  tickFormatter={(value: number) => formatCompact(value)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">New customers</CardTitle>
            <CardDescription>Signups per month, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={customersChartConfig} className="h-64 w-full">
              <BarChart data={monthlyRevenue} margin={{ left: -12, right: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={4} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  /** Percentage change vs previous month; omitted → no trend badge. */
  delta?: number;
}) {
  // A flat month reads as steady (up icon), not as a decline.
  const isPositive = delta !== undefined && delta >= 0;

  return (
    <Card className="gap-2">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-heading text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {delta !== undefined && (
        <CardContent>
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            {isPositive ? (
              <TrendingUpIcon className="size-3 text-chart-1" />
            ) : (
              <TrendingDownIcon className="size-3 text-destructive" />
            )}
            {formatDelta(delta)} vs last month
          </Badge>
        </CardContent>
      )}
    </Card>
  );
}
