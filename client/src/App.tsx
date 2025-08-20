import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";
import { useIsAuthenticated, useAuthLoading } from "@/stores/users/authStore";
import { useIsAdminAuthenticated, useAdminAuthLoading } from "@/stores/admin/authStore";
import { ADMIN_ROUTES, USER_ROUTES } from "@/router";

// User pages
import {
  AuthPage,
  LoginPage as UserLoginPage,
  SignupPage as UserSignupPage,
  HomePage,
} from "@/pages/users";

// Admin pages
import {
  LoginPage as AdminLoginPage,
  DashboardPage as AdminDashboardPage,
} from "@/pages/admin";

import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { createRedirectPage } from "./components/router/Redirect";

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
      <Route path={USER_ROUTES.getFullPath('login')} component={UserLoginPage} />
      <Route path={USER_ROUTES.getFullPath('signup')} component={UserSignupPage} />

      {isUserAuthenticated ? (
        <>
          <Route path={USER_ROUTES.getFullPath('home')} component={HomePage} />
        </>
      ) : (
        <>
          <Route path="/" component={UserLoginPage} />
          <Route path={USER_ROUTES.getFullPath('auth')} component={AuthPage} />
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
      <Route path={ADMIN_ROUTES.getFullPath('login')} component={AdminLoginPage} />
      {isAdminAuthenticated ? (
        <>
          {/* 根路径重定向路由, 如果需要的话 */}
          {/* <Route 
            path={ADMIN_ROUTES.getFullPath('root')} 
            component={createRedirectPage(ADMIN_ROUTES.getFullPath('dashboard'))} 
          /> */}
          
          <Route path={ADMIN_ROUTES.getFullPath('users')} component={AdminDashboardPage} />
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
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
  );
}

export default App;
