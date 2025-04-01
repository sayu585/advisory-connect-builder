
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isMainAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  createSubAdmin: (name: string, email: string, password: string) => Promise<void>;
  isMainAdmin: () => boolean;
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
});

// Mock user database for demonstration - in a real app, this would be a real API
const MOCK_USERS = [
  { id: "1", name: "Admin User", email: "admin@example.com", password: "password123", role: "admin", isMainAdmin: true },
  { id: "2", name: "Client User", email: "client@example.com", password: "password123", role: "client" },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, createSubAdmin, isMainAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default useAuth;
