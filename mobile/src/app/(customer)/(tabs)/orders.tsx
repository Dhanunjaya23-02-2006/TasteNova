import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { socketService } from '../../../services/socket';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    const handleStatusUpdate = (updatedOrder: any) => {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order
        )
      );
    };

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('order_status_update', handleStatusUpdate);
    }

    return () => {
      if (socket) {
        socket.off('order_status_update', handleStatusUpdate);
      }
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/myorders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-50 text-green-700';
      case 'Cancelled': return 'bg-red-50 text-red-700';
      case 'Completed': return 'bg-blue-50 text-blue-700';
      default: return 'bg-orange-50 text-orange-700';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-text-primary">My Orders</Text>
        <TouchableOpacity onPress={fetchOrders}>
          <Ionicons name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-10">
            <Text className="text-text-secondary">No orders found.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity 
              key={order._id} 
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
              onPress={() => router.push(`/(customer)/order/${order._id}`)}
            >
              <View className="flex-row justify-between items-center mb-3 border-b border-gray-100 pb-3">
                <View className="flex-row items-center">
                  <Image source={{ uri: order.chef?.kitchenImage || 'https://via.placeholder.com/150' }} className="w-10 h-10 rounded-full bg-gray-200" />
                  <View className="ml-3">
                    <Text className="font-bold text-text-primary">{order.chef?.businessName || order.chef?.name || 'Chef'}</Text>
                    <Text className="text-xs text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-text-primary">₹{order.totalAmount}</Text>
                  <View className={`px-2 py-1 rounded mt-1 ${getStatusColor(order.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-semibold ${getStatusColor(order.status).split(' ')[1]}`}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text className="text-sm text-text-secondary mb-3">
                {order.items.map((item: any) => `${item.dish?.name} x${item.quantity}`).join(', ')}
              </Text>
              
              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1 py-2 border border-primary rounded-lg items-center">
                  <Text className="text-primary font-semibold">Reorder</Text>
                </TouchableOpacity>
                {(order.status === 'Completed' || order.status === 'Delivered') && (
                  <TouchableOpacity className="flex-1 py-2 border border-gray-300 rounded-lg items-center">
                    <Text className="text-text-primary font-semibold">Rate Order</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
