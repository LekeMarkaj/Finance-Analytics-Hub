import { Link, useLocation } from "wouter";
import { Home, FileBarChart2, LayoutDashboard, Settings, Users } from "lucide-react";
import { useUser } from "@clerk/react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Home", href: "/pdf-upload", icon: Home },
  { name: "Reports", href: "/reports", icon: FileBarChart2 },
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Account", href: "/profile", icon: Settings },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const navItems = isAdmin
    ? [...items, { name: "Users", href: "/admin/users", icon: Users }]
    : items;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className={cn("grid h-16", isAdmin ? "grid-cols-5" : "grid-cols-4")}>
        {navItems.map((item) => {
          const active =
            location === item.href ||
            (item.href !== "/dashboard" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
