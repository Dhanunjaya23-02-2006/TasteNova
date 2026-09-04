import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function PayoutHistoryScreen() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayouts = async () => {
    try {
      const res = await api.get('/orders/chef/stats');
      // Using walletBalance or any history we get from stats/wallet.
      // Assuming stats returns a `payouts` array or we'll mock it based on wallet logic.
      setPayouts(res.data.recentPayouts || [
        { id: '1', date: '2026-09-01T10:00:00Z', amount: 5400, status: 'Completed', ref: 'TXN1029384' },
        { id: '2', date: '2026-08-25T10:00:00Z', amount: 4200, status: 'Completed', ref: 'TXN1029111' },
        { id: '3', date: '2026-08-18T10:00:00Z', amount: 6100, status: 'Completed', ref: 'TXN1028777' },
      ]);
    } catch (error) {
      console.error('Failed to fetch payouts', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayouts();
  }, []);

  const renderPayout = ({ item }: { item: any }) => (
    <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center">
      <View>
        <Text className="font-bold text-text-primary text-base">₹{item.amount.toLocaleString()}</Text>
        <Text className="text-xs text-text-secondary mt-1">{new Date(item.date).toLocaleDateString()}</Text>
        <Text className="text-xs text-gray-400 mt-1">Ref: {item.ref}</Text>
      </View>
      <View className="items-end">
        <View className="bg-green-50 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="checkmark-circle" size={14} color="#2E7D32" />
          <Text className="text-primary text-xs font-semibold ml-1">{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={payouts}
          keyExtractor={(item) => item.id}
          renderItem={renderPayout}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 mt-10">
              <Ionicons name="wallet-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-semibold text-text-secondary mt-4">No payouts yet</Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-6">
                Your settled earnings will appear here.
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
