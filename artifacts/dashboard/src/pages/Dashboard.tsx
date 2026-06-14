import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { FileBarChart2, Upload, Loader2, CheckCircle2, AlertCircle, LayoutDashboard, ArrowRight } from "lucide-react";
import { format, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { apiFetch, CHART_COLORS, type PdfUpload } from "@/lib/reports";

function StatCard({ label, value, icon: Icon, color }: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentReportRow({ upload }: { upload: PdfUpload }) {
  const title = upload.extractedData?.title || upload.fileName.replace(/\.pdf$/i, "");
  const sections = upload.extractedData?.sections?.length ?? 0;

  return (
    <Link href={`/reports/${upload.id}`}>
      <div className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group">
        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${CHART_COLORS[upload.id % CHART_COLORS.length]}20` }}>
          <FileBarChart2 className="w-4 h-4" style={{ color: CHART_COLORS[upload.id % CHART_COLORS.length] }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{title}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(upload.createdAt), "MMM d, yyyy")}
            {sections > 0 && ` · ${sections} chart${sections !== 1 ? "s" : ""}`}
          </p>
        </div>
        {upload.status === "processing" && (
          <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />
        )}
        {upload.status === "done" && (
          <CheckCircle2 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
        )}
        {upload.status === "error" && (
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
        )}
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-colors" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: uploads, isLoading } = useQuery<PdfUpload[]>({
    queryKey: ["pdfUploads"],
    queryFn: () => apiFetch("/pdf-uploads"),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (Array.isArray(data) && data.some((u) => u.status === "processing")) return 2000;
      return false;
    },
  });

  const total = uploads?.length ?? 0;
  const done = uploads?.filter((u) => u.status === "done").length ?? 0;
  const processing = uploads?.filter((u) => u.status === "processing").length ?? 0;
  const totalSections = uploads?.reduce((sum, u) => sum + (u.extractedData?.sections?.length ?? 0), 0) ?? 0;

  const now = new Date();
  const monthlyData = eachMonthOfInterval({ start: subMonths(startOfMonth(now), 5), end: startOfMonth(now) }).map((month) => {
    const count = (uploads ?? []).filter((u) => {
      const d = new Date(u.createdAt);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    }).length;
    return { month: format(month, "MMM"), count };
  });

  const recent = [...(uploads ?? [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            Overview
          </h1>
          <p className="text-muted-foreground mt-1">Summary of your uploaded financial reports.</p>
        </div>
        <Link href="/pdf-upload">
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Report
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Reports" value={total} icon={FileBarChart2} color="#0079F2" />
          <StatCard label="Analysed" value={done} icon={CheckCircle2} color="#00c2d4" />
          <StatCard label="Processing" value={processing} icon={Loader2} color="#6366f1" />
          <StatCard label="Charts Extracted" value={totalSections} icon={LayoutDashboard} color="#0ea5e9" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Uploads — last 6 months</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="count" name="Reports" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Reports</CardTitle>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="text-xs gap-1 -mr-2 text-muted-foreground">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <FileBarChart2 className="w-8 h-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No reports yet.</p>
                <Link href="/pdf-upload">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-3.5 h-3.5" />Upload a report
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                {recent.map((u) => <RecentReportRow key={u.id} upload={u} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!isLoading && done > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {done} report{done !== 1 ? "s" : ""} analysed, {totalSections} chart{totalSections !== 1 ? "s" : ""} extracted
                </p>
                <p className="text-xs text-muted-foreground">View individual reports for detailed charts and data tables.</p>
              </div>
            </div>
            <Link href="/reports">
              <Button variant="outline" size="sm" className="gap-2">
                <FileBarChart2 className="w-4 h-4" />Browse Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
