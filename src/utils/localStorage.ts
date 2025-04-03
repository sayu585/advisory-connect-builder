
// Helper functions for storing and retrieving data from localStorage

// Session Management
export const saveCurrentUser = (user: any) => {
  const sessionKey = `currentUser_${user.id}`;
  localStorage.setItem(sessionKey, JSON.stringify(user));
  // Also store the last active user ID
  localStorage.setItem('lastActiveUser', user.id);
};

export const loadCurrentUser = (): any | null => {
  try {
    // Get the last active user ID
    const lastActiveUserId = localStorage.getItem('lastActiveUser');
    if (!lastActiveUserId) return null;
    
    // Load that specific user's session
    const sessionKey = `currentUser_${lastActiveUserId}`;
    const storedData = localStorage.getItem(sessionKey);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Failed to parse current user from localStorage', error);
    return null;
  }
};

export const clearCurrentUser = () => {
  // Clear only the current user's session
  const lastActiveUserId = localStorage.getItem('lastActiveUser');
  if (lastActiveUserId) {
    const sessionKey = `currentUser_${lastActiveUserId}`;
    localStorage.removeItem(sessionKey);
  }
  localStorage.removeItem('lastActiveUser');
};

// Recommendations
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
