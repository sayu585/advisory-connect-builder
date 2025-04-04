
import axios from 'axios';

// Base API URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication Services
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
  },
  
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  }
};

// Recommendations Services
export const recommendationService = {
  getAll: async () => {
    const response = await api.get('/recommendations');
    return response.data;
  },
  
  create: async (recommendationData: any) => {
    const response = await api.post('/recommendations', recommendationData);
    return response.data;
  },
  
  update: async (id: string, recommendationData: any) => {
    const response = await api.put(`/recommendations/${id}`, recommendationData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/recommendations/${id}`);
    return response.data;
  }
};

// Client Services
export const clientService = {
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  
  create: async (clientData: any) => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },
  
  update: async (id: string, clientData: any) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  }
};

// Access Request Services
export const accessRequestService = {
  getAll: async () => {
    const response = await api.get('/access-requests');
    return response.data;
  },
  
  create: async (requestData: any) => {
    const response = await api.post('/access-requests', requestData);
    return response.data;
  },
  
  update: async (id: string, requestData: any) => {
    const response = await api.put(`/access-requests/${id}`, requestData);
    return response.data;
  }
};

// Notification Services
export const notificationService = {
  sendNotification: async (notificationData: any) => {
    const response = await api.post('/notifications', notificationData);
    return response.data;
  }
};

export default {
  authService,
  recommendationService,
  clientService,
  accessRequestService,
  notificationService
};
