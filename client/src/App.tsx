import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";
import { useIsAuthenticated, useAuthLoading } from "@/stores/users/authStore";
import { useIsAdminAuthenticated, useAdminAuthLoading } from "@/stores/admin/authStore";

// User pages
import {
  AuthPage,
  LoginPage as UserLoginPage,
  SignupPage as UserSignupPage,
  HomePage,
  ProjectsPage,
  VotingPage,
  ResultsPage,
  MyVotesPage,
  MyProjectsPage,
  ProjectFormPage,
} from "@/pages/users";

// Admin pages
import {
  LoginPage as AdminLoginPage,
  DashboardPage as AdminDashboardPage,
} from "@/pages/admin";

import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

// Render function for user section
function renderForUser(isUserAuthenticated: boolean, isUserLoading: boolean) {
  if (isUserLoading) {
    return <LoadingScreen />;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={UserLoginPage} />
      <Route path="/signup" component={UserSignupPage} />

      {isUserAuthenticated ? (
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
          <Route path="/" component={UserLoginPage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={UserLoginPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

// Render function for admin section
function renderForAdmin(isAdminAuthenticated: boolean, isAdminLoading: boolean) {
  if (isAdminLoading) {
    return <LoadingScreen />;
  }

  return (
    <Switch>
      <Route path="/admin/login" component={AdminLoginPage} />
      {isAdminAuthenticated ? (
        <>
          <Route path="/admin" component={AdminDashboardPage} />
          <Route path="/admin/users" component={AdminDashboardPage} />
          <Route path="/admin/projects" component={AdminDashboardPage} />
          <Route path="/admin/votes" component={AdminDashboardPage} />
          <Route path="/admin/settings" component={AdminDashboardPage} />
          {/* All admin sub-routes now use the dashboard framework */}
        </>
      ) : (
        <Route component={AdminLoginPage} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

// Main Router component
function Router() {
  const [location] = useLocation();
  const isUserAuthenticated = useIsAuthenticated();
  const isUserLoading = useAuthLoading();
  const isAdminAuthenticated = useIsAdminAuthenticated();
  const isAdminLoading = useAdminAuthLoading();

  // Check if we're in admin section
  const isAdminSection = location.startsWith('/admin');

  // Render based on section
  if (isAdminSection) {
    return renderForAdmin(isAdminAuthenticated, isAdminLoading);
  } else {
    return renderForUser(isUserAuthenticated, isUserLoading);
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
