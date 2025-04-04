import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Component to fetch and display notifications
const UserRegistrationListener = () => {
  const { user } = useAuth();
  
  // In a real app with websockets, you'd listen for real-time events here
  // For now, we'll simulate by checking for new users periodically
  
  return null;
};

// Main App component
const App = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <UserRegistrationListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
