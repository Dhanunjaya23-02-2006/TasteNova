import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your machine's local IP address when running on a physical device
const API_URL = 'http://10.10.18.57:5001/api';

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

// Response interceptor for handling 401s and token refresh could go here
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized / Token Expiry
    if (error.response?.status === 401) {
      // Potentially clear token and redirect to login
      await SecureStore.deleteItemAsync('token');
      // trigger a logout action via state manager or navigation
    }
    return Promise.reject(error);
  }
);
