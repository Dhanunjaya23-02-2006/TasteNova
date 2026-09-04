import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function KitchenSetupScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    description: user?.description || '',
    deliveryRadius: user?.deliveryRadius?.toString() || '5',
    maxOrdersPerSlot: user?.maxOrdersPerSlot?.toString() || '10',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put('/users/chef-settings', {
        ...formData,
        deliveryRadius: Number(formData.deliveryRadius),
        maxOrdersPerSlot: Number(formData.maxOrdersPerSlot)
      });
      await refreshUser();
      alert('Kitchen setup completed successfully!');
      router.back();
    } catch (error) {
      console.error('Failed to save kitchen setup', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 p-4 bg-background">
        
        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-text-primary mb-4">Kitchen Details</Text>
          
          <Text className="text-text-secondary font-medium mb-1 mt-2">Kitchen/Business Name</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
            value={formData.businessName}
            onChangeText={(t) => setFormData({...formData, businessName: t})}
            placeholder="e.g. Mama's Kitchen"
          />

          <Text className="text-text-secondary font-medium mb-1 mt-4">Description</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary h-24"
            value={formData.description}
            onChangeText={(t) => setFormData({...formData, description: t})}
            placeholder="Tell customers about your food..."
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-text-primary mb-4">Operations</Text>
          
          <Text className="text-text-secondary font-medium mb-1 mt-2">Delivery Radius (km)</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
            value={formData.deliveryRadius}
            onChangeText={(t) => setFormData({...formData, deliveryRadius: t})}
            keyboardType="numeric"
            placeholder="5"
          />

          <Text className="text-text-secondary font-medium mb-1 mt-4">Max Orders Per Slot</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-text-primary"
            value={formData.maxOrdersPerSlot}
            onChangeText={(t) => setFormData({...formData, maxOrdersPerSlot: t})}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>

        <TouchableOpacity 
          className="bg-primary p-4 rounded-xl items-center flex-row justify-center mb-8"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Save & Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
