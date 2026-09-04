import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthStore();

  const handleVerify = async () => {
    if (otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP');
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { 
        email, 
        otp 
      });
      
      if (res.data.token && res.data.user) {
        await signIn(res.data.token, res.data.user);
        // Root layout will auto-redirect to (tabs) once token is set
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 p-6 justify-center">
        <Text className="text-3xl font-bold text-text-primary mb-2">Verify OTP</Text>
        <Text className="text-base text-text-secondary mb-8">
          Enter the code sent to {email}
        </Text>

        <View className="mb-8">
          <TextInput
            className="w-full bg-background p-4 rounded-xl border border-gray-200 text-center text-2xl tracking-widest"
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <TouchableOpacity 
          className={`w-full bg-primary-dark py-4 rounded-xl items-center ${loading ? 'opacity-70' : ''}`}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text className="text-white text-lg font-semibold">{loading ? 'Verifying...' : 'Verify & Login'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="mt-6 items-center">
          <Text className="text-primary-dark font-semibold">Resend Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
