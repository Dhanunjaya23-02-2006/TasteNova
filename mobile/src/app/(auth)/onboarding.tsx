import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center p-6">
        {/* Placeholder for Illustration */}
        <View className="w-64 h-64 bg-background rounded-full mb-10 items-center justify-center">
          <Text className="text-4xl">🍲</Text>
        </View>

        <Text className="text-3xl font-bold text-text-primary text-center mb-4">
          Home-cooked with love, delivered to you
        </Text>

        <Text className="text-base text-text-secondary text-center mb-12">
          Delicious, hygienic & made with the finest ingredients by passionate home chefs.
        </Text>

        <View className="w-full space-y-4">
          <TouchableOpacity
            className="w-full bg-primary-dark py-4 rounded-xl items-center"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-white text-lg font-semibold">Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-4 rounded-xl items-center"
            onPress={() => router.push('/(customer)/location')}
          >
            <Text className="text-primary-dark text-lg font-semibold">Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
