import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders/chef/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView 
        className="flex-1 bg-background"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
      >
        
        {/* Revenue Summary */}
        <View className="p-4 bg-white mb-2 border-b border-gray-100">
          <Text className="text-lg font-bold text-text-primary mb-4">Revenue Summary</Text>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-text-secondary text-sm">Today</Text>
              <Text className="text-xl font-bold text-text-primary mt-1">
                ₹{stats?.todayEarnings?.toLocaleString() || '0'}
              </Text>
            </View>
            <View className="flex-1 border-l border-gray-100 pl-4">
              <Text className="text-text-secondary text-sm">Total Revenue</Text>
              <Text className="text-xl font-bold text-text-primary mt-1">
                ₹{stats?.totalRevenue?.toLocaleString() || '0'}
              </Text>
            </View>
          </View>
        </View>

        {/* AI Insights */}
        {stats?.aiInsights && stats.aiInsights.length > 0 && (
          <View className="p-4 bg-white mb-2 border-y border-gray-100">
            <View className="flex-row items-center mb-4">
              <Ionicons name="sparkles" size={20} color="#7B1FA2" />
              <Text className="text-lg font-bold text-text-primary ml-2">AI Insights</Text>
            </View>
            {stats.aiInsights.map((insight: string, idx: number) => (
              <View key={idx} className="bg-purple-50 p-3 rounded-xl mb-2 flex-row items-start">
                <Ionicons name="bulb-outline" size={18} color="#7B1FA2" className="mr-2" />
                <Text className="text-purple-800 text-sm flex-1">{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Top Dishes */}
        <View className="p-4 bg-white mb-2 border-y border-gray-100">
          <Text className="text-lg font-bold text-text-primary mb-4">Top Performing Dishes</Text>
          {stats?.topDishes?.length > 0 ? (
            stats.topDishes.map((dish: any, idx: number) => (
              <View key={idx} className="flex-row justify-between items-center py-3 border-b border-gray-50">
                <View className="flex-row items-center flex-1">
                  <Text className="font-bold text-gray-400 w-6">{idx + 1}</Text>
                  <Text className="font-semibold text-text-primary flex-1" numberOfLines={1}>
                    {dish.name}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold text-text-primary">{dish.sales} orders</Text>
                  <Text className="text-xs text-text-secondary">₹{dish.revenue}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text className="text-text-secondary text-center py-4">No dish data available yet</Text>
          )}
        </View>

        {/* Performance Metrics */}
        <View className="p-4 bg-white mb-6 border-y border-gray-100">
          <Text className="text-lg font-bold text-text-primary mb-4">Performance</Text>
          <View className="flex-row flex-wrap">
            <View className="w-1/2 p-2">
              <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 items-center">
                <Text className="text-text-secondary text-xs mb-1">Avg Rating</Text>
                <Text className="text-xl font-bold text-text-primary">{stats?.rating?.toFixed(1) || '0.0'}</Text>
              </View>
            </View>
            <View className="w-1/2 p-2">
              <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 items-center">
                <Text className="text-text-secondary text-xs mb-1">Total Orders</Text>
                <Text className="text-xl font-bold text-text-primary">{stats?.totalOrders || '0'}</Text>
              </View>
            </View>
            <View className="w-1/2 p-2">
              <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 items-center">
                <Text className="text-text-secondary text-xs mb-1">Customers</Text>
                <Text className="text-xl font-bold text-text-primary">{stats?.totalCustomers || '0'}</Text>
              </View>
            </View>
            <View className="w-1/2 p-2">
              <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 items-center">
                <Text className="text-text-secondary text-xs mb-1">Reviews</Text>
                <Text className="text-xl font-bold text-text-primary">{stats?.numReviews || '0'}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
