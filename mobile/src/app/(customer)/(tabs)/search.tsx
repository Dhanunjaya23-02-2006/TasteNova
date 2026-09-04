import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const recentSearches = ['Paneer Curry', 'Chicken Biryani', 'Masala Dosa', 'Pulao'];
  const popularSearches = ['North Indian', 'South Indian', 'Biryani', 'Thali', 'Healthy Food', 'Desserts'];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-background rounded-xl p-3 border border-gray-200">
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            className="flex-1 ml-2 text-base text-text-primary"
            placeholder="Search food, chefs, cuisines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 bg-surface p-4">
        {/* Recent Searches */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-text-secondary mb-3">Recent Searches</Text>
          <View className="flex-row flex-wrap">
            {recentSearches.map((item, index) => (
              <TouchableOpacity key={index} className="bg-background px-4 py-2 rounded-full mr-2 mb-2 border border-gray-200">
                <Text className="text-text-primary">{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Searches */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-text-secondary mb-3">Popular Searches</Text>
          {popularSearches.map((item, index) => (
            <TouchableOpacity key={index} className="flex-row items-center py-3 border-b border-gray-100">
              <Ionicons name="search-outline" size={18} color="#666666" />
              <Text className="ml-3 text-text-primary text-base flex-1">{item}</Text>
              <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
