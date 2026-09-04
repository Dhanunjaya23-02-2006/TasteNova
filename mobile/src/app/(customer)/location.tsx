import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LocationScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const recentLocations = [
    { title: 'Home', area: 'Gachibowli, Hyderabad, Telangana' },
    { title: 'Work', area: 'Madhapur, Hyderabad, Telangana' },
    { title: 'Other', area: 'Jubilee Hills, Hyderabad, Telangana' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="p-4 bg-white border-b border-gray-100 flex-1">
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-background rounded-xl p-3 border border-gray-200 mb-4">
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            className="flex-1 ml-3 text-base text-text-primary"
            placeholder="Search area, street..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <TouchableOpacity className="flex-row items-center py-3 mb-6 border-b border-gray-100">
          <Ionicons name="locate" size={20} color="#2E7D32" />
          <Text className="ml-3 text-primary font-bold text-base">Use current location</Text>
        </TouchableOpacity>

        <Text className="text-sm font-bold text-text-secondary mb-4">Recent Locations</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {recentLocations.map((loc, index) => (
            <TouchableOpacity 
              key={index} 
              className="flex-row items-center py-4 border-b border-gray-100"
              onPress={() => router.back()}
            >
              <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-200">
                <Ionicons name={loc.title === 'Home' ? 'home' : loc.title === 'Work' ? 'briefcase' : 'location'} size={18} color="#666666" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-bold text-text-primary mb-1">{loc.title}</Text>
                <Text className="text-sm text-text-secondary">{loc.area}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="p-4 bg-white border-t border-gray-100">
        <TouchableOpacity 
          className="w-full bg-primary-dark py-4 rounded-xl items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white text-lg font-bold">Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
