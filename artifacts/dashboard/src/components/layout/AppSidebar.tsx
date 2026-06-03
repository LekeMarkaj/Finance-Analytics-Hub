import { Link, useLocation } from "wouter";
import { LayoutDashboard, ListTree, TrendingUp, PiggyBank, FileSpreadsheet, Database, LogOut, Settings, Users, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
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
  useSidebar,
} from "@/components/ui/sidebar";

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

  const isAdmin = user?.publicMetadata?.role === "admin";

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 text-sm text-sidebar-foreground">
          <Link
            href="/profile"
            onClick={() => setOpenMobile(false)}
            className="w-8 h-8 rounded-full flex-shrink-0 hover:opacity-80 transition-opacity overflow-hidden"
            title="Account settings"
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center font-medium text-sidebar-accent-foreground text-xs">
                {initials}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpenMobile(false)}
            className="p-1.5 rounded hover:bg-sidebar-accent/60 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground flex-shrink-0"
            title="Account settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="p-1.5 rounded hover:bg-sidebar-accent/60 transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
