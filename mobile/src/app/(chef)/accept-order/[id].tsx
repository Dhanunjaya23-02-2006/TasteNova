import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function AcceptOrderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setLoading(true);
      await api.put(`/orders/${id}/status`, { status: 'Accepted' });
      // Go to preparing screen next
      router.replace(`/(chef)/preparing-order/${id}`);
    } catch (error) {
      console.error('Failed to accept order', error);
      alert('Error accepting order');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await api.put(`/orders/${id}/status`, { status: 'Rejected' });
      router.back();
    } catch (error) {
      console.error('Failed to reject order', error);
      alert('Error rejecting order');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface justify-center px-6">
      
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="notifications-outline" size={48} color="#2E7D32" />
        </View>
        
        <Text className="text-2xl font-bold text-text-primary text-center mb-2">
          New Order Received!
        </Text>
        <Text className="text-base text-text-secondary text-center mb-6">
          Order #TN{String(id).substring(0, 5).toUpperCase()}
        </Text>

        <Text className="text-lg font-semibold text-text-primary mb-1">
          Please confirm if you can prepare this order.
        </Text>
        <Text className="text-sm text-error font-medium">
          Auto-rejects in 90 seconds.
        </Text>
      </View>

      <View className="space-y-4">
        <TouchableOpacity 
          className="bg-primary py-4 rounded-xl items-center shadow-sm"
          onPress={handleAccept}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Accept & Start Preparing</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white border border-error py-4 rounded-xl items-center"
          onPress={handleReject}
          disabled={loading}
        >
          <Text className="text-error font-bold text-lg">Reject Order</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
