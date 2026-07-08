import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/reports";
import { useToast } from "@/hooks/use-toast";
import { setPendingCheckout } from "@/lib/pendingCheckout";

interface PlanPrice {
  id: string;
  unitAmount: number;
  currency: string;
  interval: "month" | "year" | null;
}

interface Plan {
  tier: string;
  name: string;
  createLimit: number;
  uploadLimit: number;
  prices: PlanPrice[];
}

interface PlansResponse {
  free: Plan;
  plans: Plan[];
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: (currency || "eur").toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

interface PricingCardsProps {
  currentTier?: string;
  onCheckoutStart?: () => void;
}

export default function PricingCards({ currentTier, onCheckoutStart }: PricingCardsProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const { isSignedIn } = useUser();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<PlansResponse>({
    queryKey: ["billingPlans"],
    queryFn: () => apiFetch("/billing/plans"),
  });

  const checkoutMutation = useMutation({
    mutationFn: (priceId: string) =>
      apiFetch("/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      }),
    onSuccess: (res: { customerId: string; priceId: string }) => {
      import("@/lib/paddle").then(({ openPaddleCheckout, isPaddleReady }) => {
        if (isPaddleReady()) {
          openPaddleCheckout(res.priceId, res.customerId);
        } else {
          console.error("Paddle.js not ready — cannot open checkout");
        }
      });
    },
    onError: (err: Error) => {
      toast({ title: "Could not start checkout", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allPlans: Plan[] = [data.free, ...data.plans];

  function handleSelect(plan: Plan) {
    if (plan.tier === "free") {
      if (!isSignedIn) navigate("/sign-up");
      return;
    }
    const price = plan.prices.find((p) => p.interval === billingInterval);
    if (!price) return;
    if (!isSignedIn) {
      setPendingCheckout(price.id);
      navigate("/sign-up");
      return;
    }
    onCheckoutStart?.();
    checkoutMutation.mutate(price.id);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="billing-interval" className={cn("text-sm", billingInterval === "month" ? "text-foreground font-medium" : "text-muted-foreground")}>
          Monthly
        </Label>
        <Switch
          id="billing-interval"
          checked={billingInterval === "year"}
          onCheckedChange={(checked) => setBillingInterval(checked ? "year" : "month")}
        />
        <Label htmlFor="billing-interval" className={cn("text-sm", billingInterval === "year" ? "text-foreground font-medium" : "text-muted-foreground")}>
          Yearly
        </Label>
        <Badge variant="secondary" className="ml-1">Save with yearly</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {allPlans.map((plan) => {
          const isFree = plan.tier === "free";
          const price = isFree ? null : plan.prices.find((p) => p.interval === billingInterval);
          const isCurrent = currentTier === plan.tier;
          const isPopular = plan.tier === "basic";
          const pending = checkoutMutation.isPending && checkoutMutation.variables === price?.id;

          return (
            <Card
              key={plan.tier}
              className={cn(
                "flex flex-col relative",
                isPopular && "border-primary shadow-md",
              )}
            >
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                {!isFree && (
                  <CardDescription>
                    <span>
                      <span className="text-2xl font-bold text-foreground">
                        {price ? formatPrice(price.unitAmount, price.currency) : "—"}
                      </span>
                      <span className="text-muted-foreground text-xs">/{billingInterval === "month" ? "mo" : "yr"}</span>
                    </span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                <ul className="space-y-1.5 text-xs flex-1">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{plan.createLimit} report {plan.createLimit === 1 ? "creation" : "creations"}/mo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{plan.uploadLimit} PDF {plan.uploadLimit === 1 ? "upload" : "uploads"}/mo</span>
                  </li>
                </ul>
                <Button
                  className="w-full gap-2 text-sm h-9"
                  variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
                  disabled={isCurrent || pending || (!isFree && !price)}
                  onClick={() => handleSelect(plan)}
                >
                  {pending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent ? "Current plan" : isFree ? (isSignedIn ? "Included" : "Get started") : isSignedIn ? "Upgrade" : "Get started"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
