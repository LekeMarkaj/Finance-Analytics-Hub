import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import Trends from "@/pages/Trends";
import Revenues from "@/pages/Revenues";
import BalanceSheet from "@/pages/BalanceSheet";
import CustomDatasets from "@/pages/CustomDatasets";
import CustomDatasetDetail from "@/pages/CustomDatasetDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/categories" component={Categories} />
        <Route path="/categories/:id" component={CategoryDetail} />
        <Route path="/trends" component={Trends} />
        <Route path="/revenues" component={Revenues} />
        <Route path="/balance-sheet" component={BalanceSheet} />
        <Route path="/custom" component={CustomDatasets} />
        <Route path="/custom/:id" component={CustomDatasetDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
