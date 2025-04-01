
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

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
}

// Create context with default values
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
});

// Mock user database for demonstration - in a real app, this would be a real API
const MOCK_USERS = [
  { id: "1", name: "Admin User", email: "admin@example.com", password: "password123", role: "admin", isMainAdmin: true },
  { id: "2", name: "Client User", email: "client@example.com", password: "password123", role: "client" },
];

// Mock clients database with ownership information
const MOCK_CLIENTS = [
  {
    id: "client1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    status: "Active",
    recommendationsAssigned: 3,
    recommendationsAcknowledged: 2,
    ownerId: "1" // Main admin owns this client
  },
  {
    id: "client2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "555-987-6543",
    status: "Active",
    recommendationsAssigned: 5,
    recommendationsAcknowledged: 5,
    ownerId: "1" // Main admin owns this client
  },
  {
    id: "client3",
    name: "Michael Williams",
    email: "m.williams@example.com",
    phone: "555-567-8901",
    status: "Inactive",
    recommendationsAssigned: 2,
    recommendationsAcknowledged: 0,
    ownerId: "1" // Main admin owns this client
  },
  {
    id: "client4",
    name: "Jessica Brown",
    email: "jessica.b@example.com",
    phone: "555-234-5678",
    status: "Active",
    recommendationsAssigned: 4,
    recommendationsAcknowledged: 3,
    ownerId: "1" // Main admin owns this client
  },
];

// Mock access requests
const MOCK_ACCESS_REQUESTS: AccessRequest[] = [];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(MOCK_ACCESS_REQUESTS);

  // Check if user is already logged in via localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        // Remove password from user object before storing
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        }
        
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

  // Register function
  const register = async (name: string, email: string, password: string, role = "client") => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      
      if (existingUser) {
        toast.error("User with this email already exists");
      } else {
        // In a real app, this would be a server-side API call to create a user
        const newUser = {
          id: String(MOCK_USERS.length + 1),
          name,
          email,
          password, // In a real app, this would be hashed on the server
          role,
          isMainAdmin: false
        };
        
        // Add to mock database (this is just for demonstration)
        MOCK_USERS.push(newUser);
        
        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        
        toast.success("Registration successful!");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create sub-admin function (only available to main admin)
  const createSubAdmin = async (name: string, email: string, password: string) => {
    if (!user || !user.isMainAdmin) {
      toast.error("Only the main admin can create sub-admins");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === email);
      
      if (existingUser) {
        toast.error("User with this email already exists");
      } else {
        // In a real app, this would be a server-side API call to create a user
        const newUser = {
          id: String(MOCK_USERS.length + 1),
          name,
          email,
          password, // In a real app, this would be hashed on the server
          role: "admin",
          isMainAdmin: false
        };
        
        // Add to mock database (this is just for demonstration)
        MOCK_USERS.push(newUser);
        
        toast.success("Sub-admin created successfully!");
      }
    } catch (error) {
      toast.error("Failed to create sub-admin. Please try again.");
      console.error("Create sub-admin error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if current user is main admin
  const isMainAdmin = () => {
    return !!user?.isMainAdmin;
  };

  // Get client ownership
  const getClientOwnership = (clientId: string) => {
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client ? client.ownerId : "";
  };

  // Check if user has access to client
  const hasAccessToClient = (clientId: string) => {
    // Main admin has access to all clients
    if (isMainAdmin()) return true;
    
    // Check if user is owner of the client
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    if (client && user && client.ownerId === user.id) return true;
    
    // Check if there is an approved access request
    const approvedRequest = accessRequests.find(
      req => req.clientId === clientId && 
             req.requesterId === user?.id && 
             req.status === "approved"
    );
    
    return !!approvedRequest;
  };

  // Request access to client
  const requestClientAccess = (clientId: string, clientName: string) => {
    if (!user) return;
    
    // Check if request already exists
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

  // Approve access request
  const approveAccessRequest = (requestId: string) => {
    setAccessRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: "approved" } : req
      )
    );
    toast.success("Access request approved");
  };

  // Reject access request
  const rejectAccessRequest = (requestId: string) => {
    setAccessRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: "rejected" } : req
      )
    );
    toast.info("Access request rejected");
  };

  // Get pending access requests
  const getPendingRequests = () => {
    // Main admin can see all pending requests
    if (isMainAdmin()) {
      return accessRequests.filter(req => req.status === "pending");
    }
    
    // Sub-admin can only see requests for clients they own
    if (user && user.role === "admin") {
      return accessRequests.filter(req => {
        const client = MOCK_CLIENTS.find(c => c.id === req.clientId);
        return req.status === "pending" && client && client.ownerId === user.id;
      });
    }
    
    return [];
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
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
      getPendingRequests
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default useAuth;
