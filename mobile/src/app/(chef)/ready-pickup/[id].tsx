import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function ReadyPickupScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleHandover = async () => {
    try {
      setLoading(true);
      await api.put(`/orders/${id}/status`, { status: 'Completed' });
      router.replace(`/(chef)/(tabs)`);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Error updating order');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface p-6 justify-center items-center">
      <View className="items-center mb-8">
        <View className="w-32 h-32 bg-green-50 rounded-full items-center justify-center mb-6 border-4 border-green-100">
          <Ionicons name="bag-check-outline" size={60} color="#2E7D32" />
        </View>
        
        <Text className="text-2xl font-bold text-text-primary text-center mb-2">
          Ready for Pickup!
        </Text>
        <Text className="text-base text-text-secondary text-center mb-6">
          Order #TN{String(id).substring(0, 5).toUpperCase()}
        </Text>

        <View className="bg-white p-4 rounded-xl border border-gray-100 w-full mb-6">
          <Text className="text-text-primary font-medium text-center mb-2">
            Waiting for Delivery Partner
          </Text>
          <View className="flex-row items-center justify-center">
             <ActivityIndicator color="#FF8F00" size="small" className="mr-2" />
             <Text className="text-text-secondary text-sm">Please hand over the order to Rapido/Uber partner when they arrive.</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
        onPress={handleHandover}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Mark as Handed Over & Completed</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        className="mt-6"
        onPress={() => router.push(`/(chef)/order-details/${id}`)}
      >
        <Text className="text-primary font-semibold text-base">View Order Details</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
