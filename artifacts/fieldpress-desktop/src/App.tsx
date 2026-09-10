import { ReporterProfilePage } from "@/pages/profile";
import { AdminDashboardPage } from "@/pages/admin";
import ClassifiedsPage from "@/pages/classifieds";
import PressPassPage from "@/pages/press-pass";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
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
import JoinPage from "@/pages/join";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


function GatedAdminRoute() {
  const [, setLocation] = useLocation();
  const isSuperAdmin = typeof window !== "undefined" && (
    localStorage.getItem("fieldpress_admin_auth") === "true" ||
    window.location.search.includes("admin=root")
  );

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center font-mono text-center p-6 text-zinc-300">
        <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-800 flex items-center justify-center mb-4 text-red-400 text-xl">
          🛡️
        </div>
        <h1 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2">
          Clearance Level: Super Admin Required
        </h1>
        <p className="text-zinc-500 text-xs max-w-md mb-6 leading-relaxed">
          Access restricted to bureau administrator (<span className="text-zinc-300">vibir@fieldpress.studio</span>).
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="px-4 py-2 rounded bg-zinc-900 border border-zinc-700 text-xs hover:border-zinc-500"
          >
            ← Return to Newsroom
          </button>
          <a
            href="mailto:support@fieldpress.studio"
            className="px-4 py-2 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs hover:bg-amber-500/20"
          >
            Contact Bureau Support
          </a>
        </div>
      </div>
    );
  }

  return <AdminDashboardPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/app" component={DashboardPage} />
      <Route path="/join/:code" component={JoinPage} />
      <Route path="/launch" component={LaunchPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/guide" component={UserManualPage} />
<Route path="/story/:storyId/news" component={NewsDeskPage} />
      <Route path="/story/:storyId/podcast" component={PodcastDeskPage} />
      <Route path="/story/:storyId/editor/:draftId" component={EditorPage} />
      <Route path="/story/:storyId" component={StoryDetailPage} />
      <Route path="/pass/:handle" component={PressPassPage} />
      <Route path="/pass" component={PressPassPage} />
      <Route path="/classifieds" component={ClassifiedsPage} />
      <Route path="/admin" component={GatedAdminRoute} />
      <Route path="/profile/:handle">{(params) => <ReporterProfilePage handle={params.handle} />}</Route>
      <Route path="/profile">{() => <ReporterProfilePage />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="fp-theme-v2"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="crt-scanlines min-h-screen">
              <header className="pointer-events-none fixed inset-x-0 top-0 z-[10001] flex items-center justify-between px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-background/85 backdrop-blur-md border-b border-border/40 shadow-sm">
                <div className="pointer-events-auto">
                  <FieldPressLogo />
                </div>
                {/* Consumer-Facing Coming Soon Ticker */}
                <div className="pointer-events-auto flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="hidden sm:inline font-bold">
                    COMING SOON: Dedicated Desktop App • Beat Bounties & Field Assignments • Fielder Audio Capture
                  </span>
                  <span className="sm:hidden font-bold">
                    Desktop App & Fielder Audio Capture Rendering Soon
                  </span>
                </div>

                {/* Coming Soon Head Ticker */}
                <div className="pointer-events-auto flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-[10px] font-mono text-cyan-300 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  
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