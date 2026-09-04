import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const { email: initialEmail } = useLocalSearchParams();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail as string || '');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'chef'>('user');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/users', { 
        name,
        email, 
        phone,
        password,
        role
      });
      
      if (res.data.token && res.data.user) {
        await signIn(res.data.token, res.data.user);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
        <Text className="text-3xl font-bold text-text-primary mb-2">Create Account</Text>
        <Text className="text-base text-text-secondary mb-6">Sign up to explore delicious home-cooked meals</Text>

        <View className="flex-row bg-gray-100 p-1 rounded-xl mb-6">
          <TouchableOpacity 
            className="flex-1 py-3 items-center rounded-lg"
            style={role === 'user' ? { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
            onPress={() => setRole('user')}
          >
            <Text className="font-semibold" style={{ color: role === 'user' ? '#2E7D32' : '#666666' }}>Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-1 py-3 items-center rounded-lg"
            style={role === 'chef' ? { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 } : { backgroundColor: 'transparent' }}
            onPress={() => setRole('chef')}
          >
            <Text className="font-semibold" style={{ color: role === 'chef' ? '#2E7D32' : '#666666' }}>Home Chef</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">Full Name</Text>
          <TextInput
            className="w-full bg-background p-4 rounded-xl border border-gray-200"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
        </View>

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

        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-primary mb-2">Phone Number</Text>
          <TextInput
            className="w-full bg-background p-4 rounded-xl border border-gray-200"
            placeholder="+91 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View className="mb-8">
          <Text className="text-sm font-semibold text-text-primary mb-2">Password</Text>
          <TextInput
            className="w-full bg-background p-4 rounded-xl border border-gray-200"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="w-full bg-primary-dark py-4 rounded-xl items-center"
          style={{ opacity: loading ? 0.7 : 1 }}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">{loading ? 'Creating...' : 'Sign Up'}</Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-center mt-6">
          <Text className="text-text-secondary">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-primary-dark font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
