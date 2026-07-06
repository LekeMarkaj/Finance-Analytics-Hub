import { useRef, useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { API } from "@/lib/reports";
import type { ApiError } from "@/lib/reports";

interface PdfUploadDropzoneProps {
  onSuccess?: (data: { id: number }) => void;
  className?: string;
}

export default function PdfUploadDropzone({ onSuccess, className }: PdfUploadDropzoneProps) {
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
        const err: ApiError = new Error(body.error ?? `HTTP ${res.status}`);
        if (body.code) err.code = body.code;
        throw err;
      }
      return res.json() as Promise<{ id: number }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pdfUploads"] });
      toast({ title: "PDF uploaded", description: "AI is extracting financial data \u2014 taking you to your report." });
      onSuccess?.(data);
    },
    onError: (err: ApiError) => {
      if (err.code === "QUOTA_EXCEEDED") {
        toast({
          title: "Upload limit reached",
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
    <div className={className}>
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
      </Card>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />
    </div>
  );
}
