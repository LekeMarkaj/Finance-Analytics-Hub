import { Link } from "wouter";
import { BarChart2, Mail } from "lucide-react";
import { SUPPORT_EMAIL } from "@/lib/company";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10 bg-muted/30">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <BarChart2 className="w-5 h-5 text-primary" />
            <span>Financial Analytics</span>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Mail className="w-4 h-4" />
            {SUPPORT_EMAIL}
          </a>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/refund-policy" className="text-muted-foreground hover:text-foreground">
            Refund Policy
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
        </nav>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Finance Analytics. All rights reserved. Payments are
        processed by Paddle.com as our merchant of record.
      </div>
    </footer>
  );
}
