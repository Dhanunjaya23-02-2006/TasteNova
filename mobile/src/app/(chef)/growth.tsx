import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function GrowthScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background p-4">
        
        <View className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-white text-lg font-bold mb-2">Boost Your Sales!</Text>
          <Text className="text-blue-100 text-sm mb-4">
            Participate in upcoming TasteNova campaigns and run offers to get more visibility.
          </Text>
          <TouchableOpacity className="bg-white px-4 py-2 rounded-full self-start">
            <Text className="text-blue-700 font-bold">Explore Campaigns</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-text-primary mb-4">Marketing Tools</Text>

        <View className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-12 h-12 bg-orange-50 rounded-full items-center justify-center mr-4">
              <Ionicons name="pricetag" size={24} color="#FF8F00" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-text-primary">Create Offers</Text>
              <Text className="text-sm text-text-secondary mt-1">Offer discounts to attract new customers.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
              <Ionicons name="megaphone" size={24} color="#2E7D32" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-text-primary">Sponsored Listing</Text>
              <Text className="text-sm text-text-secondary mt-1">Appear at the top of search results.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mr-4">
              <Ionicons name="gift" size={24} color="#7B1FA2" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-text-primary">Refer & Earn</Text>
              <Text className="text-sm text-text-secondary mt-1">Invite other chefs and earn bonuses.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-text-primary mb-4">Learn & Grow</Text>
        <View className="space-y-4 mb-6">
          <TouchableOpacity className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-row">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop' }} className="w-32 h-24" />
            <View className="p-3 flex-1 justify-center">
              <Text className="font-bold text-text-primary text-sm mb-1">How to optimize your menu for higher sales</Text>
              <Text className="text-xs text-primary font-semibold">Read Article</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm flex-row mb-6">
            <Image source={{ uri: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?q=80&w=1974&auto=format&fit=crop' }} className="w-32 h-24" />
            <View className="p-3 flex-1 justify-center">
              <Text className="font-bold text-text-primary text-sm mb-1">Packaging best practices for fresh delivery</Text>
              <Text className="text-xs text-primary font-semibold">Watch Video</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
