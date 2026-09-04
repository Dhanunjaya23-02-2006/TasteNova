import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PlansScreen() {
  const plans = [
    {
      id: 1,
      name: 'Basic Plan',
      price: 'Free',
      features: ['Up to 50 orders/month', 'Standard Support', 'Basic Analytics'],
      recommended: false,
    },
    {
      id: 2,
      name: 'Pro Plan',
      price: '₹999/mo',
      features: ['Unlimited orders', 'Priority Support', 'Advanced Analytics', 'Sponsored Listings'],
      recommended: true,
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['bottom', 'left', 'right']}>
      <ScrollView className="flex-1 bg-background p-4">
        
        <View className="mb-8 items-center">
          <Text className="text-2xl font-bold text-text-primary text-center mb-2">
            Upgrade Your Kitchen
          </Text>
          <Text className="text-text-secondary text-center px-4">
            Get access to premium features to scale your business faster.
          </Text>
        </View>

        {plans.map((plan) => (
          <View 
            key={plan.id}
            className={`bg-white p-6 rounded-2xl mb-6 shadow-sm border-2 ${plan.recommended ? 'border-primary' : 'border-gray-100'}`}
          >
            {plan.recommended && (
              <View className="absolute top-0 right-0 bg-primary px-3 py-1 rounded-bl-xl rounded-tr-xl">
                <Text className="text-white text-xs font-bold uppercase tracking-wider">Recommended</Text>
              </View>
            )}
            
            <Text className="text-xl font-bold text-text-primary mb-1">{plan.name}</Text>
            <Text className="text-3xl font-black text-primary mb-6">{plan.price}</Text>

            <View className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <View key={idx} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
                  <Text className="text-text-secondary ml-3 flex-1">{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              className={`py-4 rounded-xl items-center ${plan.recommended ? 'bg-primary' : 'bg-gray-100'}`}
            >
              <Text className={`font-bold text-lg ${plan.recommended ? 'text-white' : 'text-text-primary'}`}>
                {plan.price === 'Free' ? 'Current Plan' : 'Subscribe Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
