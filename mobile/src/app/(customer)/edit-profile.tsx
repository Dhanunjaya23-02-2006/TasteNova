import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = () => {
    // In a real implementation, call API to update user
    console.log('Saving profile', { name, email, phone });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
              <Ionicons name="chevron-back" size={28} color="#2E7D32" />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* Avatar Section */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-primary-light rounded-full items-center justify-center mb-3 shadow-sm border-2 border-white">
              <Text className="text-4xl text-white font-bold">{name.charAt(0) || 'A'}</Text>
              
              <TouchableOpacity className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow border border-gray-100">
                <Ionicons name="camera" size={16} color="#2E7D32" />
              </TouchableOpacity>
            </View>
            <Text className="text-primary font-semibold text-base">Change Photo</Text>
          </View>

          {/* Form Group */}
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8">
            
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <Text className="w-24 text-base font-medium text-text-primary">Name</Text>
              <TextInput 
                className="flex-1 text-base text-text-primary h-8"
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#999"
              />
            </View>

            <View className="flex-row items-center p-4 border-b border-gray-100">
              <Text className="w-24 text-base font-medium text-text-primary">Phone</Text>
              <TextInput 
                className="flex-1 text-base text-text-primary h-8"
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View className="flex-row items-center p-4">
              <Text className="w-24 text-base font-medium text-text-primary">Email</Text>
              <TextInput 
                className="flex-1 text-base text-text-primary h-8"
                value={email}
                onChangeText={setEmail}
                placeholder="Email Address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

          </View>

          {/* Save Button */}
          <TouchableOpacity 
            className="bg-primary py-4 rounded-xl items-center shadow-sm"
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Save Changes</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
