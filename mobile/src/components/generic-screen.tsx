import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function GenericScreen({ title }: { title?: string }) {
  const router = useRouter();
  
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="construct-outline" size={64} color="#CCCCCC" />
        <Text className="text-xl font-bold text-text-primary mt-4">
          {title || 'Under Construction'}
        </Text>
        <Text className="text-base text-text-secondary mt-2 text-center">
          This screen is currently being built. Check back later!
        </Text>
        <TouchableOpacity 
          className="mt-8 bg-primary px-6 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
