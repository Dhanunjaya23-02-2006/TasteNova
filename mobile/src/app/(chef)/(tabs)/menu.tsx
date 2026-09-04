import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, RelativePathString } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';

export default function ChefMenuScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await api.get(`/menu?chef=${user?._id}`);
      setMenuItems(res.data || []);
    } catch (error) {
      console.error('Failed to fetch menu items', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchMenu();
    }
  }, [user, fetchMenu]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMenu();
  }, [fetchMenu]);

  const toggleAvailability = async (id: string, currentValue: boolean) => {
    try {
      // Optimistic update
      setMenuItems(prev => prev.map(item => item._id === id ? { ...item, available: !currentValue } : item));
      await api.put(`/menu/${id}`, { available: !currentValue });
    } catch (error) {
      console.error('Failed to toggle availability', error);
      // Revert on failure
      fetchMenu();
    }
  };

  const renderMenuItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 mb-3 rounded-xl flex-row items-center shadow-sm border border-gray-100">
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        className="w-20 h-20 rounded-lg bg-gray-200"
      />
      <View className="flex-1 ml-4">
        <Text className="font-bold text-text-primary text-base" numberOfLines={1}>{item.name}</Text>
        <Text className="text-primary font-semibold mt-1">₹{item.price}</Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-xs text-text-secondary mr-2">Available</Text>
          <Switch 
            value={item.available} 
            onValueChange={() => toggleAvailability(item._id, item.available)}
            trackColor={{ false: '#E0E0E0', true: '#A5D6A7' }}
            thumbColor={item.available ? '#2E7D32' : '#F5F5F5'}
          />
        </View>
      </View>
      <View className="justify-between items-end h-full py-1">
        <TouchableOpacity 
          className="bg-gray-100 p-2 rounded-full"
          onPress={() => router.push(`/(chef)/edit-dish/${item._id}` as RelativePathString)}
        >
          <Ionicons name="pencil" size={18} color="#1A1A1A" />
        </TouchableOpacity>
        <View className="flex-row items-center mt-4">
          <Ionicons name="star" size={12} color="#FF8F00" />
          <Text className="text-xs font-semibold ml-1">{item.rating?.toFixed(1) || '0.0'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 py-3 bg-white flex-row items-center justify-between border-b border-gray-100">
        <Text className="text-xl font-bold text-text-primary">My Menu</Text>
        <TouchableOpacity 
          className="bg-primary px-4 py-2 rounded-full flex-row items-center"
          onPress={() => router.push('/(chef)/add-dish' as RelativePathString)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold ml-1">Add Dish</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item._id}
          renderItem={renderMenuItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
          ListEmptyComponent={() => (
            <View className="items-center justify-center py-10 mt-10">
              <Ionicons name="restaurant-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-semibold text-text-secondary mt-4">Your menu is empty</Text>
              <Text className="text-sm text-gray-400 text-center mt-2 px-6">
                Add dishes to start receiving orders.
              </Text>
              <TouchableOpacity 
                className="mt-6 bg-primary px-6 py-3 rounded-xl"
                onPress={() => router.push('/(chef)/add-dish' as RelativePathString)}
              >
                <Text className="text-white font-bold">Add Your First Dish</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
