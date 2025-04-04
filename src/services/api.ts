
import axios from 'axios';

// Determine the API base URL based on the environment
// This will use a relative URL in development mode,
// which works better with frameworks like Vite
const BASE_URL = '/api';

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};

// Client services
export const clientService = {
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  
  create: async (clientData: any) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  update: async (clientId: string, clientData: any) => {
    const response = await api.put(`/clients/${clientId}`, clientData);
    return response.data;
  },
  
  delete: async (clientId: string) => {
    const response = await api.delete(`/clients/${clientId}`);
    return response.data;
  }
};

// Recommendation services
export const recommendationService = {
  getAll: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },
  
  create: async (recommendationData: any) => {
    const response = await api.post('/recommendations', recommendationData);
    return response.data;
  },
  
  update: async (recommendationId: string, recommendationData: any) => {
    const response = await api.put(`/recommendations/${recommendationId}`, recommendationData);
    return response.data;
  },
  
  delete: async (recommendationId: string) => {
    const response = await api.delete(`/recommendations/${recommendationId}`);
    return response.data;
  }
};

// Access request services
export const accessRequestService = {
  getAll: async () => {
    const response = await api.get('/access-requests');
    return response.data;
  },
  
  create: async (requestData: any) => {
    const response = await api.post('/access-requests', requestData);
    return response.data;
  },
  
  update: async (requestId: string, requestData: any) => {
    const response = await api.put(`/access-requests/${requestId}`, requestData);
    return response.data;
  }
};

// Notification service
export const notificationService = {
  sendNotification: async (notificationData: any) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  }
};

export default api;
