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

const loadMockUsers = () => {
  const storedUsers = localStorage.getItem("mockUsers");
  if (storedUsers) {
    try {
      return JSON.parse(storedUsers);
    } catch (error) {
      console.error("Failed to parse stored users", error);
    }
  }
  return [
    { id: "1", name: "Sayanth", email: "sayanth@example.com", password: "41421014", role: "admin", isMainAdmin: true },
    { id: "2", name: "Client User", email: "client@example.com", password: "password123", role: "client" },
  ];
};

const loadAccessRequests = () => {
  const storedRequests = localStorage.getItem("accessRequests");
  if (storedRequests) {
    try {
      return JSON.parse(storedRequests);
    } catch (error) {
      console.error("Failed to parse stored access requests", error);
    }
  }
  return [];
};

const MOCK_USERS = loadMockUsers();

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

const saveClientsData = () => {
  localStorage.setItem("mockClients", JSON.stringify(MOCK_CLIENTS));
};

if (!localStorage.getItem("mockClients")) {
  saveClientsData();
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(loadAccessRequests());

  useEffect(() => {
    localStorage.setItem("accessRequests", JSON.stringify(accessRequests));
  }, [accessRequests]);

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

  const saveMockUsers = () => {
    localStorage.setItem("mockUsers", JSON.stringify(MOCK_USERS));
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
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
      
      const existingUser = MOCK_USERS.find(u => u.email === email);
      
      if (existingUser) {
        toast.error("User with this email already exists");
      } else {
        const newUser = {
          id: String(MOCK_USERS.length + 1),
          name,
          email,
          password,
          role,
          isMainAdmin: false
        };
        
        MOCK_USERS.push(newUser);
        saveMockUsers();
        
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

  const createSubAdmin = async (name: string, email: string, password: string) => {
    if (!user || !user.isMainAdmin) {
      toast.error("Only the main admin can create sub-admins");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const existingUser = MOCK_USERS.find(u => u.email === email);
      
      if (existingUser) {
        toast.error("User with this email already exists");
      } else {
        const newUser = {
          id: String(MOCK_USERS.length + 1),
          name,
          email,
          password,
          role: "admin",
          isMainAdmin: false
        };
        
        MOCK_USERS.push(newUser);
        saveMockUsers();
        
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
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
    return client ? client.ownerId : "";
  };

  const hasAccessToClient = (clientId: string) => {
    if (isMainAdmin()) return true;
    
    const client = MOCK_CLIENTS.find(c => c.id === clientId);
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
        const client = MOCK_CLIENTS.find(c => c.id === req.clientId);
        return req.status === "pending" && client && client.ownerId === user.id;
      });
    }
    
    return [];
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  const updateUserProfile = (userId: string, userData: Partial<User>) => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      toast.error("User not found");
      return;
    }
    
    if (userData.email && userData.email !== MOCK_USERS[userIndex].email) {
      const emailExists = MOCK_USERS.some(
        (u, idx) => idx !== userIndex && u.email === userData.email
      );
      
      if (emailExists) {
        toast.error("Email already in use");
        return;
      }
    }
    
    MOCK_USERS[userIndex] = {
      ...MOCK_USERS[userIndex],
      ...userData
    };
    
    saveMockUsers();
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
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
