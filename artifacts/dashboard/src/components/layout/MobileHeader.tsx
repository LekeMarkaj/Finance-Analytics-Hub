import { BarChart2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function MobileHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur border-b border-border md:hidden">
      <div className="flex items-center gap-2 font-bold text-foreground">
        <BarChart2 className="w-5 h-5 text-primary" />
        <span className="text-sm">Financial Analytics</span>
      </div>
      <button
        className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  );
}
