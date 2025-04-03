// Helper functions for storing and retrieving data from localStorage

// Generate a unique session key for each browser tab
const getTabSessionId = () => {
  if (!sessionStorage.getItem('tabSessionId')) {
    sessionStorage.setItem('tabSessionId', `tab-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`);
  }
  return sessionStorage.getItem('tabSessionId');
};

// Session Management
export const saveCurrentUser = (user: any) => {
  // Use sessionStorage instead of localStorage for user session
  // This ensures each tab has its own isolated session
  const sessionKey = `currentUser_${getTabSessionId()}`;
  sessionStorage.setItem(sessionKey, JSON.stringify(user));
  
  // Still store the user session in localStorage for persistent login between visits
  const persistentKey = `persistentUser_${user.id}`;
  localStorage.setItem(persistentKey, JSON.stringify(user));
};

export const loadCurrentUser = (): any | null => {
  try {
    // First try to get from session storage (tab-specific)
    const sessionKey = `currentUser_${getTabSessionId()}`;
    const sessionData = sessionStorage.getItem(sessionKey);
    
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    // If not in session storage, check for persistent login in localStorage
    // Get the latest persistent user
    const localStorageKeys = Object.keys(localStorage);
    const persistentUserKeys = localStorageKeys.filter(key => key.startsWith('persistentUser_'));
    
    if (persistentUserKeys.length > 0) {
      const latestUser = persistentUserKeys
        .map(key => ({ key, user: JSON.parse(localStorage.getItem(key) || '{}') }))
        .sort((a, b) => (b.user.lastLoginTime || 0) - (a.user.lastLoginTime || 0))[0];
      
      if (latestUser && latestUser.user) {
        // Save to this tab's session
        saveCurrentUser(latestUser.user);
        return latestUser.user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse current user from storage', error);
    return null;
  }
};

export const clearCurrentUser = () => {
  // Clear session-specific user data
  const sessionKey = `currentUser_${getTabSessionId()}`;
  sessionStorage.removeItem(sessionKey);
  
  // Also clear from localStorage if needed
  const user = loadCurrentUser();
  if (user && user.id) {
    const persistentKey = `persistentUser_${user.id}`;
    localStorage.removeItem(persistentKey);
  }
};

// Recommendations - keep these using localStorage for persistence across tabs
export const saveRecommendations = (recommendations: any[]) => {
  localStorage.setItem('recommendations', JSON.stringify(recommendations));
};

export const loadRecommendations = (): any[] => {
  try {
    const storedData = localStorage.getItem('recommendations');
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Failed to parse recommendations from localStorage', error);
    return [];
  }
};

// Add a recommendation
export const addRecommendation = (recommendation: any) => {
  const recommendations = loadRecommendations();
  recommendations.push(recommendation);
  saveRecommendations(recommendations);
  return recommendations;
};

// Update a recommendation
export const updateRecommendation = (id: string, updatedRecommendation: any) => {
  const recommendations = loadRecommendations();
  const index = recommendations.findIndex(rec => rec.id === id);
  
  if (index !== -1) {
    recommendations[index] = { ...recommendations[index], ...updatedRecommendation };
    saveRecommendations(recommendations);
  }
  
  return recommendations;
};

// Delete a recommendation
export const deleteRecommendation = (id: string) => {
  const recommendations = loadRecommendations();
  const filteredRecommendations = recommendations.filter(rec => rec.id !== id);
  saveRecommendations(filteredRecommendations);
  return filteredRecommendations;
};

// User data
export const saveUsers = (users: any[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const loadUsers = (): any[] => {
  try {
    const storedData = localStorage.getItem('users');
    if (storedData) {
      return JSON.parse(storedData);
    } else {
      // Initialize with just the main admin
      const initialUsers = [{
        id: "1", 
        name: "Sayanth", 
        email: "sayanth@example.com", 
        password: "41421014", 
        role: "admin", 
        isMainAdmin: true
      }];
      saveUsers(initialUsers);
      return initialUsers;
    }
  } catch (error) {
    console.error('Failed to parse users from localStorage', error);
    // Initialize with just the main admin as fallback
    const initialUsers = [{
      id: "1", 
      name: "Sayanth", 
      email: "sayanth@example.com", 
      password: "41421014", 
      role: "admin", 
      isMainAdmin: true
    }];
    saveUsers(initialUsers);
    return initialUsers;
  }
};

export const addUser = (user: any) => {
  const users = loadUsers();
  users.push(user);
  saveUsers(users);
  return users;
};

export const updateUser = (userId: string, userData: any) => {
  const users = loadUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    saveUsers(users);
    
    // If this is the currently logged-in user, update that too
    const currentUser = loadCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const { password, ...userWithoutPassword } = users[index];
      // Add timestamp for login tracking
      userWithoutPassword.lastLoginTime = Date.now();
      saveCurrentUser({ ...userWithoutPassword });
    }
  }
  
  return users;
};

// Client data
export const saveClients = (clients: any[]) => {
  localStorage.setItem('clients', JSON.stringify(clients));
};

export const loadClients = (): any[] => {
  try {
    const storedData = localStorage.getItem('clients');
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Failed to parse clients from localStorage', error);
    return [];
  }
};

export const addClient = (client: any) => {
  const clients = loadClients();
  clients.push(client);
  saveClients(clients);
  return clients;
};

export const updateClient = (clientId: string, clientData: any) => {
  const clients = loadClients();
  const index = clients.findIndex(client => client.id === clientId);
  
  if (index !== -1) {
    clients[index] = { ...clients[index], ...clientData };
    saveClients(clients);
  }
  
  return clients;
};

export const deleteClient = (clientId: string) => {
  const clients = loadClients();
  const filteredClients = clients.filter(client => client.id !== clientId);
  saveClients(filteredClients);
  return filteredClients;
};

// Client subscriptions
export const saveSubscriptions = (subscriptions: any[]) => {
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
};

export const loadSubscriptions = (): any[] => {
  try {
    const storedData = localStorage.getItem('subscriptions');
    return storedData ? JSON.parse(storedData) : [
      { id: "default", name: "Default", description: "Default subscription" }
    ];
  } catch (error) {
    console.error('Failed to parse subscriptions from localStorage', error);
    return [{ id: "default", name: "Default", description: "Default subscription" }];
  }
};

export const addSubscription = (subscription: any) => {
  const subscriptions = loadSubscriptions();
  subscriptions.push(subscription);
  saveSubscriptions(subscriptions);
  return subscriptions;
};

export const updateSubscription = (id: string, updatedSubscription: any) => {
  const subscriptions = loadSubscriptions();
  const index = subscriptions.findIndex(sub => sub.id === id);
  
  if (index !== -1) {
    subscriptions[index] = { ...subscriptions[index], ...updatedSubscription };
    saveSubscriptions(subscriptions);
  }
  
  return subscriptions;
};

export const deleteSubscription = (id: string) => {
  const subscriptions = loadSubscriptions();
  const filteredSubscriptions = subscriptions.filter(sub => sub.id !== id);
  saveSubscriptions(filteredSubscriptions);
  return filteredSubscriptions;
};

// Access requests
export const saveAccessRequests = (requests: any[]) => {
  localStorage.setItem('accessRequests', JSON.stringify(requests));
};

export const loadAccessRequests = (): any[] => {
  try {
    const storedData = localStorage.getItem('accessRequests');
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Failed to parse access requests from localStorage', error);
    return [];
  }
};
