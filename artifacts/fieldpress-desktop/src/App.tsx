import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from "@/pages/dashboard";
import StoryDetailPage from "@/pages/story-detail";
import EditorPage from "@/pages/editor";
import LaunchPage from "@/pages/launch";
import LoginPage from "@/pages/login";
import ResetPasswordPage from "@/pages/reset-password";
import UserManualPage from "@/pages/user-manual";
import AdminManualPage from "@/pages/admin-manual";
import NotFound from "@/pages/not-found";
import { AuthGate } from "@/components/auth-gate";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={LaunchPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/guide" component={UserManualPage} />
      <Route path="/admin" component={AdminManualPage} />
      <Route path="/app">
        {() => (
          <AuthGate>
            <DashboardPage />
          </AuthGate>
        )}
      </Route>
      <Route path="/story/:storyId/editor/:draftId">
        {() => (
          <AuthGate>
            <EditorPage />
          </AuthGate>
        )}
      </Route>
      <Route path="/story/:storyId">
        {() => (
          <AuthGate>
            <StoryDetailPage />
          </AuthGate>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="crt-scanlines">
            <Router />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
