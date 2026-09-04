import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../../services/api';
import { socketService } from '../../../services/socket';
import { useFocusEffect } from 'expo-router';

export default function FavoritesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chefs' | 'dishes'>('chefs');
  const [favorites, setFavorites] = useState<{ chefs: any[], dishes: any[] }>({ chefs: [], dishes: [] });
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/favourites');
      setFavorites({
        chefs: res.data.chefs || [],
        dishes: res.data.dishes || []
      });
    } catch (error) {
      console.error('Failed to fetch favorites', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  useEffect(() => {
    const handleFavoritesUpdate = () => {
      // Re-fetch when socket notifies of an update
      fetchFavorites();
    };

    const socket = socketService.getSocket();
    if (socket) {
      socket.on('favorites_updated', handleFavoritesUpdate);
    }

    return () => {
      if (socket) {
        socket.off('favorites_updated', handleFavoritesUpdate);
      }
    };
  }, []);

  const toggleFavoriteChef = async (chefId: string) => {
    try {
      await api.put(`/users/follow/${chefId}`);
      // UI will update automatically via socket or we can refetch directly
      fetchFavorites();
    } catch (error) {
      console.error('Failed to toggle chef favorite', error);
    }
  };

  const toggleFavoriteDish = async (dishId: string) => {
    try {
      await api.put(`/users/favorite-dish/${dishId}`);
      fetchFavorites();
    } catch (error) {
      console.error('Failed to toggle dish favorite', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-text-primary">Favorites</Text>
        <TouchableOpacity onPress={fetchFavorites}>
          <Ionicons name="refresh" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100">
        <TouchableOpacity 
          className={`flex-1 py-3 items-center ${activeTab === 'chefs' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('chefs')}
        >
          <Text className={`font-semibold ${activeTab === 'chefs' ? 'text-primary' : 'text-text-secondary'}`}>Chefs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 items-center ${activeTab === 'dishes' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('dishes')}
        >
          <Text className={`font-semibold ${activeTab === 'dishes' ? 'text-primary' : 'text-text-secondary'}`}>Dishes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-background p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center mt-20">
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : activeTab === 'chefs' ? (
          favorites.chefs.length > 0 ? (
            favorites.chefs.map((chef) => (
              <TouchableOpacity 
                key={chef._id}
                className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-sm border border-gray-100"
                onPress={() => router.push(`/(customer)/chef/${chef._id}`)}
              >
                <Image source={{ uri: chef.kitchenImage || chef.profileImage || 'https://via.placeholder.com/150' }} className="w-16 h-16 rounded-full bg-gray-200" />
                <View className="ml-4 flex-1">
                  <Text className="font-bold text-text-primary text-base">{chef.businessName || chef.name}</Text>
                  <Text className="text-xs text-text-secondary mb-1">Chef</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#FF8F00" />
                    <Text className="text-xs font-semibold ml-1">{chef.rating}</Text>
                    <Text className="text-xs text-text-secondary ml-1">({chef.numReviews})</Text>
                  </View>
                </View>
                <TouchableOpacity className="p-2" onPress={() => toggleFavoriteChef(chef._id)}>
                  <Ionicons name="heart" size={24} color="#D32F2F" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="heart-outline" size={48} color="#CCCCCC" />
              <Text className="text-text-secondary mt-4">No favorite chefs yet</Text>
            </View>
          )
        ) : (
          favorites.dishes.length > 0 ? (
            favorites.dishes.map((dish) => (
              <View 
                key={dish._id}
                className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-sm border border-gray-100"
              >
                <Image source={{ uri: dish.image || 'https://via.placeholder.com/150' }} className="w-16 h-16 rounded-lg bg-gray-200" />
                <View className="ml-4 flex-1">
                  <Text className="font-bold text-text-primary text-base">{dish.name}</Text>
                  <Text className="text-xs text-text-secondary mb-1" numberOfLines={1}>{dish.description}</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="font-bold text-primary">₹{dish.price}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#FF8F00" />
                      <Text className="text-xs font-semibold ml-1">{dish.rating}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity className="p-2 ml-2" onPress={() => toggleFavoriteDish(dish._id)}>
                  <Ionicons name="heart" size={24} color="#D32F2F" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View className="flex-1 items-center justify-center mt-20">
              <Ionicons name="fast-food-outline" size={48} color="#CCCCCC" />
              <Text className="text-text-secondary mt-4">No favorite dishes yet</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
