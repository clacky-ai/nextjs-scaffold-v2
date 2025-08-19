import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AuthPage from "@/pages/auth";
import HomePage from "@/pages/home";
import SubmitProjectPage from "@/pages/submit-project";
import VotePage from "@/pages/vote";
import ProjectDetailPage from "@/pages/project-detail";
import LeaderboardPage from "@/pages/leaderboard";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {isAuthenticated ? (
        <>
          <Route path="/" component={HomePage} />
          <Route path="/projects" component={HomePage} />
          <Route path="/submit" component={SubmitProjectPage} />
          <Route path="/project/:id" component={ProjectDetailPage} />
          <Route path="/vote/:id" component={VotePage} />
          <Route path="/leaderboard" component={LeaderboardPage} />
          <Route path="/admin" component={AdminPage} />
        </>
      ) : (
        <>
          <Route path="/" component={AuthPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={AuthPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
