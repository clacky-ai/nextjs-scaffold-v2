import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { useIsAuthenticated, useAuthLoading } from "@/stores/authStore";
import AuthPage from "@/pages/auth";
import HomePage from "@/pages/home";
import ProjectsPage from "@/pages/projects";
import VotingPage from "@/pages/voting";
import ResultsPage from "@/pages/results";
import MyVotesPage from "@/pages/my-votes";
import MyProjectsPage from "@/pages/my-projects";
import ProjectFormPage from "@/pages/project-form";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function Router() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

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
          <Route path="/projects" component={ProjectsPage} />
          <Route path="/projects/new" component={ProjectFormPage} />
          <Route path="/projects/:id/edit" component={ProjectFormPage} />
          <Route path="/projects/:id" component={ProjectsPage} />
          <Route path="/my-projects" component={MyProjectsPage} />
          <Route path="/voting" component={VotingPage} />
          <Route path="/my-votes" component={MyVotesPage} />
          <Route path="/results" component={ResultsPage} />
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
