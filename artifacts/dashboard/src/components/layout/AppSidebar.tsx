import { Link, useLocation } from "wouter";
import { LayoutDashboard, ListTree, TrendingUp, PiggyBank, FileSpreadsheet, Database, LogOut, Settings, Users, FileSearch, Sun, Moon } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget Categories", href: "/categories", icon: ListTree },
  { name: "Historical Trends", href: "/trends", icon: TrendingUp },
  { name: "Own Revenues", href: "/revenues", icon: PiggyBank },
  { name: "Balance Sheet", href: "/balance-sheet", icon: FileSpreadsheet },
];

const customNavItems = [
  { name: "Custom Datasets", href: "/custom", icon: Database },
  { name: "PDF Report Analyser", href: "/pdf-upload", icon: FileSearch },
];

const adminNavItems = [
  { name: "User Management", href: "/admin/users", icon: Users },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { setOpenMobile } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isDark, toggleTheme } = useTheme();

  const isAdmin = user?.publicMetadata?.role === "admin";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="h-16 flex items-center px-3 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-2 font-bold text-sidebar-foreground w-full overflow-hidden">
          <span className="truncate flex-1 group-data-[state=collapsed]:hidden">
            Financial Analytics
          </span>
          <SidebarTrigger className="flex-shrink-0 p-1.5 rounded hover:bg-sidebar-accent/60 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground [&>svg]:w-4 [&>svg]:h-4" />
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
                    isActive={location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href))}
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

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
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
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={isDark ? "Light mode" : "Dark mode"}
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Account settings">
              <Link href="/profile" onClick={() => setOpenMobile(false)}>
                <Settings className="w-4 h-4" />
                <span>Account settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
