import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { Upload, FileText, Trash2, ChevronDown, ChevronUp, AlertCircle, Loader2, FileUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = `${BASE}/api`;

const CHART_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#d97706", "#7c3aed",
  "#0891b2", "#db2777", "#65a30d", "#ea580c", "#6366f1",
];

interface ExtractedItem { label: string; value: number; color?: string; }
interface ExtractedSection { name: string; chartType: "bar" | "line" | "pie" | "area"; items: ExtractedItem[]; }
interface ExtractedData { title: string; summary: string; currency: string; sections: ExtractedSection[]; }
interface PdfUpload {
  id: number;
  fileName: string;
  status: "processing" | "done" | "error";
  errorMessage?: string;
  extractedData?: ExtractedData;
  createdAt: string;
  updatedAt: string;
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { credentials: "include", ...opts });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

function useUploads() {
  return useQuery<PdfUpload[]>({
    queryKey: ["pdfUploads"],
    queryFn: () => apiFetch("/pdf-uploads"),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (Array.isArray(data) && data.some((u) => u.status === "processing")) return 2000;
      return false;
    },
  });
}

export default function PdfUploadPage() {
  const { data: uploads, isLoading } = useUploads();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/pdf-upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      toast({ title: "PDF uploaded", description: "Groq AI is extracting financial data — this takes a few seconds." });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/pdf-uploads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      toast({ title: "Upload deleted" });
    },
  });

  const handleFile = useCallback((file: File | null | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file type", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 20 MB.", variant: "destructive" });
      return;
    }
    uploadMutation.mutate(file);
  }, [uploadMutation, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">PDF Report Analyser</h1>
        <p className="text-muted-foreground mt-1">
          Upload a financial PDF — Groq AI extracts the data and visualises it as interactive charts.
        </p>
      </div>

      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          uploadMutation.isPending && "pointer-events-none opacity-60"
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-medium text-foreground">Uploading and processing…</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Drop a PDF here, or <span className="text-primary underline underline-offset-2">click to browse</span>
                </p>
                <p className="text-xs text-muted-foreground">Bank statements, budget exports, annual reports — up to 20 MB</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : uploads && uploads.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Uploaded Reports</h2>
          {uploads.map((upload) => (
            <UploadCard
              key={upload.id}
              upload={upload}
              expanded={expandedId === upload.id}
              onToggle={() => setExpandedId(expandedId === upload.id ? null : upload.id)}
              onDelete={() => deleteMutation.mutate(upload.id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === upload.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-muted-foreground">
          <FileText className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-sm">No PDFs uploaded yet. Drop a financial report above to get started.</p>
        </div>
      )}
    </div>
  );
}

function UploadCard({
  upload, expanded, onToggle, onDelete, deleting
}: {
  upload: PdfUpload;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const hasData = upload.status === "done" && upload.extractedData?.sections && upload.extractedData.sections.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn("flex items-center gap-3 flex-1 min-w-0", hasData && "cursor-pointer")}
            onClick={hasData ? onToggle : undefined}
          >
            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{upload.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(upload.createdAt), "MMM d, yyyy 'at' HH:mm")}
              </p>
            </div>
            <StatusBadge status={upload.status} />
            {hasData && (
              expanded
                ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {upload.status === "processing" && (
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Groq AI is extracting financial data…</span>
          </div>
        </CardContent>
      )}

      {upload.status === "error" && (
        <CardContent className="pt-0 pb-4">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{upload.errorMessage ?? "Extraction failed. Please try another PDF."}</span>
          </div>
        </CardContent>
      )}

      {upload.status === "done" && upload.extractedData && !hasData && (
        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground italic">
            No structured financial data could be extracted from this document.
          </p>
        </CardContent>
      )}

      {hasData && expanded && (
        <CardContent className="pt-0 space-y-6 pb-6">
          <div className="border-t pt-4 space-y-1">
            <h3 className="font-semibold text-foreground">{upload.extractedData!.title}</h3>
            <p className="text-sm text-muted-foreground">{upload.extractedData!.summary}</p>
            {upload.extractedData!.currency && (
              <p className="text-xs text-muted-foreground">Currency: {upload.extractedData!.currency}</p>
            )}
          </div>
          {upload.extractedData!.sections.map((section, i) => (
            <SectionChart key={i} section={section} currency={upload.extractedData!.currency} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: PdfUpload["status"] }) {
  if (status === "processing") return <Badge variant="secondary" className="text-xs gap-1"><Loader2 className="w-3 h-3 animate-spin" />Processing</Badge>;
  if (status === "done") return <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">Done</Badge>;
  return <Badge variant="destructive" className="text-xs">Error</Badge>;
}

function SectionChart({ section, currency }: { section: ExtractedSection; currency: string }) {
  const data = section.items.map((item, i) => ({
    ...item,
    fill: item.color ?? CHART_COLORS[i % CHART_COLORS.length],
  }));

  const formatValue = (v: number) =>
    new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

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
              <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label={({ label, percent }) => `${label} (${(percent * 100).toFixed(1)}%)`} labelLine>
                {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
              <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={data.length > 6 ? -30 : 0} textAnchor={data.length > 6 ? "end" : "middle"} height={data.length > 6 ? 50 : 30} />
              <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${currency}${formatValue(v)}`, "Value"]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
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
