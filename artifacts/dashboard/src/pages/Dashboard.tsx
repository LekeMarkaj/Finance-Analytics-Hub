import { useGetBudgetUtilizationSummary, useGetYearlyTrend, useListOwnRevenues } from "@workspace/api-client-react";
import { useYearFilter, YearFilter } from "@/components/YearFilter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatCompactCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend, Cell, PieChart, Pie } from "recharts";
import { AlertCircle, TrendingUp, PiggyBank, Target, Activity, Download, Printer } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Papa from "papaparse";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
  orange: "#f97316",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  indigo: "#6366f1"
};

const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.teal,
  CHART_COLORS.pink,
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "10px 14px", border: "1px solid #e0e0e0", color: "#1a1a1a", fontSize: "13px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
      <div style={{ marginBottom: "6px", fontWeight: 600 }}>{label}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "2px", backgroundColor: entry.color || entry.payload.fill, flexShrink: 0 }} />
          <span style={{ color: "#555" }}>{entry.name}:</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {entry.name.includes("Pct") || entry.name.includes("Rate") || entry.name.includes("Percentage")
              ? formatPercent(entry.value)
              : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function downloadCsv(filename: string, rows: object[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const year = useYearFilter(2025);
  const summaryQuery = useGetBudgetUtilizationSummary({ year }, { query: { queryKey: ['summary', year] } });
  const trendQuery = useGetYearlyTrend({ query: { queryKey: ['trend'] } });
  const revenuesQuery = useListOwnRevenues({ year }, { query: { queryKey: ['revenues', year] } });

  const loading = summaryQuery.isLoading || summaryQuery.isFetching || trendQuery.isLoading || trendQuery.isFetching || revenuesQuery.isLoading || revenuesQuery.isFetching;
  const isError = summaryQuery.isError || trendQuery.isError || revenuesQuery.isError;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  const summary = summaryQuery.data;
  const trends = trendQuery.data;
  const revenues = revenuesQuery.data;

  const handleExportCsv = () => {
    const categoryRows = (summary?.categories ?? []).map(c => ({
      Year: year,
      Category: c.name,
      "Initial Budget (€)": c.initialBudget,
      "Final Budget (€)": c.finalBudget,
      "Spent (€)": c.spent,
      "Remaining (€)": c.remaining,
      "Utilization (%)": c.utilizationPct,
    }));
    downloadCsv(`financial-overview-${year}.csv`, categoryRows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground mt-1">High-level view of financial health and budget execution.</p>
        </div>
        <div className="flex items-center gap-2">
          <YearFilter defaultYear={2025} />
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate transition-all border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /></div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Budget ({year})</p>
                  <Target className="w-4 h-4 text-blue-500 opacity-70" />
                </div>
                <p className="text-3xl font-bold text-foreground">{formatCompactCurrency(summary?.totalFinalBudget || 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  vs Initial: {formatCompactCurrency(summary?.totalInitialBudget || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /></div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Spent</p>
                  <Activity className="w-4 h-4 text-orange-500 opacity-70" />
                </div>
                <p className="text-3xl font-bold text-foreground">{formatCompactCurrency(summary?.totalSpent || 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Remaining: {formatCompactCurrency(summary?.totalRemaining || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-green-500">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /></div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Utilization Rate</p>
                  <TrendingUp className="w-4 h-4 text-green-500 opacity-70" />
                </div>
                <p className="text-3xl font-bold text-foreground">{formatPercent(summary?.overallUtilizationPct || 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Target: 100% execution
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-all border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /></div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Own Revenues</p>
                  <PiggyBank className="w-4 h-4 text-purple-500 opacity-70" />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {formatCompactCurrency(revenues?.reduce((sum, r) => sum + r.amount, 0) || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {revenues?.length || 0} active sources
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget Execution by Category</CardTitle>
            <CardDescription>Spending vs Budget allocation across main economic categories for {year}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : summary?.categories && summary.categories.length > 0 ? (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                  <BarChart data={summary.categories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} tickLine={false} />
                    <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} isAnimationActive={false} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="finalBudget" name="Final Budget" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    <Bar dataKey="spent" name="Spent" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                No category data available for {year}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Own Revenues Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Own Revenues Distribution</CardTitle>
            <CardDescription>Share of internal revenue sources</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center">
            {loading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : revenues && revenues.length > 0 ? (
              <div className="h-[350px] relative">
                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                  <PieChart>
                    <Pie
                      data={revenues}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="name"
                      isAnimationActive={false}
                    >
                      {revenues.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multi-year Trend */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Historical Budget Trend (2022-2025)</CardTitle>
            <CardDescription>Multi-year comparison of total budget vs execution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : trends && trends.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} />
                    <YAxis tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                    <Area type="monotone" dataKey="totalBudget" name="Total Budget" stroke={CHART_COLORS.blue} strokeWidth={2} fillOpacity={1} fill="url(#colorBudget)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="totalSpent" name="Total Spent" stroke={CHART_COLORS.purple} strokeWidth={2} fillOpacity={1} fill="url(#colorSpent)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                No historical trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
