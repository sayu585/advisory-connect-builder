
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
