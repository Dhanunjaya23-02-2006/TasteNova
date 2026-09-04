import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error('Failed to fetch order details', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrderDetails();
  }, [id]);

  const handleCallCustomer = () => {
    if (order?.user?.phone) {
      Linking.openURL(`tel:${order.user.phone}`);
    } else {
      alert('Customer phone number not available');
    }
  };

  if (loading || !order) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        
        {/* Order Header */}
        <View className="bg-white p-4 mb-2 border-b border-gray-100">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-bold text-text-primary">
              #TN{order._id.substring(0, 5).toUpperCase()}
            </Text>
            <View className="bg-orange-50 px-3 py-1 rounded-full">
              <Text className="text-sm font-semibold text-accent">{order.status}</Text>
            </View>
          </View>
          <Text className="text-sm text-text-secondary">
            Placed at: {new Date(order.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* Customer Details */}
        <View className="bg-white p-4 mb-2 border-y border-gray-100">
          <Text className="text-base font-bold text-text-primary mb-3">Customer Details</Text>
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="font-semibold text-text-primary">{order.user?.name || 'Customer'}</Text>
              <Text className="text-sm text-text-secondary mt-1">
                {order.shippingAddress?.address || 'Address not available'}
              </Text>
              {order.shippingAddress?.landmark && (
                <Text className="text-xs text-gray-400 mt-1">Landmark: {order.shippingAddress.landmark}</Text>
              )}
            </View>
            <View className="flex-row">
              <TouchableOpacity 
                className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-2"
                onPress={handleCallCustomer}
              >
                <Ionicons name="call" size={20} color="#2E7D32" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center"
                onPress={() => router.push(`/(customer)/chat/${order._id}` as any)} // Assuming shared chat route
              >
                <Ionicons name="chatbubble" size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View className="bg-white p-4 mb-2 border-y border-gray-100">
          <Text className="text-base font-bold text-text-primary mb-3">Order Items</Text>
          {order.orderItems?.map((item: any, idx: number) => (
            <View key={idx} className="flex-row justify-between mb-3 pb-3 border-b border-gray-50">
              <View className="flex-row flex-1">
                <View className="w-6 h-6 border border-green-500 items-center justify-center mr-3 mt-1">
                  <View className="w-3 h-3 rounded-full bg-green-500" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="font-semibold text-text-primary">{item.name}</Text>
                  <Text className="text-xs text-text-secondary">₹{item.price} x {item.quantity}</Text>
                </View>
              </View>
              <Text className="font-semibold text-text-primary">₹{item.price * item.quantity}</Text>
            </View>
          ))}
          
          {/* Bill Details */}
          <View className="mt-2 space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">Item Total</Text>
              <Text className="font-medium text-text-primary">₹{order.itemsPrice}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-text-secondary">Taxes</Text>
              <Text className="font-medium text-text-primary">₹{order.taxPrice}</Text>
            </View>
            <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
              <Text className="font-bold text-text-primary">Total Bill</Text>
              <Text className="font-bold text-text-primary">₹{order.totalPrice}</Text>
            </View>
          </View>
        </View>

        {order.specialInstructions && (
          <View className="bg-white p-4 mb-6 border-y border-gray-100">
            <Text className="text-base font-bold text-text-primary mb-2">Special Instructions</Text>
            <Text className="text-text-secondary">{order.specialInstructions}</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
