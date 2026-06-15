import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Loader2, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { apiFetch, type PdfUpload } from "@/lib/reports";
import { SectionChart } from "@/components/SectionChart";

function StatusBadge({ status }: { status: PdfUpload["status"] }) {
  if (status === "processing") return (
    <Badge variant="secondary" className="gap-1">
      <Loader2 className="w-3 h-3 animate-spin" />Analysing…
    </Badge>
  );
  if (status === "done") return <Badge className="bg-cyan-600 hover:bg-cyan-700">Done</Badge>;
  return <Badge variant="destructive">Error</Badge>;
}

export default function ReportDetailPage() {
  const [location, navigate] = useLocation();
  const id = location.split("/")[2];
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: report, isLoading, error } = useQuery<PdfUpload>({
    queryKey: ["pdfUpload", id],
    queryFn: () => apiFetch(`/pdf-uploads/${id}`),
    refetchInterval: (query) => {
      if (query.state.data?.status === "processing") return 2000;
      return false;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/pdf-uploads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      toast({ title: "Report deleted" });
      navigate("/reports");
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive/40" />
        <p className="font-medium text-foreground">Report not found</p>
        <Button variant="outline" onClick={() => navigate("/reports")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />Back to Reports
        </Button>
      </div>
    );
  }

  const title = report.extractedData?.title || report.fileName.replace(/\.pdf$/i, "");
  const hasSections = report.extractedData?.sections && report.extractedData.sections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/reports")} className="gap-2 self-start -ml-2">
          <ArrowLeft className="w-4 h-4" />Reports
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground leading-snug">{title}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={report.status} />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(report.createdAt), "MMMM d, yyyy 'at' HH:mm")}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />{report.fileName}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:text-destructive hover:border-destructive/40 flex-shrink-0"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {report.extractedData?.summary && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-0.5">Summary</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{report.extractedData.summary}</p>
              </div>
              {report.extractedData.currency && (
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
                  Currency: {report.extractedData.currency}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {report.status === "processing" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <div>
            <p className="font-medium text-foreground">Analysing your document…</p>
            <p className="text-sm text-muted-foreground mt-1">Groq AI is extracting financial data. This usually takes a few seconds.</p>
          </div>
        </div>
      )}

      {report.status === "error" && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">Extraction failed</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {report.errorMessage ?? "Could not extract structured data from this document. Try uploading a different PDF."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {report.status === "done" && !hasSections && (
        <Card className="border-dashed">
          <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No structured financial data could be extracted from this document.
            </p>
          </CardContent>
        </Card>
      )}

      {hasSections && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.extractedData!.sections.map((section, i) => (
            <SectionChart key={i} section={section} currency={report.extractedData!.currency} />
          ))}
        </div>
      )}
    </div>
  );
}
