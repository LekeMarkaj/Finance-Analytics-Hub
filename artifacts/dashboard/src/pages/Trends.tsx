import { useGetYearlyTrend, useListYearlyComparisons } from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatCompactCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, LineChart, Line, ComposedChart, Cell } from "recharts";
import { TrendingUp, Activity, ArrowUpRight } from "lucide-react";

const CHART_COLORS = {
  blue:   "#0079F2",
  purple: "#6366f1",
  green:  "#00c2d4",
  red:    "#818cf8"
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ backgroundColor: "#fff", borderRadius: "6px", padding: "10px 14px", border: "1px solid #e0e0e0", color: "#1a1a1a", fontSize: "13px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
      <div style={{ marginBottom: "6px", fontWeight: 600 }}>{label}</div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          <span style={{ color: "#555" }}>{entry.name}:</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {entry.name.includes("Pct") || entry.name.includes("Rate") || entry.name.includes("Percentage") || entry.name.includes("Growth")
              ? formatPercent(entry.value)
              : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Trends() {
  // `useGetYearlyTrend` handles the aggregated view, while `useListYearlyComparisons` could fetch raw table rows.
  // Actually the prompt says `useGetYearlyTrend(options?)` but also `useListYearlyComparisons`. 
  // Let's use `useGetYearlyTrend`. Wait, looking at the API schema earlier, `useGetYearlyTrend` might return an array of `YearlyComparison`.
  const { data: trends, isLoading, isFetching } = useListYearlyComparisons({ query: { queryKey: ['yearlyComparisons'] } });
  
  const loading = isLoading || isFetching;

  // Compute YoY growth for spent
  const processedData = trends?.sort((a, b) => a.year - b.year).map((trend, i, arr) => {
    let growth = 0;
    if (i > 0 && arr[i-1].totalSpent > 0) {
      growth = ((trend.totalSpent - arr[i-1].totalSpent) / arr[i-1].totalSpent) * 100;
    }
    return {
      ...trend,
      yoyGrowth: growth,
      utilizationDisplay: trend.utilizationPct // Already in 0-100 format if from DB or 0-1 depending on schema. Let's assume 0-100 based on standard. Wait, if it's 0-1, we format it. The formatPercent divides by 100.
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Historical Trends</h1>
        <p className="text-muted-foreground mt-1">Analyze budget execution and spending patterns over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget vs. Spent (2022-2025)</CardTitle>
            <CardDescription>Overall financial envelope evolution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[350px]" />
            ) : (
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                  <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} />
                    <YAxis yAxisId="left" tickFormatter={formatCompactCurrency} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} isAnimationActive={false} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar yAxisId="left" dataKey="totalBudget" name="Total Budget" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} isAnimationActive={false} barSize={40} />
                    <Bar yAxisId="left" dataKey="totalSpent" name="Total Spent" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} isAnimationActive={false} barSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="utilizationPct" name="Utilization Rate" stroke={CHART_COLORS.green} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year-over-Year Spending Growth</CardTitle>
            <CardDescription>Percentage change in actual spending compared to previous year</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[250px]" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%" debounce={0}>
                  <BarChart data={processedData.filter(d => d.yoyGrowth !== 0)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#d1d5db" }} />
                    <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} isAnimationActive={false} />
                    <Bar dataKey="yoyGrowth" name="YoY Growth" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                      {processedData.filter(d => d.yoyGrowth !== 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.yoyGrowth >= 0 ? CHART_COLORS.blue : CHART_COLORS.red} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary Data</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Year</th>
                      <th className="px-4 py-3 text-right">Budget</th>
                      <th className="px-4 py-3 text-right">Spent</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg rounded-br-lg">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.map((row) => (
                      <tr key={row.year} className="border-b last:border-0 border-border">
                        <td className="px-4 py-3 font-medium">{row.year}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(row.totalBudget)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(row.totalSpent)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={row.utilizationPct > 95 ? "text-destructive font-medium" : ""}>
                            {formatPercent(row.utilizationPct)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
