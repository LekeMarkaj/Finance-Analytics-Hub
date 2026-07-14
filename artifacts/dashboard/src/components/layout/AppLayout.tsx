import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <MobileHeader />
      <SidebarInset className="font-sans">
        <div className="flex-1 overflow-auto p-4 pt-[4.5rem] pb-24 md:p-6 md:pt-6 md:pb-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
