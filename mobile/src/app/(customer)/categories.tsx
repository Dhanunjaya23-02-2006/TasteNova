import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

export default function CategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Mock data matching the reference image since we might not have the actual categories endpoint configured exactly this way yet
      const mockCategories = [
        { id: '1', name: 'Biryani', image: 'https://via.placeholder.com/80?text=Biryani' },
        { id: '2', name: 'North Indian', image: 'https://via.placeholder.com/80?text=North' },
        { id: '3', name: 'South Indian', image: 'https://via.placeholder.com/80?text=South' },
        { id: '4', name: 'Chinese', image: 'https://via.placeholder.com/80?text=Chinese' },
        { id: '5', name: 'Snacks', image: 'https://via.placeholder.com/80?text=Snacks' },
        { id: '6', name: 'Thalis', image: 'https://via.placeholder.com/80?text=Thalis' },
        { id: '7', name: 'Desserts', image: 'https://via.placeholder.com/80?text=Dessert' },
        { id: '8', name: 'Beverages', image: 'https://via.placeholder.com/80?text=Drink' },
      ];
      setCategories(mockCategories);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Categories',
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F5F5F5' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="px-2 py-1">
              <Ionicons name="chevron-back" size={28} color="#2E7D32" />
            </TouchableOpacity>
          )
        }} 
      />
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                className="w-[23%] items-center mb-6"
                activeOpacity={0.7}
                onPress={() => console.log('Navigate to category', category.name)}
              >
                <View className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 items-center justify-center mb-2 overflow-hidden">
                   <Image 
                     source={{ uri: category.image }} 
                     className="w-12 h-12 rounded-full"
                     resizeMode="cover"
                   />
                </View>
                <Text className="text-xs font-medium text-text-primary text-center leading-tight">
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-lg font-bold text-text-primary mt-4 mb-4">Popular Right Now</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4 pb-8">
            {[1, 2, 3].map((item) => (
              <TouchableOpacity 
                key={item} 
                className="w-48 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mr-4"
                activeOpacity={0.8}
              >
                <View className="h-32 bg-gray-200">
                  <Image 
                    source={{ uri: 'https://via.placeholder.com/200x150?text=Food' }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="p-3">
                  <Text className="text-sm font-bold text-text-primary mb-1" numberOfLines={1}>Chicken Biryani</Text>
                  <Text className="text-xs text-text-secondary mb-2" numberOfLines={1}>Lakshmi Home Foods</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-bold text-primary">₹199</Text>
                    <View className="flex-row items-center bg-green-50 px-2 py-0.5 rounded">
                      <Ionicons name="star" size={10} color="#2E7D32" />
                      <Text className="text-xs font-bold text-primary ml-1">4.8</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
