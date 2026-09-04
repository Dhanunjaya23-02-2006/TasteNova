import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    const handleNewNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
    };

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('new_notification', handleNewNotification);
    }

    return () => {
      if (socket) {
        socket.off('new_notification', handleNewNotification);
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data || res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const getIconData = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS': return { icon: 'cube', color: 'bg-purple-100', iconColor: '#9333EA' };
      case 'PROMOTION': return { icon: 'pricetag', color: 'bg-orange-100', iconColor: '#FF8F00' };
      case 'SYSTEM': return { icon: 'information-circle', color: 'bg-blue-100', iconColor: '#2563EB' };
      default: return { icon: 'notifications', color: 'bg-green-100', iconColor: '#2E7D32' };
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
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-primary">Notifications</Text>
        </View>
        <TouchableOpacity onPress={fetchNotifications}>
          <Ionicons name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-background p-4">
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
            <Text className="text-text-secondary mt-4">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const { icon, color, iconColor } = getIconData(item.type);
            return (
              <TouchableOpacity 
                key={item._id} 
                className={`bg-white rounded-xl p-4 mb-4 flex-row shadow-sm border ${!item.isRead ? 'border-primary/30' : 'border-gray-100'}`}
                onPress={() => {
                  if (!item.isRead) markAsRead(item._id);
                }}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center ${color}`}>
                  <Ionicons name={icon as any} size={20} color={iconColor} />
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row justify-between items-start">
                    <Text className={`font-bold text-base mb-1 ${!item.isRead ? 'text-primary' : 'text-text-primary'}`}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View className="w-2 h-2 bg-primary rounded-full mt-2" />}
                  </View>
                  <Text className="text-sm text-text-secondary leading-5 mb-2">{item.message || item.body}</Text>
                  <Text className="text-xs text-text-secondary">{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
