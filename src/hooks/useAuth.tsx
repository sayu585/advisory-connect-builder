
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { 
  loadUsers, saveUsers, saveCurrentUser, loadCurrentUser, 
  clearCurrentUser, loadAccessRequests, saveAccessRequests,
  loadClients
} from "@/utils/localStorage";

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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(loadAccessRequests());

  useEffect(() => {
    saveAccessRequests(accessRequests);
  }, [accessRequests]);

  useEffect(() => {
    const storedUser = loadCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = loadUsers();
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        saveCurrentUser(userWithoutPassword);
        toast.success("Login successful!");
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role = "client") => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = loadUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        toast.error("User with this email already exists");
      } else {
        const newUser = {
          id: String(users.length + 1),
          name,
          email,
          password,
          role,
          isMainAdmin: false
        };
        
        users.push(newUser);
        saveUsers(users);
        
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        saveCurrentUser(userWithoutPassword);
        
        toast.success("Registration successful!");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = loadUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        toast.error("User with this email already exists");
      } else {
        const newUser = {
          id: String(users.length + 1),
          name,
          email,
          password,
          role: "admin",
          isMainAdmin: false
        };
        
        users.push(newUser);
        saveUsers(users);
        
        toast.success("Sub-admin created successfully!");
      }
    } catch (error) {
      toast.error("Failed to create sub-admin. Please try again.");
      console.error("Create sub-admin error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isMainAdmin = () => {
    return !!user?.isMainAdmin;
  };

  const getClientOwnership = (clientId: string) => {
    const clients = loadClients();
    const client = clients.find(c => c.id === clientId);
    return client ? client.ownerId : "";
  };

  const hasAccessToClient = (clientId: string) => {
    if (isMainAdmin()) return true;
    
    const clients = loadClients();
    const client = clients.find(c => c.id === clientId);
    if (client && user && client.ownerId === user.id) return true;
    
    const approvedRequest = accessRequests.find(
      req => req.clientId === clientId && 
             req.requesterId === user?.id && 
             req.status === "approved"
    );
    
    return !!approvedRequest;
  };

  const requestClientAccess = (clientId: string, clientName: string) => {
    if (!user) return;
    
    const existingRequest = accessRequests.find(
      req => req.clientId === clientId && req.requesterId === user.id && req.status === "pending"
    );
    
    if (existingRequest) {
      toast.info("Access request already pending");
      return;
    }
    
    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      requesterId: user.id,
      requesterName: user.name,
      clientId,
      clientName,
      status: "pending",
      requestDate: new Date().toISOString()
    };
    
    setAccessRequests(prev => [...prev, newRequest]);
    toast.success("Access request submitted");
  };

  const approveAccessRequest = (requestId: string) => {
    setAccessRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: "approved" } : req
      )
    );
    toast.success("Access request approved");
  };

  const rejectAccessRequest = (requestId: string) => {
    setAccessRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: "rejected" } : req
      )
    );
    toast.info("Access request rejected");
  };

  const getPendingRequests = () => {
    if (isMainAdmin()) {
      return accessRequests.filter(req => req.status === "pending");
    }
    
    if (user && user.role === "admin") {
      return accessRequests.filter(req => {
        const clients = loadClients();
        const client = clients.find(c => c.id === req.clientId);
        return req.status === "pending" && client && client.ownerId === user.id;
      });
    }
    
    return [];
  };

  const logout = () => {
    if (user) {
      clearCurrentUser();
    }
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateUserProfile = (userId: string, userData: Partial<User>) => {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      toast.error("User not found");
      return;
    }
    
    if (userData.email && userData.email !== users[userIndex].email) {
      const emailExists = users.some(
        (u, idx) => idx !== userIndex && u.email === userData.email
      );
      
      if (emailExists) {
        toast.error("Email already in use");
        return;
      }
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...userData
    };
    
    saveUsers(users);
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);
      toast.success("Profile updated successfully");
    } else {
      toast.success("User profile updated");
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
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default useAuth;
