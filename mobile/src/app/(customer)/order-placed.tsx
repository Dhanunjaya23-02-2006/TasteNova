import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OrderPlacedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-24 h-24 bg-green-50 rounded-full items-center justify-center mb-6 border border-green-100">
          <Ionicons name="checkmark" size={48} color="#2E7D32" />
        </View>

        <Text className="text-3xl font-bold text-text-primary text-center mb-2">
          Order Placed!
        </Text>
        <Text className="text-base text-text-secondary text-center mb-8">
          Thank you for your order.
        </Text>

        <View className="w-full bg-background rounded-xl p-4 border border-gray-200 mb-8">
          <View className="flex-row justify-between mb-4">
            <Text className="text-text-secondary">Order ID</Text>
            <Text className="font-bold text-text-primary">TN1234567890</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Estimated Delivery</Text>
            <Text className="font-bold text-text-primary">30-35 mins</Text>
          </View>
        </View>

        <Text className="text-sm text-text-secondary text-center mb-8">
          You will receive updates on{'\n'}<Text className="font-bold">+91 9876543210</Text>
        </Text>

        <View className="w-full space-y-4">
          <TouchableOpacity 
            className="w-full bg-primary-dark py-4 rounded-xl items-center"
            onPress={() => router.push('/(customer)/tracking/TN1234567890')}
          >
            <Text className="text-white text-lg font-semibold">Track Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-full py-4 rounded-xl items-center mt-3 border border-gray-200"
            onPress={() => router.replace('/(customer)/(tabs)')}
          >
            <Text className="text-text-primary text-lg font-semibold">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
