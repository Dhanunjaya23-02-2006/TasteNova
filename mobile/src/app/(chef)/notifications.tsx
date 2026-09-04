import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'ORDER_PLACED': return { name: 'receipt', color: '#1565C0', bg: 'bg-blue-50' };
      case 'WALLET_CREDIT': return { name: 'cash', color: '#2E7D32', bg: 'bg-green-50' };
      case 'RATING': return { name: 'star', color: '#FF8F00', bg: 'bg-orange-50' };
      default: return { name: 'notifications', color: '#7B1FA2', bg: 'bg-purple-50' };
    }
  };

  const renderNotification = ({ item }: { item: any }) => {
    const iconData = getIcon(item.type);
    return (
      <View className={`bg-white p-4 mb-2 border-b border-gray-100 flex-row ${!item.isRead ? 'bg-green-50/30' : ''}`}>
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${iconData.bg}`}>
          <Ionicons name={iconData.name as any} size={24} color={iconData.color} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-text-primary text-base mb-1">{item.title}</Text>
          <Text className="text-sm text-text-secondary leading-5 mb-2">{item.body}</Text>
          <Text className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        {!item.isRead && (
          <View className="w-3 h-3 bg-primary rounded-full mt-2" />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 mt-10">
              <Ionicons name="notifications-off-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-semibold text-text-secondary mt-4">No notifications</Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-6">
                You&apos;re all caught up!
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
