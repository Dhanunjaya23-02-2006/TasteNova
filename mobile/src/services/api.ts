import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your machine's local IP address when running on a physical device
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.11:5001/api';

// Base API instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from SecureStore', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized / Token Expiry
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      
      // Need to dynamically import to avoid circular dependency
      const { useAuthStore } = require('../store/authStore');
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);
