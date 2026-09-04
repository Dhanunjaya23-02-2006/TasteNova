import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

type TabType = 'New' | 'Accepted' | 'Preparing';

export default function ChefOrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('New');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      // Assuming GET /api/orders returns all orders for the logged-in chef
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch chef orders', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (activeTab === 'New') return order.status === 'Placed';
      if (activeTab === 'Accepted') return order.status === 'Accepted';
      if (activeTab === 'Preparing') return order.status === 'Preparing';
      return false;
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      fetchOrders(); // refresh list
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const timeString = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="font-bold text-base text-text-primary">
            #TN{item._id.substring(0, 5).toUpperCase()}
          </Text>
          <Text className="text-xs text-text-secondary">{timeString}</Text>
        </View>

        <View className="mb-3">
          <Text className="font-semibold text-text-primary">{item.user?.name || 'Customer'}</Text>
          <Text className="text-xs text-text-secondary mt-1" numberOfLines={1}>
            {item.shippingAddress?.address || 'Address not available'}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm text-text-secondary">
            {item.orderItems?.length || 0} Items
          </Text>
          <Text className="font-bold text-text-primary text-base">
            ₹{item.totalPrice}
          </Text>
        </View>

        {activeTab === 'New' && (
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 py-3 items-center rounded-xl border border-error mr-2"
              onPress={() => updateOrderStatus(item._id, 'Rejected')}
            >
              <Text className="text-error font-semibold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 py-3 items-center rounded-xl bg-primary ml-2"
              onPress={() => router.push(`/(chef)/accept-order/${item._id}`)}
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Accepted' && (
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="flex-1 py-3 items-center rounded-xl border border-error mr-2"
              onPress={() => updateOrderStatus(item._id, 'Rejected')}
            >
              <Text className="text-error font-semibold">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 py-3 items-center rounded-xl bg-primary ml-2"
              onPress={() => updateOrderStatus(item._id, 'Preparing')}
            >
              <Text className="text-white font-semibold">Start Preparing</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Preparing' && (
          <TouchableOpacity 
            className="w-full py-3 items-center rounded-xl bg-primary"
            onPress={() => router.push(`/(chef)/ready-pickup/${item._id}`)}
          >
            <Text className="text-white font-semibold">Mark as Ready</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredOrders = getFilteredOrders();

  const renderTabs = () => {
    const tabs: { label: TabType, count: number }[] = [
      { label: 'New', count: orders.filter(o => o.status === 'Placed').length },
      { label: 'Accepted', count: orders.filter(o => o.status === 'Accepted').length },
      { label: 'Preparing', count: orders.filter(o => o.status === 'Preparing').length },
    ];

    return (
      <View className="flex-row bg-white pt-2 border-b border-gray-100">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.label}
            className={`flex-1 pb-3 items-center border-b-2 ${activeTab === tab.label ? 'border-primary' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab.label)}
          >
            <Text className={`font-semibold ${activeTab === tab.label ? 'text-primary' : 'text-text-secondary'}`}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 py-3 bg-white flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-xl font-bold text-text-primary">Orders</Text>
        <TouchableOpacity onPress={() => fetchOrders()}>
          <Ionicons name="refresh" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
      
      {renderTabs()}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 mt-10">
              <Ionicons name="receipt-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-semibold text-text-secondary mt-4">No {activeTab.toLowerCase()} orders</Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-6">
                When you receive new orders, they will appear here.
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
