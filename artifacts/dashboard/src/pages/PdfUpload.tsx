import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import PdfUploadDropzone from "@/components/PdfUploadDropzone";

export default function PdfUploadPage() {
  const [, navigate] = useLocation();
  const { user } = useUser();

  const storedName = user ? (localStorage.getItem(`profile_fullname_${user.id}`) ?? "") : "";
  const fullName = storedName || user?.username || "there";

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Hi <span className="text-primary">{fullName}</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Upload a financial PDF — AI extracts the data and visualises it as interactive charts.
          </p>
        </div>

        <PdfUploadDropzone onSuccess={(data) => navigate(`/reports/${data.id}`)} />
      </div>
    </div>
  );
}
