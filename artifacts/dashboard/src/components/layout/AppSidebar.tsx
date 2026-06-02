import { Link, useLocation } from "wouter";
import { LayoutDashboard, ListTree, TrendingUp, PiggyBank, FileSpreadsheet, Database, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Budget Categories", href: "/categories", icon: ListTree },
  { name: "Historical Trends", href: "/trends", icon: TrendingUp },
  { name: "Own Revenues", href: "/revenues", icon: PiggyBank },
  { name: "Balance Sheet", href: "/balance-sheet", icon: FileSpreadsheet },
];

const customNavItems = [
  { name: "Custom Datasets", href: "/custom", icon: Database },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2 font-bold text-sidebar-foreground w-full">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">
            €
          </div>
          <span className="truncate">SHSKUK Finance</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Core Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href || (item.href !== "/" && location.startsWith(item.href))}
                    tooltip={item.name}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Custom Analysis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {customNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.href || location.startsWith(item.href)}
                    tooltip={item.name}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 text-sm text-sidebar-foreground">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center font-medium">
            AD
          </div>
          <div className="flex-1 truncate">
            <p className="font-medium truncate">Admin User</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Finance Dept</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
