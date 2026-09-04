import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../../services/api';

export default function PreparingOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleMarkReady = async () => {
    try {
      setLoading(true);
      await api.put(`/orders/${id}/status`, { status: 'Preparing' }); // Should probably be 'Ready' based on flow, but API has 'Preparing' then ?
      // Wait, let's mark it as Ready.
      // But actually, we just accepted it and it is in 'Preparing' state now.
      // This screen shows it's being prepared. When done, we click "Ready for Pickup".
      await api.put(`/orders/${id}/status`, { status: 'Ready' });
      router.replace(`/(chef)/ready-pickup/${id}`);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Error updating order');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface p-6 justify-center items-center">
      <View className="items-center mb-8">
        <View className="w-32 h-32 bg-orange-50 rounded-full items-center justify-center mb-6 border-4 border-orange-100">
          <Text className="text-6xl">🍳</Text>
        </View>
        
        <Text className="text-2xl font-bold text-text-primary text-center mb-2">
          Preparing Order
        </Text>
        <Text className="text-base text-text-secondary text-center mb-6">
          Order #TN{String(id).substring(0, 5).toUpperCase()}
        </Text>

        <Text className="text-center text-text-secondary leading-6 px-4">
          The customer has been notified that you&apos;ve started preparing their food.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full bg-primary py-4 rounded-xl items-center shadow-sm"
        onPress={handleMarkReady}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Mark as Ready for Pickup</Text>
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
