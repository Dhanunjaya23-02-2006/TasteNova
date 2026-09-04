import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const [banners, setBanners] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [bannersRes, chefsRes, offersRes] = await Promise.all([
        api.get('/banners/active'),
        api.get('/users/chefs/featured'),
        api.get('/offers/public')
      ]);
      setBanners(bannersRes.data.data || []);
      setChefs(chefsRes.data.data || []);
      setOffers(offersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch home data', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 1, name: 'North Indian', icon: '🍲' },
    { id: 2, name: 'South Indian', icon: '🍛' },
    { id: 3, name: 'Biryani', icon: '🥘' },
    { id: 4, name: 'Snacks', icon: '🥟' },
    { id: 5, name: 'Healthy', icon: '🥗' },
  ];

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
      <View className="flex-row justify-between items-center px-4 py-3 bg-white">
        <TouchableOpacity 
          className="flex-row items-center flex-1"
          onPress={() => router.push('/(customer)/location')}
        >
          <Ionicons name="location" size={24} color="#2E7D32" />
          <View className="ml-2">
            <Text className="text-xs text-text-secondary">Deliver to</Text>
            <Text className="text-sm font-bold text-text-primary" numberOfLines={1}>
              Gachibowli, Hyderabad
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color="#1A1A1A" className="ml-1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(customer)/notifications')}>
          <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        {/* Search Bar (Navigates to search tab) */}
        <TouchableOpacity 
          className="mx-4 my-4 flex-row items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100"
          onPress={() => router.push('/(customer)/(tabs)/search')}
        >
          <Ionicons name="search-outline" size={20} color="#666666" />
          <Text className="ml-2 text-text-secondary">Search food, chefs, cuisines...</Text>
        </TouchableOpacity>

        {/* Banners */}
        {banners.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mb-6">
            {banners.map((banner: any) => (
              <TouchableOpacity key={banner._id} className="mr-4">
                <Image 
                  source={{ uri: banner.imageUrl }} 
                  className="w-80 h-40 rounded-xl"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Categories */}
        <View className="mb-6 px-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-text-primary">Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(customer)/categories')}>
              <Text className="text-primary font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id} 
                className="items-center mr-6"
                onPress={() => router.push({ pathname: '/(customer)/chef-listing', params: { category: cat.name } })}
              >
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100 mb-2">
                  <Text className="text-2xl">{cat.icon}</Text>
                </View>
                <Text className="text-xs text-text-primary font-medium">{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Picks / Featured Chefs */}
        <View className="mb-6 px-4">
          <Text className="text-lg font-bold text-text-primary mb-3">Top Picks for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {chefs.map((chef: any) => (
              <TouchableOpacity 
                key={chef._id} 
                className="w-40 mr-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                onPress={() => router.push(`/(customer)/chef/${chef._id}`)}
              >
                <Image 
                  source={{ uri: chef.kitchenImage || 'https://via.placeholder.com/150' }} 
                  className="w-full h-28 bg-gray-200"
                  resizeMode="cover"
                />
                <View className="p-3">
                  <Text className="font-bold text-text-primary mb-1" numberOfLines={1}>{chef.businessName || chef.name}</Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="star" size={12} color="#FF8F00" />
                    <Text className="text-xs font-semibold ml-1">{chef.rating || '4.5'}</Text>
                    <Text className="text-xs text-text-secondary ml-1">({chef.numReviews || 0})</Text>
                  </View>
                  <Text className="text-xs text-text-secondary" numberOfLines={1}>
                    {chef.description || 'North Indian, Thali'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Offer Banner */}
        {offers.length > 0 && (
          <TouchableOpacity 
            className="mx-4 mb-6"
            onPress={() => router.push('/(customer)/offers')}
          >
            <View className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex-row items-center">
              <View className="flex-1">
                <Text className="text-accent font-bold mb-1">FLAT ₹{offers[0].discountFlat || offers[0].discountPercentage + '%'} OFF</Text>
                <Text className="text-xs text-text-secondary">Use Code: {offers[0].code}</Text>
              </View>
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center">
                <Ionicons name="pricetag" size={20} color="#FF8F00" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
