import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, FileBarChart2, Database, LogOut, Settings, Users, Sun, Moon, BarChart2 } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { name: "Home", href: "/pdf-upload", icon: Home },
  { name: "Reports", href: "/reports", icon: FileBarChart2 },
  { name: "Custom Datasets", href: "/custom", icon: Database },
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
];

const adminNavItems = [
  { name: "User Management", href: "/admin/users", icon: Users },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isDark, toggleTheme } = useTheme();

  const isAdmin = user?.publicMetadata?.role === "admin";
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => { if (!isMobile) setOpen(true); }}
      onMouseLeave={() => { if (!isMobile) setOpen(false); }}
    >
      <SidebarHeader className="h-12 flex items-center justify-center border-b border-sidebar-border bg-sidebar p-0">
        <div className="flex items-center gap-3 font-bold text-sidebar-foreground w-full pl-4 pr-3">
          <BarChart2 className="w-5 h-5 flex-shrink-0 text-primary" />
          <span className="truncate flex-1 group-data-[state=collapsed]:hidden">
            Financial Analytics
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location === item.href ||
                      (item.href !== "/dashboard" && location.startsWith(item.href))
                    }
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
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.href || location.startsWith(item.href)}
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
            <SidebarMenuButton onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile" onClick={() => setOpenMobile(false)}>
                <Settings className="w-4 h-4" />
                <span>Account settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
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
