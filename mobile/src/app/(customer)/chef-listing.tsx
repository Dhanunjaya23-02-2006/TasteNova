import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ChefListingScreen() {
  const router = useRouter();
  
  const dummyChefs = [
    { id: '1', name: "Priya's Kitchen", cuisines: "North Indian, Thali", rating: 4.8, reviews: 320, distance: '1.5 km', time: '30-40 mins', image: 'https://via.placeholder.com/150' },
    { id: '2', name: "Anita Home Kitchen", cuisines: "South Indian, Snacks", rating: 4.7, reviews: 180, distance: '2.1 km', time: '25-35 mins', image: 'https://via.placeholder.com/150' },
    { id: '3', name: "Homely Meals", cuisines: "Thali, North Indian", rating: 4.6, reviews: 150, distance: '2.3 km', time: '30-45 mins', image: 'https://via.placeholder.com/150' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row space-x-3">
        <TouchableOpacity className="bg-primary px-4 py-2 rounded-full">
          <Text className="text-white font-semibold">All</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-background px-4 py-2 rounded-full border border-gray-200">
          <Text className="text-text-primary">Top Rated</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-background px-4 py-2 rounded-full border border-gray-200">
          <Text className="text-text-primary">Near Me</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-background p-4">
        {dummyChefs.map((chef) => (
          <TouchableOpacity 
            key={chef.id}
            className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100 flex-row"
            onPress={() => router.push(`/(customer)/chef/${chef.id}`)}
          >
            <Image source={{ uri: chef.image }} className="w-24 h-24 rounded-lg bg-gray-200" />
            <View className="ml-4 flex-1 justify-center">
              <View className="flex-row justify-between items-start">
                <Text className="font-bold text-text-primary text-base flex-1" numberOfLines={1}>{chef.name}</Text>
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={20} color="#666666" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={14} color="#FF8F00" />
                <Text className="text-xs font-semibold ml-1">{chef.rating}</Text>
                <Text className="text-xs text-text-secondary ml-1">({chef.reviews}) • {chef.distance}</Text>
              </View>
              <Text className="text-xs text-text-secondary mt-1">{chef.cuisines}</Text>
              <Text className="text-xs text-text-primary font-medium mt-1">{chef.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
