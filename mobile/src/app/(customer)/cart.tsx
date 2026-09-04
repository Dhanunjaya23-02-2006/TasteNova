import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const router = useRouter();
  
  const [items, setItems] = useState([
    { id: '1', name: 'Paneer Butter Masala', details: 'Spicy • Extra Paneer', price: 200, qty: 1, image: 'https://via.placeholder.com/150' },
    { id: '2', name: 'Jeera Rice', details: '', price: 90, qty: 1, image: 'https://via.placeholder.com/150' }
  ]);

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const itemTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const deliveryFee = 20;
  const platformFee = 10;
  const toPay = itemTotal + deliveryFee + platformFee;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          {items.map((item, index) => (
            <View key={item.id} className={`flex-row mb-4 ${index !== items.length - 1 ? 'border-b border-gray-100 pb-4' : ''}`}>
              <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg bg-gray-200" />
              <View className="ml-3 flex-1">
                <View className="flex-row justify-between items-start">
                  <Text className="font-bold text-text-primary text-base flex-1">{item.name}</Text>
                  <Text className="font-bold text-text-primary">₹{item.price * item.qty}</Text>
                </View>
                {item.details ? <Text className="text-xs text-text-secondary mt-1">{item.details}</Text> : null}
                
                <View className="flex-row items-center border border-gray-200 rounded-lg self-end mt-2">
                  <TouchableOpacity className="px-3 py-1" onPress={() => updateQty(item.id, -1)}>
                    <Ionicons name="remove" size={16} color="#1A1A1A" />
                  </TouchableOpacity>
                  <Text className="text-sm font-bold w-6 text-center">{item.qty}</Text>
                  <TouchableOpacity className="px-3 py-1" onPress={() => updateQty(item.id, 1)}>
                    <Ionicons name="add" size={16} color="#2E7D32" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon */}
        <View className="flex-row items-center bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-6">
          <Ionicons name="pricetag-outline" size={20} color="#1A1A1A" />
          <TextInput 
            className="flex-1 ml-3 text-base"
            placeholder="Apply Coupon"
          />
          <TouchableOpacity>
            <Text className="text-primary font-bold">Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Details */}
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <Text className="font-bold text-text-primary mb-4">Bill Details</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary">Item Total</Text>
            <Text className="text-text-primary">₹{itemTotal}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary">Delivery Charges</Text>
            <Text className="text-text-primary">₹{deliveryFee}</Text>
          </View>
          <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-100">
            <Text className="text-text-secondary">Platform Fee</Text>
            <Text className="text-text-primary">₹{platformFee}</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="font-bold text-lg text-text-primary">To Pay</Text>
            <Text className="font-bold text-lg text-text-primary">₹{toPay}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white p-4 border-t border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-text-secondary">To Pay</Text>
          <Text className="text-2xl font-bold text-text-primary">₹{toPay}</Text>
        </View>
        <TouchableOpacity 
          className="bg-primary-dark px-8 py-4 rounded-xl items-center"
          onPress={() => router.push('/(customer)/checkout')}
        >
          <Text className="text-white text-lg font-bold">Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
