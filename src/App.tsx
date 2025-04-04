
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Auth components
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Main layout and pages
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Recommendations from "./pages/recommendations/Recommendations";
import Clients from "./pages/clients/Clients";
import Profile from "./pages/profile/Profile";
import Unauthorized from "./pages/unauthorized/Unauthorized";
import AdminManagement from "./pages/admin/AdminManagement";
import SubscriptionManagement from "./pages/subscriptions/SubscriptionManagement";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Disable query caching to ensure fresh data on refreshes
      refetchOnWindowFocus: true, // Refetch when window gets focus
      refetchOnMount: true, // Make sure data refreshes when component mounts
    },
  },
});

// This component handles protected routes and redirects
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, refreshData } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Refresh data on route change
    refreshData();
  }, [location.pathname, refreshData]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// This component handles main admin only routes
const MainAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isMainAdmin, isLoading, refreshData } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Refresh data on route change
    refreshData();
  }, [location.pathname, refreshData]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isMainAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, refreshData } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Refresh data on route change or tab focus
    refreshData();
    
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [location.pathname, refreshData]);
  
  return (
    <Routes>
      {/* Redirect from root based on authentication status */}
      <Route path="/" element={
        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute><MainLayout allowedRoles={["admin"]} /></ProtectedRoute>}>
        <Route path="/clients" element={<Clients />} />
        <Route path="/subscriptions" element={<SubscriptionManagement />} />
        <Route path="/admin/users" element={<div>User Management (Admin Only)</div>} />
        <Route path="/admin/management" element={
          <MainAdminRoute>
            <AdminManagement />
          </MainAdminRoute>
        } />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
