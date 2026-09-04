import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CheckoutScreen() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
        
        {/* Delivery Address */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-text-primary text-base">Delivery Address</Text>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Change</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-start">
            <Ionicons name="home" size={20} color="#1A1A1A" />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-text-primary mb-1">Home</Text>
              <Text className="text-sm text-text-secondary leading-5">
                Gachibowli, Hyderabad, Telangana 500032
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Instructions */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex-row justify-between items-center">
          <Text className="font-bold text-text-primary">Delivery Instructions</Text>
          <View className="flex-row items-center">
            <Text className="text-text-secondary mr-2">Leave at the door</Text>
            <Ionicons name="chevron-down" size={16} color="#666666" />
          </View>
        </View>

        {/* Payment Summary */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-text-primary mb-4 text-base">Payment Summary</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary">Item Total</Text>
            <Text className="text-text-primary">₹290</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary">Delivery Charges</Text>
            <Text className="text-text-primary">₹20</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-100">
            <Text className="text-text-secondary">Platform Fee</Text>
            <Text className="text-text-primary">₹10</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="font-bold text-lg text-text-primary">To Pay</Text>
            <Text className="font-bold text-lg text-text-primary">₹320</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-text-primary text-base">Payment Method</Text>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Change</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="card" size={20} color="#1A1A1A" />
              <Text className="font-bold text-text-primary ml-3">UPI</Text>
              <Text className="text-text-secondary ml-2">**** 1234</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white p-4 border-t border-gray-100">
        <TouchableOpacity 
          className="bg-primary-dark w-full py-4 rounded-xl items-center"
          onPress={() => router.push('/(customer)/order-placed')}
        >
          <Text className="text-white text-lg font-bold">Place Order (₹320)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
