import { Mail, CreditCard, LifeBuoy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LegalLayout } from "./LegalLayout";
import { SUPPORT_EMAIL } from "@/lib/company";

export default function Contact() {
  return (
    <LegalLayout title="Contact Us">
      <p className="text-muted-foreground leading-relaxed">
        Have a question about the product, your account, or a payment? We're happy to help — most
        emails receive a reply within one business day.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LifeBuoy className="w-4 h-4 text-primary" />
              General &amp; product support
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Questions, feedback, bug reports, or help using the dashboard.</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-primary" />
              Billing &amp; refunds
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Payments are processed by Paddle.com, our merchant of record. For billing questions
              or refunds, email us or reply directly to your Paddle receipt.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
          </CardContent>
        </Card>
      </div>
    </LegalLayout>
  );
}
