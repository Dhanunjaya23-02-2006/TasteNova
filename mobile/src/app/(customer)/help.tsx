import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  const router = useRouter();

  const helpTopics = [
    { id: 1, title: 'Order Related', desc: 'Delivery, cancellation, refunds', icon: 'cube-outline' },
    { id: 2, title: 'Payment Related', desc: 'Payments, failure, refund status', icon: 'card-outline' },
    { id: 3, title: 'Account Related', desc: 'Profile, addresses, KYC', icon: 'person-outline' },
    { id: 4, title: 'General Queries', desc: 'Offers, other help', icon: 'information-circle-outline' },
  ];

  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Help & Support',
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
        
        <Text className="text-xl font-bold text-text-primary mb-1">How can we help you?</Text>
        <Text className="text-sm text-text-secondary mb-6">Select a topic below to get quick answers.</Text>

        <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          {helpTopics.map((topic, index) => (
            <TouchableOpacity 
              key={topic.id}
              className={`flex-row p-4 items-center ${index !== helpTopics.length - 1 ? 'border-b border-gray-100' : ''}`}
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full bg-primary-light/10 items-center justify-center mr-4">
                <Ionicons name={topic.icon as any} size={22} color="#2E7D32" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-text-primary">{topic.title}</Text>
                <Text className="text-xs text-text-secondary mt-0.5">{topic.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-semibold text-text-secondary uppercase ml-2 mb-2">Still need help?</Text>

        <TouchableOpacity 
          className="bg-primary rounded-xl p-4 flex-row items-center shadow-sm mb-4"
          activeOpacity={0.8}
        >
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4">
            <Ionicons name="chatbubbles" size={20} color="#FFF" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base">Chat with us</Text>
            <Text className="text-white/80 text-xs mt-0.5">We're online to help you</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white rounded-xl p-4 flex-row items-center border border-gray-100 shadow-sm mb-8"
          activeOpacity={0.8}
          onPress={handleCall}
        >
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-4">
            <Ionicons name="call" size={20} color="#2E7D32" />
          </View>
          <View className="flex-1">
            <Text className="text-text-primary font-bold text-base">Call us</Text>
            <Text className="text-text-secondary text-xs mt-0.5">+91 98765 43210 (10 AM - 10 PM)</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
