
// Helper functions for storing and retrieving data from localStorage

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
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

export const loadUsers = (): any[] => {
  try {
    const storedData = localStorage.getItem('mockUsers');
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Failed to parse users from localStorage', error);
    return [];
  }
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

export const saveCurrentUser = (user: any) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const loadCurrentUser = (): any | null => {
  try {
    const storedData = localStorage.getItem('user');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Failed to parse current user from localStorage', error);
    return null;
  }
};

export const clearCurrentUser = () => {
  localStorage.removeItem('user');
};
