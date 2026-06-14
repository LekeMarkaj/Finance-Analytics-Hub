import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, Trash2, Loader2, FileBarChart2, Upload, AlertCircle, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { apiFetch, type PdfUpload } from "@/lib/reports";

type StatusFilter = "all" | "done" | "processing" | "error";

const STATUS_COLORS = ["#0079F2", "#00c2d4", "#6366f1", "#0ea5e9", "#38bdf8", "#818cf8"];

function reportGradient(id: number) {
  const i = id % STATUS_COLORS.length;
  return `linear-gradient(135deg, ${STATUS_COLORS[i]}22 0%, ${STATUS_COLORS[(i + 2) % STATUS_COLORS.length]}33 100%)`;
}

function StatusBadge({ status }: { status: PdfUpload["status"] }) {
  if (status === "processing") return (
    <Badge variant="secondary" className="text-xs gap-1">
      <Loader2 className="w-3 h-3 animate-spin" />Processing
    </Badge>
  );
  if (status === "done") return <Badge className="text-xs bg-cyan-600 hover:bg-cyan-700">Done</Badge>;
  return <Badge variant="destructive" className="text-xs">Error</Badge>;
}

function ReportCard({ upload, onDelete, deleting }: {
  upload: PdfUpload;
  onDelete: () => void;
  deleting: boolean;
}) {
  const title = upload.extractedData?.title || upload.fileName.replace(/\.pdf$/i, "");
  const summary = upload.extractedData?.summary;
  const sectionCount = upload.extractedData?.sections?.length ?? 0;

  return (
    <Link href={`/reports/${upload.id}`}>
      <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden hover:border-primary/40">
        <div className="h-32 relative flex items-center justify-center"
          style={{ background: reportGradient(upload.id) }}>
          {upload.status === "processing" ? (
            <Loader2 className="w-10 h-10 text-primary animate-spin opacity-60" />
          ) : upload.status === "error" ? (
            <AlertCircle className="w-10 h-10 text-destructive opacity-60" />
          ) : sectionCount > 0 ? (
            <BarChart3 className="w-10 h-10 text-primary opacity-50" />
          ) : (
            <FileText className="w-10 h-10 text-primary opacity-40" />
          )}
          {sectionCount > 0 && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-0.5 text-xs font-medium text-foreground">
              {sectionCount} {sectionCount === 1 ? "chart" : "charts"}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>

        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2 flex-1">{title}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StatusBadge status={upload.status} />
            <span>·</span>
            <span>{format(new Date(upload.createdAt), "MMM d, yyyy")}</span>
          </div>
          {summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{summary}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: uploads, isLoading } = useQuery<PdfUpload[]>({
    queryKey: ["pdfUploads"],
    queryFn: () => apiFetch("/pdf-uploads"),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (Array.isArray(data) && data.some((u) => u.status === "processing")) return 2000;
      return false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/pdf-uploads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      toast({ title: "Report deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const filtered = (uploads ?? []).filter((u) => {
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const title = u.extractedData?.title || u.fileName;
    const matchSearch = title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCounts = {
    all: uploads?.length ?? 0,
    done: uploads?.filter((u) => u.status === "done").length ?? 0,
    processing: uploads?.filter((u) => u.status === "processing").length ?? 0,
    error: uploads?.filter((u) => u.status === "error").length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileBarChart2 className="w-7 h-7 text-primary" />
            Reports
          </h1>
          <p className="text-muted-foreground mt-1">All uploaded and analysed financial reports.</p>
        </div>
        <Link href="/pdf-upload">
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Report
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search reports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted/60 rounded-md p-1 w-fit">
          {(["all", "done", "processing", "error"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1 opacity-60">({statusCounts[s]})</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-32 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {search || statusFilter !== "all" ? "No matching reports" : "No reports yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Upload a PDF report to get started."}
            </p>
          </div>
          {!search && statusFilter === "all" && (
            <Link href="/pdf-upload">
              <Button variant="outline" className="gap-2 mt-2">
                <Upload className="w-4 h-4" />
                Upload your first report
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((upload) => (
            <ReportCard
              key={upload.id}
              upload={upload}
              onDelete={() => deleteMutation.mutate(upload.id)}
              deleting={deleteMutation.isPending && deleteMutation.variables === upload.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
