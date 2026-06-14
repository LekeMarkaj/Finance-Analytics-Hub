import { useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, ArrowRight, FileBarChart2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { API } from "@/lib/reports";
import { useState } from "react";

export default function PdfUploadPage() {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

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
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      toast({ title: "PDF uploaded", description: "Groq AI is extracting financial data — redirecting to your report." });
      navigate(`/reports/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">PDF Report Analyser</h1>
          <p className="text-muted-foreground mt-1">
            Upload a financial PDF — Groq AI extracts the data and visualises it as interactive charts.
          </p>
        </div>
        <Link href="/reports">
          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
            <FileBarChart2 className="w-4 h-4" />
            View Reports
          </Button>
        </Link>
      </div>

      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          uploadMutation.isPending && "pointer-events-none opacity-60"
        )}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-foreground">Uploading and processing…</p>
                <p className="text-xs text-muted-foreground">Groq AI is reading your document</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Drop a PDF here, or <span className="text-primary underline underline-offset-2">click to browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Bank statements, budget exports, annual reports — up to 20 MB
                </p>
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

      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <FileBarChart2 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">After upload</p>
          <p className="text-xs text-muted-foreground">You'll be taken straight to your new report's charts and data.</p>
        </div>
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs flex-shrink-0">
            See all reports <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
