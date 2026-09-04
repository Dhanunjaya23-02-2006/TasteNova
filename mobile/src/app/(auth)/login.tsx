import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore(state => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });

      const { accessToken, _id, name, email: userEmail, role, phone, profilePic, walletBalance } = res.data;
      if (accessToken) {
        await signIn(accessToken, { _id, name, email: userEmail, role, phone, profilePic, walletBalance });
        if (role === 'chef') {
          router.replace('/(chef)/(tabs)');
        } else {
          router.replace('/(customer)/(tabs)');
        }
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        router.push({ pathname: '/(auth)/signup', params: { email } });
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 p-6 justify-center">
        <Text className="text-3xl font-bold text-text-primary mb-2">Welcome Back!</Text>
        <Text className="text-base text-text-secondary mb-8">Enter your email to login or register</Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">Email Address</Text>
          <TextInput
            className="w-full bg-background p-4 rounded-xl border border-gray-200"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-text-primary mb-2">Password</Text>
          <TextInput
            className="w-full bg-background p-4 rounded-xl border border-gray-200"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          className="w-full bg-primary-dark py-4 rounded-xl items-center"
          style={{ opacity: loading ? 0.7 : 1 }}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">{loading ? 'Sending...' : 'Continue'}</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-text-secondary">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="text-primary-dark font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
