import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { PanelLeft } from "lucide-react";

function MobileTrigger() {
  const { isMobile, openMobile } = useSidebar();
  if (!isMobile || openMobile) return null;
  return (
    <SidebarTrigger className="fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-md bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground transition-colors md:hidden">
      <PanelLeft className="w-4 h-4" />
    </SidebarTrigger>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans">
        <AppSidebar />
        <MobileTrigger />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
