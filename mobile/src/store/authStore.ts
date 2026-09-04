import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profilePic?: string;
  walletBalance?: number;
  businessName?: string;
  kitchenImage?: string;
  description?: string;
  deliveryRadius?: number;
  maxOrdersPerSlot?: number;
  isFssaiVerified?: boolean;
  isIdVerified?: boolean;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  restoreToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isSignout: false,

  signIn: async (token: string, user: User) => {
    try {
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      set({ token, user, isSignout: false });
    } catch (error) {
      console.error('Error saving auth state', error);
    }
  },

  signOut: async () => {
    try {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      set({ token: null, user: null, isSignout: true });
    } catch (error) {
      console.error('Error deleting auth state', error);
    }
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      
      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse user', e);
        }
      }

      if (token && user) {
        set({ token, user, isLoading: false });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error restoring auth state', error);
      set({ isLoading: false });
    }
  },

  updateUser: (updatedFields: Partial<User>) => {
    const { user } = get();
    if (user) {
      const newUser = { ...user, ...updatedFields };
      SecureStore.setItemAsync('user', JSON.stringify(newUser)).catch(console.error);
      set({ user: newUser });
    }
  },

  refreshUser: async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data) {
        const { user } = get();
        if (user) {
          const newUser = { ...user, ...res.data };
          await SecureStore.setItemAsync('user', JSON.stringify(newUser));
          set({ user: newUser });
        }
      }
    } catch (error) {
      console.error('Error refreshing user', error);
    }
  }
}));
