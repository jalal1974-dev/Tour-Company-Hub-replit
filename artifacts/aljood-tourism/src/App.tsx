import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import DestinationsPage from "@/pages/destinations";
import DestinationDetailPage from "@/pages/destination-detail";
import ContactPage from "@/pages/contact";
import PackagesPage from "@/pages/packages";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminDestinationsPage from "@/pages/admin/destinations";
import AdminHotelsPage from "@/pages/admin/hotels";
import AdminPackagesPage from "@/pages/admin/packages";
import AdminInquiriesPage from "@/pages/admin/inquiries";
import AdminImportPage from "@/pages/admin/import";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/destinations" component={DestinationsPage} />
      <Route path="/destinations/:slug" component={DestinationDetailPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/packages" component={PackagesPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/destinations" component={AdminDestinationsPage} />
      <Route path="/admin/hotels" component={AdminHotelsPage} />
      <Route path="/admin/packages" component={AdminPackagesPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/inquiries" component={AdminInquiriesPage} />
      <Route path="/admin/import" component={AdminImportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
