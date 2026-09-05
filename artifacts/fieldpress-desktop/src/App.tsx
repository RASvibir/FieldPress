import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsMenu } from "@/components/settings-menu";
import { PressyBubble } from "@/components/pressy-bubble";
import { ErrorBoundary } from "@/components/error-boundary";
import { FieldPressLogo } from "@/components/fieldpress-logo";
import DashboardPage from "@/pages/dashboard";
import StoryDetailPage from "@/pages/story-detail";
import EditorPage from "@/pages/editor";
import NewsDeskPage from "@/pages/news-desk";
import PodcastDeskPage from "@/pages/podcast-desk";
import LaunchPage from "@/pages/launch";
import LoginPage from "@/pages/login";
import ResetPasswordPage from "@/pages/reset-password";
import UserManualPage from "@/pages/user-manual";
import AdminManualPage from "@/pages/admin-manual";
import NotFound from "@/pages/not-found";

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
      <Route path="/" component={DashboardPage} />
      <Route path="/app" component={DashboardPage} />
      <Route path="/launch" component={LaunchPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/guide" component={UserManualPage} />
      <Route path="/admin" component={AdminManualPage} />
      <Route path="/story/:storyId/news" component={NewsDeskPage} />
      <Route path="/story/:storyId/podcast" component={PodcastDeskPage} />
      <Route path="/story/:storyId/editor/:draftId" component={EditorPage} />
      <Route path="/story/:storyId" component={StoryDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="fp-theme"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="crt-scanlines min-h-screen">
              <header className="pointer-events-none fixed inset-x-0 top-0 z-[10001] flex items-center justify-between px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))]">
                <div className="pointer-events-auto">
                  <FieldPressLogo />
                </div>
                <div className="pointer-events-auto">
                  <SettingsMenu />
                </div>
              </header>

              <ErrorBoundary>
                <Router />
              </ErrorBoundary>

              <PressyBubble />
            </div>
          </WouterRouter>

          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;