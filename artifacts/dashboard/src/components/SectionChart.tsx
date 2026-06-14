import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, type ExtractedSection } from "@/lib/reports";

function formatValue(v: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);
}

export function SectionChart({ section, currency }: { section: ExtractedSection; currency: string }) {
  const data = section.items.map((item, i) => ({
    ...item,
    fill: item.color ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{section.name}</CardTitle>
        <CardDescription className="text-xs">{section.items.length} items</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          {section.chartType === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100}
                label={({ label, percent }) => `${label} (${(percent * 100).toFixed(1)}%)`} labelLine>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${currency}${formatValue(v)}`, ""]} />
            </PieChart>
          ) : section.chartType === "line" ? (
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${currency}${formatValue(v)}`, "Value"]} />
              <Line type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} dot />
            </LineChart>
          ) : section.chartType === "area" ? (
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${currency}${formatValue(v)}`, "Value"]} />
              <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} fill={`${CHART_COLORS[0]}33`} strokeWidth={2} />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }}
                angle={data.length > 6 ? -30 : 0}
                textAnchor={data.length > 6 ? "end" : "middle"}
                height={data.length > 6 ? 50 : 30} />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${currency}${formatValue(v)}`, "Value"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>

        <div className="mt-3 border-t pt-3">
          <div className="max-h-40 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b">
                  <th className="text-left py-1 font-medium">Label</th>
                  <th className="text-right py-1 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1 flex items-center gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      {item.label}
                    </td>
                    <td className="py-1 text-right font-mono">
                      {currency}{item.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
