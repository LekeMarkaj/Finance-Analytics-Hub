import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Reports from "@/pages/Reports";
import ReportDetail from "@/pages/ReportDetail";
import Profile from "@/pages/Profile";
import AdminUsers from "@/pages/AdminUsers";
import PdfUpload from "@/pages/PdfUpload";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import PricingCards from "@/components/PricingCards";
import { Link } from "wouter";
import { Loader2, BarChart2 } from "lucide-react";
import { apiFetch, type PdfUpload as PdfUploadRecord } from "@/lib/reports";
import { takePendingCheckout } from "@/lib/pendingCheckout";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
  },
  variables: {
    colorPrimary: "hsl(213, 94%, 42%)",
    colorForeground: "hsl(222, 47%, 11%)",
    colorMutedForeground: "hsl(215, 16%, 47%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(214, 32%, 91%)",
    colorInputForeground: "hsl(222, 47%, 11%)",
    colorNeutral: "hsl(214, 32%, 86%)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-xl w-[440px] max-w-full overflow-hidden shadow-lg border border-border",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-green-600",
    alertText: "text-foreground",
    logoBox: "flex items-center justify-center",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-border bg-white hover:bg-muted",
    formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90",
    formFieldInput: "border border-border bg-white text-foreground",
    footerAction: "bg-muted/50",
    dividerLine: "bg-border",
    alert: "bg-muted",
    otpCodeFieldInput: "border border-border",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <BarChart2 className="w-6 h-6 text-primary" />
          <span>Financial Analytics</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mx-auto">
            <BarChart2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Financial Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Secure, personalised financial insights for hospital departments and finance teams. Upload PDF reports, analyse trends, and explore your financial data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">Create Your Account</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </main>
      <section className="border-t border-border px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Start for free, upgrade whenever you need more reports.</p>
          </div>
          <PricingCards />
        </div>
      </section>
    </div>
  );
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function isPublicReportPath(location: string): boolean {
  return /^\/reports\/[^/]+$/.test(location);
}

function usePendingCheckoutResume() {
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || startedRef.current) return;
    const priceId = takePendingCheckout();
    if (!priceId) return;
    startedRef.current = true;
    apiFetch("/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    })
      .then((res: { transactionId: string; url: string }) => {
        import("./lib/paddle").then(({ openPaddleCheckout, isPaddleReady }) => {
          if (isPaddleReady()) {
            openPaddleCheckout(res.transactionId);
          } else {
            window.location.href = res.url;
          }
        });
      })
      .catch((err: Error) => {
        toast({
          title: "Could not resume checkout",
          description: err.message || "Please choose a plan again from your profile.",
          variant: "destructive",
        });
      });
  }, [isSignedIn, toast]);
}

function BareReportView() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto w-full">
          <ReportDetail />
        </div>
      </div>
    </div>
  );
}

// Reports viewed via a shared public link must never expose the dashboard
// sidebar/navigation — only the report's charts, in read-only mode. We only
// know ownership once the report has loaded, so default to the bare (no
// layout) view until we can positively confirm the viewer is the owner.
function ReportDetailRoute() {
  const [location] = useLocation();
  const id = location.split("/")[2];

  const { data: report, isLoading } = useQuery<PdfUploadRecord>({
    queryKey: ["pdfUpload", id],
    queryFn: () => apiFetch(`/pdf-uploads/${id}`),
    enabled: !!id,
  });

  if (isLoading || !report || report.isOwner === false) {
    return <BareReportView />;
  }

  return (
    <AppLayout>
      <ReportDetail />
    </AppLayout>
  );
}

function AppShell() {
  const [location] = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  usePendingCheckoutResume();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isSignedIn) {
    if (isPublicReportPath(location)) {
      return <BareReportView />;
    }
    return <Redirect to="/sign-in" />;
  }

  if (location.startsWith("/reports/")) {
    return <ReportDetailRoute />;
  }

  let page: React.ReactNode;
  if (location === "/dashboard") page = <Dashboard />;
  else if (location === "/reports") page = <Reports />;
  else if (location === "/pdf-upload") page = <PdfUpload />;
  else if (location.startsWith("/profile")) page = <Profile />;
  else if (location === "/admin/users") page = <AdminUsers />;
  else page = <NotFound />;

  return <AppLayout>{page}</AppLayout>;
}

function BrandHeader() {
  return (
    <div className="flex items-center justify-center gap-2 font-bold text-foreground mb-6">
      <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
        <BarChart2 className="w-5 h-5" />
      </div>
      <span>Financial Analytics</span>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <BrandHeader />
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <BrandHeader />
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your financial dashboard",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Get started with Financial Analytics",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={AppShell} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
