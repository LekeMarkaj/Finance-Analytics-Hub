import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, Trash2, Loader2, FileBarChart2, Upload, AlertCircle, BarChart3, MoreVertical, Link2, Plus, X, Globe, Lock } from "lucide-react";
import { format } from "date-fns";
import { apiFetch, type PdfUpload, type ApiError } from "@/lib/reports";
import { ToastAction } from "@/components/ui/toast";

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
  const sectionCount = upload.extractedData?.sections?.length ?? 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const visibilityMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      apiFetch(`/pdf-uploads/${upload.id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic }),
      }),
    onSuccess: (updated: PdfUpload) => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      queryClient.setQueryData(["pdfUpload", String(upload.id)], updated);
      toast({ title: updated.isPublic ? "Report is now public" : "Report is now private" });
    },
    onError: (err: Error) => {
      toast({ title: "Could not update visibility", description: err.message, variant: "destructive" });
    },
  });

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/reports/${upload.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied" });
    });
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    visibilityMutation.mutate(!upload.isPublic);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

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
        </div>

        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2 flex-1">{title}</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-0.5"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                  <Link2 className="w-4 h-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleVisibility}
                  disabled={visibilityMutation.isPending}
                  className="gap-2 cursor-pointer"
                >
                  {visibilityMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : upload.isPublic ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {upload.isPublic ? "Make private" : "Make public"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format(new Date(upload.createdAt), "MMM d, yyyy")}</span>
            {upload.status !== "done" && (
              <>
                <span>·</span>
                <StatusBadge status={upload.status} />
              </>
            )}
            {upload.isPublic && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1 text-primary">
                  <Globe className="w-3 h-3" />Public
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: () => apiFetch("/pdf-uploads/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    }),
    onSuccess: (report: PdfUpload) => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      onOpenChange(false);
      setTitle("");
      navigate(`/reports/${report.id}`);
    },
    onError: (err: ApiError) => {
      if (err.code === "QUOTA_EXCEEDED") {
        onOpenChange(false);
        toast({
          title: "Report limit reached",
          description: err.message,
          variant: "destructive",
          action: (
            <ToastAction altText="Upgrade" onClick={() => navigate("/profile")}>
              Upgrade
            </ToastAction>
          ),
        });
        return;
      }
      toast({ title: "Could not create report", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || createMutation.isPending) return;
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!createMutation.isPending) { onOpenChange(next); if (!next) setTitle(""); } }}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new report</DialogTitle>
            <DialogDescription>
              Start with a blank report and add charts manually — no PDF required.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="report-title">Report title</Label>
            <Input
              id="report-title"
              autoFocus
              placeholder="e.g. Q3 Marketing Budget"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!title.trim() || createMutation.isPending} className="gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [, navigate] = useLocation();
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
    const title = u.extractedData?.title || u.fileName;
    return title.toLowerCase().includes(search.toLowerCase());
  });

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
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Report
          </Button>
          <Button className="gap-2" onClick={() => navigate("/pdf-upload")}>
            <Upload className="w-4 h-4" />
            Upload Report
          </Button>
        </div>
      </div>

      <CreateReportDialog open={createOpen} onOpenChange={setCreateOpen} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search reports…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
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
              {search ? "No matching reports" : "No reports yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try adjusting your search."
                : "Upload a PDF report to get started."}
            </p>
          </div>
          {!search && (
            <Link href="/pdf-upload">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />Upload a report
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
