import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OffersScreen() {
  const offers = [
    {
      id: '1',
      title: 'FIRST ORDER',
      desc: 'Flat ₹100 OFF on your first order',
      code: 'FIRST100',
      bgColor: 'bg-orange-50',
      textColor: 'text-accent',
      borderColor: 'border-orange-100',
      icon: 'restaurant'
    },
    {
      id: '2',
      title: 'CHEF 20',
      desc: '20% OFF on orders above ₹250',
      code: 'CHEF20',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-100',
      icon: 'fast-food'
    },
    {
      id: '3',
      title: 'FREESHIP',
      desc: 'FREE Delivery on orders above ₹199',
      code: 'FREESHIP',
      bgColor: 'bg-green-50',
      textColor: 'text-primary',
      borderColor: 'border-green-100',
      icon: 'bicycle'
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-background p-4">
        {offers.map((offer) => (
          <View key={offer.id} className={`${offer.bgColor} rounded-xl p-5 mb-4 border ${offer.borderColor} shadow-sm relative overflow-hidden`}>
            
            {/* Background Icon Decoration */}
            <View className="absolute -right-4 -bottom-4 opacity-10">
              <Ionicons name={offer.icon as any} size={100} color="#000" />
            </View>

            <Text className={`text-xs font-bold tracking-wider mb-2 ${offer.textColor}`}>{offer.title}</Text>
            <Text className="text-xl font-bold text-text-primary mb-4 w-3/4">{offer.desc}</Text>
            
            <View className="flex-row items-center">
              <Text className="text-sm text-text-secondary mr-2">Use Code:</Text>
              <View className="bg-white px-3 py-1 rounded border border-gray-200 border-dashed">
                <Text className="font-bold text-text-primary tracking-widest">{offer.code}</Text>
              </View>
              <TouchableOpacity className="ml-auto bg-white/50 px-4 py-2 rounded-full">
                <Text className={`font-bold ${offer.textColor}`}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-text-secondary mt-3">T&C Apply</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
