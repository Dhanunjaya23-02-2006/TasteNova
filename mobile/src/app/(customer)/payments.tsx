import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Payment Methods',
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
      
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        
        <Text className="text-sm font-semibold text-text-secondary uppercase ml-2 mb-2">Saved Cards</Text>
        
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <View className="flex-row p-4 items-center border-b border-gray-100">
            <View className="w-12 h-8 rounded bg-blue-50 border border-blue-100 items-center justify-center mr-4">
              <Text className="text-blue-800 font-bold italic text-xs">VISA</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-text-primary">•••• •••• •••• 4242</Text>
              <Text className="text-xs text-text-secondary">Expires 12/28</Text>
            </View>
            <TouchableOpacity className="p-2">
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="flex-row p-4 items-center" activeOpacity={0.7}>
            <View className="w-10 h-10 rounded-full bg-primary-light/10 items-center justify-center mr-4">
              <Ionicons name="add" size={24} color="#2E7D32" />
            </View>
            <Text className="text-base font-semibold text-primary">Add New Card</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-semibold text-text-secondary uppercase ml-2 mb-2 mt-2">Other Options</Text>
        
        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-8">
          <TouchableOpacity className="flex-row p-4 items-center border-b border-gray-100" activeOpacity={0.7}>
            <View className="w-10 h-10 rounded bg-orange-50 items-center justify-center mr-4">
              <Ionicons name="cash-outline" size={20} color="#FF9500" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-text-primary">Cash on Delivery</Text>
              <Text className="text-xs text-text-secondary">Pay at doorstep</Text>
            </View>
            <View className="w-6 h-6 rounded-full border-2 border-primary items-center justify-center">
               <View className="w-3 h-3 rounded-full bg-primary" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row p-4 items-center" activeOpacity={0.7}>
            <View className="w-10 h-10 rounded bg-indigo-50 items-center justify-center mr-4">
              <Ionicons name="qr-code-outline" size={20} color="#5856D6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-text-primary">UPI</Text>
              <Text className="text-xs text-text-secondary">Google Pay, PhonePe, Paytm</Text>
            </View>
            <View className="w-6 h-6 rounded-full border-2 border-gray-300" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
