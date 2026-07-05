export const CHART_COLORS = [
  "#0079F2", "#00c2d4", "#0ea5e9", "#6366f1", "#818cf8",
  "#38bdf8", "#0284c7", "#4f46e5", "#93c5fd", "#a5b4fc",
];

export interface ExtractedItem { label: string; value: number; color?: string; }
export interface ExtractedSection { name: string; chartType: "bar" | "line" | "pie" | "area"; items: ExtractedItem[]; width?: "half" | "full"; }
export interface ExtractedData { title: string; summary: string; currency: string; sections: ExtractedSection[]; }
export interface PdfUpload {
  id: number;
  fileName: string;
  status: "processing" | "done" | "error";
  errorMessage?: string;
  extractedData?: ExtractedData;
  isPublic: boolean;
  isOwner?: boolean;
  createdAt: string;
  updatedAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
export const API = `${BASE}/api`;

export async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, { credentials: "include", ...opts });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
