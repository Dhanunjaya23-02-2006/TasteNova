import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    kitchenImage: user?.kitchenImage || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/users/profile', {
        name: formData.name,
        phone: formData.phone,
      });
      await api.put('/users/chef-settings', {
        businessName: formData.businessName,
        kitchenImage: formData.kitchenImage,
      });
      await refreshUser();
      alert('Profile updated successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background p-4">
        
        <View className="items-center mb-8 mt-4">
          <View className="relative">
            <Image 
              source={{ uri: formData.kitchenImage || 'https://via.placeholder.com/150' }} 
              className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-sm"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-primary w-10 h-10 rounded-full items-center justify-center border-4 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 space-y-4">
          <View>
            <Text className="text-text-secondary font-medium mb-1">Kitchen/Business Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
              value={formData.businessName}
              onChangeText={(t) => setFormData({...formData, businessName: t})}
            />
          </View>

          <View>
            <Text className="text-text-secondary font-medium mb-1">Your Full Name</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
            />
          </View>

          <View>
            <Text className="text-text-secondary font-medium mb-1">Phone Number</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
              value={formData.phone}
              onChangeText={(t) => setFormData({...formData, phone: t})}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity 
          className="bg-primary p-4 rounded-xl items-center flex-row justify-center mb-8 shadow-sm"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
