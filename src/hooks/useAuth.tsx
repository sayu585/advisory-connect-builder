
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { authService, accessRequestService } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isMainAdmin?: boolean;
}

interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  clientId: string;
  clientName: string;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  createSubAdmin: (name: string, email: string, password: string) => Promise<void>;
  isMainAdmin: () => boolean;
  getClientOwnership: (clientId: string) => string;
  hasAccessToClient: (clientId: string) => boolean;
  requestClientAccess: (clientId: string, clientName: string) => void;
  approveAccessRequest: (requestId: string) => void;
  rejectAccessRequest: (requestId: string) => void;
  getPendingRequests: () => AccessRequest[];
  updateUserProfile: (userId: string, userData: Partial<User>) => void;
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  createSubAdmin: async () => {},
  isMainAdmin: () => false,
  getClientOwnership: () => "",
  hasAccessToClient: () => false,
  requestClientAccess: () => {},
  approveAccessRequest: () => {},
  rejectAccessRequest: () => {},
  getPendingRequests: () => [],
  updateUserProfile: () => {},
  refreshData: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  // Function to refresh all data from server
  const refreshData = async () => {
    try {
      // Load access requests
      const fetchedRequests = await accessRequestService.getAll();
      setAccessRequests(fetchedRequests);
      
      // Load clients
      const { clientService } = await import('@/services/api');
      const fetchedClients = await clientService.getAll();
      setClients(fetchedClients);

    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  useEffect(() => {
    // Check if user is already logged in (stored in sessionStorage)
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }
    }
    
    refreshData().finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    
    try {
      const loggedInUser = await authService.login(email, password);
      
      // Store user in session storage
      sessionStorage.setItem('currentUser', JSON.stringify(loggedInUser));
      
      // If remember me is checked, store in local storage too
      if (rememberMe) {
        localStorage.setItem('persistentUser', JSON.stringify(loggedInUser));
      }
      
      setUser(loggedInUser);
      await refreshData();
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role = "client") => {
    setIsLoading(true);
    
    try {
      const newUser = await authService.register({
        name,
        email,
        password,
        role,
        isMainAdmin: false,
        createdAt: new Date().toISOString()
      });
      
      // Store user in session storage
      sessionStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setUser(newUser);
      toast.success("Registration successful!");
      
      // Send notification about new user registration
      try {
        const { notificationService } = await import('@/services/api');
        await notificationService.sendNotification({
          type: 'userRegistration',
          data: {
            timestamp: Date.now(),
            userId: newUser.id,
            action: 'register',
            userName: name,
            email: email,
            role: role
          }
        });
      } catch (notifyError) {
        console.error("Failed to send registration notification:", notifyError);
      }
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSubAdmin = async (name: string, email: string, password: string) => {
    if (!user || !user.isMainAdmin) {
      toast.error("Only the main admin can create sub-admins");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.register({
        name,
        email,
        password,
        role: "admin",
        isMainAdmin: false
      });
      
      toast.success("Sub-admin created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create sub-admin. Please try again.");
      console.error("Create sub-admin error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isMainAdmin = () => {
    return !!user?.isMainAdmin;
  };

  const getClientOwnership = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.ownerId : "";
  };

  const hasAccessToClient = (clientId: string) => {
    if (isMainAdmin()) return true;
    
    const client = clients.find(c => c.id === clientId);
    if (client && user && client.ownerId === user.id) return true;
    
    const approvedRequest = accessRequests.find(
      req => req.clientId === clientId && 
             req.requesterId === user?.id && 
             req.status === "approved"
    );
    
    return !!approvedRequest;
  };

  const requestClientAccess = async (clientId: string, clientName: string) => {
    if (!user) return;
    
    const existingRequest = accessRequests.find(
      req => req.clientId === clientId && req.requesterId === user.id && req.status === "pending"
    );
    
    if (existingRequest) {
      toast.info("Access request already pending");
      return;
    }
    
    try {
      const newRequest = await accessRequestService.create({
        requesterId: user.id,
        requesterName: user.name,
        clientId,
        clientName,
        status: "pending"
      });
      
      setAccessRequests(prev => [...prev, newRequest]);
      toast.success("Access request submitted");
    } catch (error) {
      toast.error("Failed to submit access request");
      console.error(error);
    }
  };

  const approveAccessRequest = async (requestId: string) => {
    try {
      const updatedRequest = await accessRequestService.update(requestId, { status: "approved" });
      setAccessRequests(prev => 
        prev.map(req => 
          req.id === requestId ? updatedRequest : req
        )
      );
      toast.success("Access request approved");
    } catch (error) {
      toast.error("Failed to approve request");
      console.error(error);
    }
  };

  const rejectAccessRequest = async (requestId: string) => {
    try {
      const updatedRequest = await accessRequestService.update(requestId, { status: "rejected" });
      setAccessRequests(prev => 
        prev.map(req => 
          req.id === requestId ? updatedRequest : req
        )
      );
      toast.info("Access request rejected");
    } catch (error) {
      toast.error("Failed to reject request");
      console.error(error);
    }
  };

  const getPendingRequests = () => {
    if (isMainAdmin()) {
      return accessRequests.filter(req => req.status === "pending");
    }
    
    if (user && user.role === "admin") {
      return accessRequests.filter(req => {
        const client = clients.find(c => c.id === req.clientId);
        return req.status === "pending" && client && client.ownerId === user.id;
      });
    }
    
    return [];
  };

  const logout = () => {
    // Clear user session data
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('persistentUser');
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateUserProfile = async (userId: string, userData: Partial<User>) => {
    try {
      const updatedUser = await authService.updateUser(userId, userData);
      
      if (user && user.id === userId) {
        setUser(updatedUser);
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        if (localStorage.getItem('persistentUser')) {
          localStorage.setItem('persistentUser', JSON.stringify(updatedUser));
        }
        toast.success("Profile updated successfully");
      } else {
        toast.success("User profile updated");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      createSubAdmin, 
      isMainAdmin,
      getClientOwnership,
      hasAccessToClient,
      requestClientAccess,
      approveAccessRequest,
      rejectAccessRequest,
      getPendingRequests,
      updateUserProfile,
      refreshData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default useAuth;
