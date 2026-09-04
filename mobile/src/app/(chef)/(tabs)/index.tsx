import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

export default function ChefDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders/chef/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch chef stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const toggleKitchen = async () => {
    try {
      const res = await api.put('/users/chef-settings', { isOpen: !isOpen });
      setIsOpen(res.data.isOpen);
    } catch (error: any) {
      console.error('Failed to toggle kitchen', error.response?.data?.message);
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
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-100">
        <View>
          <Text className="text-lg font-bold text-text-primary">
            Good morning, {user?.name?.split(' ')[0] || 'Chef'}! 👋
          </Text>
          <Text className="text-xs text-text-secondary">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </Text>
        </View>
        <TouchableOpacity
          className={`px-4 py-2 rounded-full ${isOpen ? 'bg-primary' : 'bg-gray-200'}`}
          onPress={toggleKitchen}
        >
          <Text className={`text-sm font-semibold ${isOpen ? 'text-white' : 'text-text-secondary'}`}>
            {isOpen ? 'Open' : 'Closed'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
      >
        {/* Today's Overview Cards */}
        <View className="px-4 pt-4">
          <Text className="text-base font-bold text-text-primary mb-3">Today&apos;s Overview</Text>
          <View className="flex-row">
            <View className="flex-1 bg-white p-4 rounded-xl mr-2 border border-gray-100">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="receipt-outline" size={20} color="#2E7D32" />
              </View>
              <Text className="text-2xl font-bold text-text-primary">{stats?.todayOrders || 0}</Text>
              <Text className="text-xs text-text-secondary">Orders</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl ml-2 border border-gray-100">
              <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center mb-2">
                <Ionicons name="cash-outline" size={20} color="#2E7D32" />
              </View>
              <Text className="text-2xl font-bold text-text-primary">₹{stats?.todayEarnings?.toLocaleString() || '0'}</Text>
              <Text className="text-xs text-text-secondary">Earnings</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row px-4 mt-3">
          <View className="flex-1 bg-white p-3 rounded-xl mr-2 border border-gray-100 items-center">
            <View className="flex-row items-center">
              <Ionicons name="star" size={16} color="#FF8F00" />
              <Text className="text-lg font-bold text-text-primary ml-1">{stats?.rating?.toFixed(1) || '0.0'}</Text>
            </View>
            <Text className="text-xs text-text-secondary">Rating</Text>
          </View>
          <View className="flex-1 bg-white p-3 rounded-xl mr-2 border border-gray-100 items-center">
            <Text className="text-lg font-bold text-text-primary">{stats?.activeOrders || 0}</Text>
            <Text className="text-xs text-text-secondary">Active</Text>
          </View>
          <View className="flex-1 bg-white p-3 rounded-xl border border-gray-100 items-center">
            <Text className="text-lg font-bold text-text-primary">{stats?.totalCustomers || 0}</Text>
            <Text className="text-xs text-text-secondary">Customers</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mt-6">
          <Text className="text-base font-bold text-text-primary mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap">
            {[
              { title: 'Analytics', icon: 'bar-chart-outline', route: '/(chef)/analytics', color: '#2E7D32' },
              { title: 'Payouts', icon: 'wallet-outline', route: '/(chef)/payout-history', color: '#1565C0' },
              { title: 'Growth', icon: 'trending-up-outline', route: '/(chef)/growth', color: '#FF8F00' },
              { title: 'Community', icon: 'people-outline', route: '/(chef)/community', color: '#7B1FA2' },
            ].map((action, idx) => (
              <TouchableOpacity
                key={idx}
                className="w-1/4 items-center mb-4"
                onPress={() => router.push(action.route as any)}
              >
                <View className="w-12 h-12 rounded-full items-center justify-center mb-1" style={{ backgroundColor: action.color + '15' }}>
                  <Ionicons name={action.icon as any} size={22} color={action.color} />
                </View>
                <Text className="text-xs text-text-primary font-medium">{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Orders */}
        <View className="px-4 mt-2 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-text-primary">Today&apos;s Orders</Text>
            <TouchableOpacity onPress={() => router.push('/orders')}>
              <Text className="text-primary font-semibold text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {stats?.activeOrders === 0 ? (
            <View className="bg-white p-6 rounded-xl border border-gray-100 items-center">
              <Ionicons name="receipt-outline" size={40} color="#CCCCCC" />
              <Text className="text-text-secondary mt-2">No active orders right now</Text>
            </View>
          ) : (
            <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {[1, 2].map((_, idx) => (
                <TouchableOpacity
                  key={idx}
                  className={`flex-row items-center p-4 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}
                  onPress={() => router.push('/(chef)/order-details/sample' as any)}
                >
                  <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center">
                    <Text className="text-lg">🍲</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-text-primary text-sm">#TN{1025 + idx}</Text>
                    <Text className="text-xs text-text-secondary">2 Items · ₹{450 + idx * 50}</Text>
                  </View>
                  <View className="items-end">
                    <View className="bg-orange-50 px-2 py-1 rounded-full">
                      <Text className="text-xs font-semibold text-accent">New</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Reviews */}
        {stats?.recentReviews && stats.recentReviews.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-base font-bold text-text-primary mb-3">Recent Reviews</Text>
            {stats.recentReviews.map((review: any, idx: number) => (
              <View key={idx} className="bg-white p-4 rounded-xl border border-gray-100 mb-2">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-primary-light rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-sm">{review.user?.name?.charAt(0) || 'U'}</Text>
                  </View>
                  <Text className="font-semibold text-text-primary ml-2 flex-1">{review.user?.name || 'Customer'}</Text>
                  <View className="flex-row items-center">
                    {[...Array(5)].map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color={i < review.rating ? '#FF8F00' : '#E0E0E0'} />
                    ))}
                  </View>
                </View>
                <Text className="text-sm text-text-secondary">{review.comment}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
