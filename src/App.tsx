
import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Component to fetch and display notifications
const UserRegistrationListener = () => {
  const { user } = useAuth();
  
  // In a real app with websockets, you'd listen for real-time events here
  // For now, we'll simulate by checking for new users periodically
  
  return null;
};

// Server status checker component
const ServerStatusChecker = () => {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    // Check server status
    const checkServer = async () => {
      try {
        // Use a simple timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('/api/users', { signal: controller.signal });
        clearTimeout(timeoutId);
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
        console.error('Server connection error:', error);
      }
    };
    
    checkServer();
  }, []);
  
  if (serverStatus === 'offline') {
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Server Connection Error</AlertTitle>
          <AlertDescription>
            Cannot connect to the server. Please make sure the server is running by navigating to the server directory and running "npm run dev".
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return null;
};

// Main App component
const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <UserRegistrationListener />
      <ServerStatusChecker />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
