import type { ButtonHTMLAttributes } from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, type ExtractedSection } from "@/lib/reports";
import { GripVertical, Pencil, Trash2, ArrowLeftRight } from "lucide-react";

function formatValue(v: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);
}

interface SectionChartProps {
  section: ExtractedSection;
  currency: string;
  isEditing?: boolean;
  dragHandleProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  onToggleWidth?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

export function SectionChart({ section, currency, isEditing, dragHandleProps, onToggleWidth, onEdit, onDelete }: SectionChartProps) {
  const isMobile = useIsMobile();
  const data = section.items.map((item, i) => ({
    ...item,
    fill: item.color ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <Card className="bg-muted/30 relative">
      {isEditing && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-md border p-0.5 shadow-sm" data-testid={`chart-toolbar-${section.name}`}>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 cursor-grab active:cursor-grabbing" title={`Drag to reorder: ${section.name}`} {...dragHandleProps}>
            <GripVertical className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleWidth} title={`Toggle width: ${section.name}`}>
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title={`Edit data: ${section.name}`}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={onDelete} title={`Remove chart: ${section.name}`}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold pr-24">{section.name}</CardTitle>
        <CardDescription className="text-xs">{section.items.length} items</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={section.chartType === "pie" && isMobile ? 200 : 280}>
          {section.chartType === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={isMobile ? 65 : 100}
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
